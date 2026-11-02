import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, ExternalLink, X, Delete } from 'lucide-react';
import { UssdDialogState, SmsReceiptState } from '../types';
import { phoneSound } from '../utils/audio';

interface UssdDialogProps {
  isRunning: boolean;
  dialogState: UssdDialogState | null;
  smsReceipt: SmsReceiptState | null;
  onSendReply: (reply: string) => void;
  onCancel: () => void;
  onCloseReceipt: () => void;
  lang?: 'ar' | 'en';
}

export const UssdDialog: React.FC<UssdDialogProps> = ({
  isRunning,
  dialogState,
  smsReceipt,
  onSendReply,
  onCancel,
  onCloseReceipt,
  lang = 'ar',
}) => {
  const [inputVal, setInputVal] = useState('');
  const isRtl = lang === 'ar';

  // Reset input when dialog changes
  useEffect(() => {
    if (dialogState?.isOpen) {
      setInputVal(dialogState.inputValue || '');
    }
  }, [dialogState]);

  // Support hardware/physical keyboard typing
  useEffect(() => {
    if (!dialogState?.isOpen || !dialogState?.inputPrompt) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        phoneSound.playTapClick();
        setInputVal((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        phoneSound.playTapClick();
        setInputVal((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState, inputVal]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    phoneSound.playTapClick();
    onSendReply(inputVal);
    setInputVal('');
  };

  const handleKeypadPress = (digit: string) => {
    phoneSound.playTapClick();
    setInputVal((prev) => prev + digit);
  };

  const handleKeypadBackspace = () => {
    phoneSound.playTapClick();
    setInputVal((prev) => prev.slice(0, -1));
  };

  // Play notification sound when SMS arrives (NO confetti!)
  useEffect(() => {
    if (smsReceipt && smsReceipt.isOpen) {
      phoneSound.playNotificationTone();
    }
  }, [smsReceipt]);

  return (
    <>
      {/* 1. "USSD code running..." Toast at bottom (Exact replica of frame 01:05 & 01:14!) */}
      {isRunning && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-end justify-center pb-20 px-6 animate-fade-in pointer-events-auto">
          <div className="bg-zinc-900/95 border border-zinc-700/70 text-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs font-medium font-sans">
              USSD code running...
            </span>
          </div>
        </div>
      )}

      {/* 2. Authentic Android System USSD Dialog + On-Screen Numeric Keyboard (Exact Match from video 01:07 - 01:13!) */}
      {dialogState && dialogState.isOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col justify-between animate-fade-in select-none">
          {/* Top/Middle Area with Dialog Box */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="w-full max-w-[325px] bg-[#222326] border border-zinc-700/60 rounded-2xl shadow-2xl p-5 text-white flex flex-col"
              dir="ltr"
            >
              {/* Message text inside dialog */}
              <div
                className="text-[13.5px] leading-relaxed whitespace-pre-line text-zinc-100 font-normal pb-3 text-start"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {dialogState.message}
              </div>

              {/* Input field showing digits with blinking cursor */}
              {dialogState.inputPrompt && (
                <div className="w-full mt-1 mb-4">
                  <div className="w-full min-h-[38px] border-b border-zinc-500/80 pb-1 px-1 flex items-center justify-between">
                    <span className="text-base text-white tracking-widest font-mono">
                      {inputVal || (
                        <span className="text-zinc-500 font-sans text-xs">
                          {isRtl ? 'أدخل الرقم السري' : 'Enter PIN'}
                        </span>
                      )}
                    </span>
                    <span className="w-0.5 h-4 bg-emerald-400 animate-pulse ms-0.5" />
                  </div>
                </div>
              )}

              {/* Action buttons: Cancel on Left, Send on Right as in video frame 01:07! */}
              <div className="flex items-center justify-end gap-5 pt-1 text-sm font-semibold tracking-wide">
                <button
                  type="button"
                  onClick={() => {
                    phoneSound.playTapClick();
                    onCancel();
                  }}
                  className="text-zinc-300 hover:text-white active:scale-95 transition-transform cursor-pointer py-1 px-2"
                >
                  Cancel
                </button>

                {dialogState.inputPrompt ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="text-emerald-400 hover:text-emerald-300 active:scale-95 transition-transform cursor-pointer font-bold py-1 px-2"
                  >
                    Send
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      phoneSound.playTapClick();
                      onCancel();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 active:scale-95 transition-transform cursor-pointer font-bold py-1 px-2"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DOCKED ON-SCREEN NUMERIC KEYBOARD (Frame 01:08 - 01:12!) */}
          {dialogState.inputPrompt && (
            <div
              dir="ltr"
              className="w-full bg-[#161719] border-t border-zinc-800/80 pt-2 pb-5 px-3 z-50 shrink-0 shadow-2xl animate-slide-up"
            >
              {/* Keyboard Grid 3x4 */}
              <div className="grid grid-cols-3 gap-2 max-w-[340px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-lg bg-[#27282c] hover:bg-[#34353a] active:bg-[#42444c] active:scale-95 text-white font-medium text-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  >
                    {digit}
                  </button>
                ))}

                {/* Bottom row: [empty/dot] [ 0 ] [ backspace ⌫ ] */}
                <div className="h-12 rounded-lg flex items-center justify-center text-zinc-500">
                  <span className="text-lg">•</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-lg bg-[#27282c] hover:bg-[#34353a] active:bg-[#42444c] active:scale-95 text-white font-medium text-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-12 rounded-lg bg-[#202124] hover:bg-[#2c2d32] active:bg-[#393a40] active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <Delete className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Authentic Android Heads-Up Push Notification Card (Exact match of frame 01:17!) */}
      {smsReceipt && smsReceipt.isOpen && (
        <div
          className="fixed top-3 left-3 right-3 max-w-[370px] mx-auto z-50 animate-slide-down select-none pointer-events-auto"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Notification Banner Container */}
          <div className="w-full bg-[#202124] border border-zinc-700/70 rounded-2xl shadow-2xl p-4 text-white flex flex-col gap-2.5 backdrop-blur-md">
            {/* Notification Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-[13px] text-white tracking-wide">
                  {smsReceipt.sender}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {isRtl ? 'الآن' : 'now'}
                </span>
              </div>

              <button
                onClick={() => {
                  phoneSound.playTapClick();
                  onCloseReceipt();
                }}
                className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isRtl ? 'إغلاق الإشعار' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Message Body (Frame 01:17) */}
            <div className="text-[12.5px] text-zinc-200 leading-relaxed whitespace-pre-line font-sans px-0.5">
              {smsReceipt.body}
            </div>

            {/* Link if present (http://vf.eg/vfcash) */}
            {smsReceipt.url && (
              <a
                href={smsReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 underline px-0.5 pt-0.5"
                dir="ltr"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{smsReceipt.url}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};
