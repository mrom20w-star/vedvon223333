import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Grid, UserPlus, Video, Pause } from 'lucide-react';
import { phoneSound } from '../utils/audio';

interface CallScreenProps {
  number: string;
  name?: string;
  avatarColor?: string;
  sim: 'Vodafone' | 'Orange EG';
  onEndCall: (durationSeconds: number) => void;
  lang?: 'ar' | 'en';
}

export const CallScreen: React.FC<CallScreenProps> = ({
  number,
  name,
  avatarColor,
  sim,
  onEndCall,
  lang = 'ar',
}) => {
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showInCallKeypad, setShowInCallKeypad] = useState(false);

  const isRtl = lang === 'ar';

  useEffect(() => {
    // Start ringback tone
    phoneSound.playRingbackTone();

    const connectTimer = setTimeout(() => {
      phoneSound.stopRingbackTone();
      setCallState('connected');
    }, 2800);

    return () => {
      phoneSound.stopRingbackTone();
      clearTimeout(connectTimer);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (callState === 'connected' && !isOnHold) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState, isOnHold]);

  const handleEnd = () => {
    phoneSound.stopRingbackTone();
    phoneSound.playHangupTone();
    onEndCall(seconds);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayName = name || number;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black z-40 flex flex-col justify-between py-10 px-6 text-white select-none">
      {/* Top Details */}
      <div className="flex flex-col items-center mt-6 text-center">
        {/* SIM Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 mb-5">
          <span
            className={`w-2 h-2 rounded-full ${
              sim === 'Vodafone' ? 'bg-red-500' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium text-zinc-300">
            {isRtl ? `عبر ${sim}` : `Calling via ${sim}`}
          </span>
        </div>

        {/* Avatar with pulsing halo rings */}
        <div className="relative mb-4 flex items-center justify-center">
          {callState === 'calling' && (
            <div className="absolute w-28 h-28 rounded-full border border-emerald-500/40 animate-ping opacity-75" />
          )}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl shadow-2xl bg-gradient-to-tr ${
              avatarColor || 'from-emerald-600 to-teal-800'
            }`}
          >
            {initial}
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{displayName}</h2>
        <span className="text-sm font-mono text-zinc-400" dir="ltr">
          {number}
        </span>

        {/* Call Status / Timer */}
        <div className="mt-3">
          {callState === 'calling' ? (
            <span className="text-xs text-emerald-400 font-medium animate-pulse">
              {isRtl ? 'جاري الاتصال...' : 'Calling...'}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-mono text-zinc-300">{formatTimer(seconds)}</span>
            </div>
          )}
        </div>
      </div>

      {/* In-Call Keypad (if opened) */}
      {showInCallKeypad && (
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto py-2 bg-zinc-950/90 rounded-2xl p-3 border border-zinc-800">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              onClick={() => phoneSound.playDtmf(k)}
              className="py-2 text-center text-lg font-light text-white hover:bg-zinc-800 rounded-lg active:scale-90 transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {/* In-call Action Buttons Grid */}
      <div className="grid grid-cols-3 gap-y-6 gap-x-4 max-w-[300px] mx-auto w-full mb-8">
        {/* Mute */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            setIsMuted(!isMuted);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            isMuted ? 'text-rose-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-rose-950/80 border border-rose-600' : 'bg-zinc-800/80 hover:bg-zinc-700/80'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'كتم' : 'Mute'}</span>
        </button>

        {/* Keypad */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            setShowInCallKeypad(!showInCallKeypad);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            showInCallKeypad ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              showInCallKeypad
                ? 'bg-emerald-950/80 border border-emerald-600'
                : 'bg-zinc-800/80 hover:bg-zinc-700/80'
            }`}
          >
            <Grid className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'لوحة المفاتيح' : 'Keypad'}</span>
        </button>

        {/* Speaker */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            setIsSpeaker(!isSpeaker);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            isSpeaker ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isSpeaker
                ? 'bg-emerald-950/80 border border-emerald-600'
                : 'bg-zinc-800/80 hover:bg-zinc-700/80'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'مكبر الصوت' : 'Speaker'}</span>
        </button>

        {/* Add Call */}
        <button
          onClick={() => phoneSound.playTapClick()}
          className="flex flex-col items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
        >
          <div className="w-14 h-14 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 flex items-center justify-center transition-colors">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'إضافة' : 'Add'}</span>
        </button>

        {/* Hold */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            setIsOnHold(!isOnHold);
          }}
          className={`flex flex-col items-center gap-1.5 cursor-pointer ${
            isOnHold ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isOnHold
                ? 'bg-amber-950/80 border border-amber-600'
                : 'bg-zinc-800/80 hover:bg-zinc-700/80'
            }`}
          >
            <Pause className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'تعليق' : 'Hold'}</span>
        </button>

        {/* Video */}
        <button
          onClick={() => phoneSound.playTapClick()}
          className="flex flex-col items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white"
        >
          <div className="w-14 h-14 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 flex items-center justify-center transition-colors">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium">{isRtl ? 'فيديو' : 'Video'}</span>
        </button>
      </div>

      {/* End Call Button */}
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-xl transition-all cursor-pointer group"
        >
          <PhoneOff className="w-7 h-7 stroke-[2.2] group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
