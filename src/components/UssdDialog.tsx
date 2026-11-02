import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MessageSquare, ExternalLink, X } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isRtl = lang === 'ar';

  // Reset and focus input when dialog opens
  useEffect(() => {
    if (dialogState?.isOpen) {
      setInputVal(dialogState.inputValue || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [dialogState]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    phoneSound.playTapClick();
    onSendReply(inputVal);
    setInputVal('');
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

      {/* 2. Authentic Android System USSD Dialog (Exact Match from video 01:07!)
             User types the password with their own hand directly into the input */}
      {dialogState && dialogState.isOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in select-none">
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

            {/* Natural Input field - user types with their hand/keyboard */}
            {dialogState.inputPrompt && (
              <form onSubmit={handleSubmit} className="w-full mt-1 mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={isRtl ? 'أدخل الرقم السري' : 'Enter PIN'}
                  className="w-full bg-transparent border-b border-zinc-500/80 focus:border-emerald-400 py-1.5 px-1 text-base text-white focus:outline-none placeholder-zinc-500 font-mono tracking-widest transition-colors"
                  dir="ltr"
                />
              </form>
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

            {/* Notification Message Body (Frame 01:17: fee is 1 EGP!) */}
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
