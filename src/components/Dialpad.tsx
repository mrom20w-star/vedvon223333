import React, { useRef } from 'react';
import { UserPlus, UserCheck, MessageSquare, Delete } from 'lucide-react';
import { phoneSound } from '../utils/audio';

interface DialpadProps {
  dialedNumber: string;
  onNumberChange: (num: string) => void;
  onCall: (sim: 'Vodafone' | 'Orange EG') => void;
  onCreateContact: (phone: string) => void;
  onSaveToExisting: (phone: string) => void;
  onSendMessage: (phone: string) => void;
  lang?: 'ar' | 'en';
}

interface KeypadButton {
  digit: string;
  sub: string;
}

// 1 is top-left, 3 is top-right, * is bottom-left, # is bottom-right
const BUTTONS: KeypadButton[] = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

export const Dialpad: React.FC<DialpadProps> = ({
  dialedNumber,
  onNumberChange,
  onCall,
  onCreateContact,
  onSaveToExisting,
  onSendMessage,
  lang = 'ar',
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDigitPress = (digit: string) => {
    phoneSound.playDtmf(digit);
    onNumberChange(dialedNumber + digit);
  };

  const handleBackspace = () => {
    phoneSound.playTapClick();
    if (dialedNumber.length > 0) {
      onNumberChange(dialedNumber.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    phoneSound.playTapClick();
    onNumberChange('');
  };

  const handleZeroMouseDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      phoneSound.playDtmf('0');
      onNumberChange(dialedNumber + '+');
    }, 550);
  };

  const handleZeroMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className="flex flex-col flex-1 justify-between px-6 pb-6 pt-4 select-none max-w-md mx-auto w-full">
      {/* Top Number Display Area */}
      <div className="flex flex-col items-center justify-center min-h-[110px] w-full">
        <div className="relative w-full flex items-center justify-center min-h-[52px] mb-2">
          {dialedNumber ? (
            <>
              <span
                className="text-white text-3xl sm:text-4xl font-light tracking-wider text-center px-10 break-all max-h-24 overflow-y-auto"
                dir="ltr"
              >
                {dialedNumber}
              </span>
              <button
                onClick={handleBackspace}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleClearAll();
                }}
                title={isRtl ? 'حذف (اضغط مطولاً للمسح بالكامل)' : 'Backspace (hold to clear)'}
                className="absolute right-0 p-2 text-zinc-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
              >
                <Delete className="w-7 h-7 stroke-[1.8]" />
              </button>
            </>
          ) : (
            <span className="text-zinc-600 text-sm font-medium tracking-wide">
              {isRtl ? 'اطلب رقماً أو كود USSD...' : 'Enter number or USSD code...'}
            </span>
          )}
        </div>

        {/* 3 Quick Action Buttons beneath the dialed number (ALWAYS VISIBLE as in video!) */}
        <div className="flex items-center justify-center gap-7 sm:gap-9 mt-1 text-zinc-300 w-full">
          {/* 1. Create new contact */}
          <button
            onClick={() => onCreateContact(dialedNumber)}
            className="flex flex-col items-center gap-1 group cursor-pointer hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white bg-zinc-900/60 group-hover:bg-zinc-800 transition-colors">
              <UserPlus className="w-4 h-4 stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-normal text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'إنشاء جهة اتصال' : 'Create new contact'}
            </span>
          </button>

          {/* 2. Save to existing */}
          <button
            onClick={() => onSaveToExisting(dialedNumber)}
            className="flex flex-col items-center gap-1 group cursor-pointer hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white bg-zinc-900/60 group-hover:bg-zinc-800 transition-colors">
              <UserCheck className="w-4 h-4 stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-normal text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'إضافة لحالي' : 'Save to existing'}
            </span>
          </button>

          {/* 3. Send message (صف الرسائل المطلوب) */}
          <button
            onClick={() => onSendMessage(dialedNumber)}
            className="flex flex-col items-center gap-1 group cursor-pointer hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-white bg-zinc-900/60 group-hover:bg-zinc-800 transition-colors">
              <MessageSquare className="w-4 h-4 stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-normal text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'إرسال رسالة' : 'Send message'}
            </span>
          </button>
        </div>
      </div>

      {/* Dialpad 3x4 Grid - STRICTLY dir="ltr" so 1 is LEFT, 2 is MIDDLE, 3 is RIGHT */}
      <div
        dir="ltr"
        className="grid grid-cols-3 gap-y-4 gap-x-6 sm:gap-x-8 max-w-[340px] sm:max-w-[360px] mx-auto w-full my-auto"
      >
        {BUTTONS.map((item) => {
          const isZero = item.digit === '0';
          return (
            <button
              key={item.digit}
              type="button"
              onClick={() => {
                if (!isZero || !longPressTimerRef.current) {
                  handleDigitPress(item.digit);
                }
              }}
              onMouseDown={isZero ? handleZeroMouseDown : undefined}
              onMouseUp={isZero ? handleZeroMouseUp : undefined}
              onTouchStart={isZero ? handleZeroMouseDown : undefined}
              onTouchEnd={isZero ? handleZeroMouseUp : undefined}
              className="group relative flex flex-col items-center justify-center h-16 sm:h-18 rounded-full bg-zinc-900/70 hover:bg-zinc-800 active:bg-zinc-700/80 transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="text-2xl sm:text-3xl font-light text-zinc-100 group-hover:text-white">
                {item.digit}
              </span>
              {item.sub ? (
                <span className="text-[10px] sm:text-[11px] font-medium tracking-widest text-zinc-400 group-hover:text-zinc-300 -mt-0.5">
                  {item.sub}
                </span>
              ) : (
                <span className="h-3.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dual SIM Call Buttons Bar - STRICTLY dir="ltr" (Vodafone on Left, Orange on Right) */}
      <div
        dir="ltr"
        className="flex items-center justify-center gap-4 sm:gap-5 mt-5 pt-2 w-full max-w-[340px] sm:max-w-[360px] mx-auto"
      >
        {/* SIM 1: Vodafone */}
        <button
          onClick={() => onCall('Vodafone')}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800/80 transition-all cursor-pointer group shadow-lg"
        >
          {/* Green Call Icon with subtle red Vodafone dot */}
          <div className="relative w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-500 transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border border-zinc-900" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
              Vodafone
            </span>
            <span className="text-[10px] text-zinc-400">SIM 1</span>
          </div>
        </button>

        {/* SIM 2: Orange EG */}
        <button
          onClick={() => onCall('Orange EG')}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800/80 transition-all cursor-pointer group shadow-lg"
        >
          {/* Green Call Icon with orange dot */}
          <div className="relative w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-500 transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-zinc-900" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
              Orange EG
            </span>
            <span className="text-[10px] text-zinc-400">SIM 2</span>
          </div>
        </button>
      </div>
    </div>
  );
};
