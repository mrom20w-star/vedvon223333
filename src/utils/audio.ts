/**
 * Calibrated authentic Android / Samsung One UI dialpad sounds & notification tones
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

  /**
   * Crisp, gentle, authentic Android dialpad tone (65ms soft harmonic beep)
   */
  public playDtmf(key: string) {
    // Gentle haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }

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
      const now = this.ctx.currentTime;
      const duration = 0.075; // 75ms: crisp, pleasant Android tone

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Low-pass filter for smooth, warm mobile tone without harshness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      // Smooth envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      filter.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration + 0.01);
      osc2.stop(now + duration + 0.01);
    } catch {
      // ignore
    }
  }

  public playTapClick() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // ignore
      }
    }

    if (!this.isSoundEnabled) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }

  /**
   * Authentic Android system notification chime
   */
  public playNotificationTone() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([180, 80, 180]);
      } catch {
        // ignore
      }
    }

    if (!this.isSoundEnabled) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Gentle Android notification ping: 784Hz (G5) -> 1046.5Hz (C6)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.08);
      gain2.gain.setValueAtTime(0.001, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.095);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);
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
}

export const phoneSound = new PhoneSoundFX();
