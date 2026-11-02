/**
 * Synthesizes authentic DTMF and telephone tones using Web Audio API
 */
class PhoneSoundFX {
  private ctx: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private isSoundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(enabled?: boolean) {
    if (enabled !== undefined) {
      this.isSoundEnabled = enabled;
    } else {
      this.isSoundEnabled = !this.isSoundEnabled;
    }
    return this.isSoundEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public playDtmf(key: string, durationMs: number = 140) {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const dtmfFreqs: Record<string, [number, number]> = {
        '1': [697, 1209],
        '2': [697, 1336],
        '3': [697, 1477],
        '4': [770, 1209],
        '5': [770, 1336],
        '6': [770, 1477],
        '7': [852, 1209],
        '8': [852, 1336],
        '9': [852, 1477],
        '*': [941, 1209],
        '0': [941, 1336],
        '#': [941, 1477],
      };

      const freqs = dtmfFreqs[key];
      if (!freqs) {
        this.playTapClick();
        return;
      }

      const [f1, f2] = freqs;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(f1, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(f2, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (durationMs / 1000));

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(this.ctx.currentTime + (durationMs / 1000));
      osc2.stop(this.ctx.currentTime + (durationMs / 1000));
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  public playTapClick() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  public playRingbackTone() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopRingbackTone();

      // Standard Egyptian / UK / Euro ringback tone: 400Hz + 450Hz pulsed
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(450, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.ringOscillator = osc1;
      this.ringGain = gain;
    } catch {
      // ignore
    }
  }

  public stopRingbackTone() {
    try {
      if (this.ringOscillator) {
        this.ringOscillator.stop();
        this.ringOscillator.disconnect();
        this.ringOscillator = null;
      }
      if (this.ringGain) {
        this.ringGain.disconnect();
        this.ringGain = null;
      }
    } catch {
      // ignore
    }
  }

  public playHangupTone() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);

      // Fast beep beep beep
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.setValueAtTime(0.001, now + 0.15);
      gain.gain.setValueAtTime(0.1, now + 0.3);
      gain.gain.setValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  public playSuccessChime() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  public playNotificationTone() {
    if (!this.isSoundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Gentle Android notification ping: 784Hz (G5) -> 1046Hz (C6)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.08);
      gain2.gain.setValueAtTime(0.001, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.14, now + 0.095);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);
    } catch {
      // ignore
    }
  }
}

export const phoneSound = new PhoneSoundFX();

