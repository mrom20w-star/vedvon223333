import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ExternalLink, X, ChevronDown } from 'lucide-react';
import { UssdDialogState, SmsReceiptState } from '../types';
import { phoneSound } from '../utils/audio';
import { sendDeviceNotification, requestNotificationPermission } from '../utils/notifications';

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

  // Request system notification permission when USSD opens so real phone notification is allowed
  useEffect(() => {
    if (dialogState?.isOpen) {
      requestNotificationPermission();
      setInputVal(dialogState.inputValue || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 70);
    }
  }, [dialogState]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    phoneSound.playTapClick();
    onSendReply(inputVal);
    setInputVal('');
  };

  // Play notification tone, vibrate phone, and fire REAL NATIVE PHONE NOTIFICATION
  useEffect(() => {
    if (smsReceipt && smsReceipt.isOpen) {
      phoneSound.playNotificationTone();

      // Trigger REAL OS / Phone Notification on user's device
      sendDeviceNotification(smsReceipt.sender, smsReceipt.body, smsReceipt.url);

      // Auto dismiss on-screen banner after 8 seconds
      const timer = setTimeout(() => {
        onCloseReceipt();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [smsReceipt]);

  return (
    <>
      {/* 1. "USSD code running..." Toast at bottom (Exact replica of frame 01:05 & 01:14!) */}
      {isRunning && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-end justify-center pb-20 px-6 animate-fade-in pointer-events-auto">
          <div className="bg-[#1f2023] border border-zinc-700/60 text-zinc-100 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs font-medium font-sans">
              USSD code running...
            </span>
          </div>
        </div>
      )}

      {/* 2. Authentic Android System USSD Dialog (Exact Match from video frame 01:07!) */}
      {dialogState && dialogState.isOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div
            className="w-full max-w-[320px] bg-[#202124] border border-[#323438] rounded-3xl shadow-2xl p-5 text-white flex flex-col"
            dir="ltr"
          >
            {/* Message text inside dialog */}
            <div
              className="text-[14px] leading-relaxed whitespace-pre-line text-zinc-100 font-sans pb-3 text-start"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {dialogState.message}
            </div>

            {/* Input field - user types password directly with phone keyboard or PC */}
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
                  className="w-full bg-transparent border-b-2 border-zinc-500/80 focus:border-emerald-400 py-1.5 px-1 text-base text-white focus:outline-none placeholder-zinc-500 font-mono tracking-widest transition-colors"
                  dir="ltr"
                />
              </form>
            )}

            {/* Action buttons: Cancel & Send when inputPrompt, or single OK button when info/success */}
            <div className="flex items-center justify-end gap-5 pt-1 text-sm font-semibold tracking-wide">
              {dialogState.inputPrompt ? (
                <>
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
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="text-emerald-400 hover:text-emerald-300 active:scale-95 transition-transform cursor-pointer font-bold py-1 px-2"
                  >
                    Send
                  </button>
                </>
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

      {/* 3. Authentic Android Heads-Up Push Notification Card (Frame 01:17 in video!) */}
      {smsReceipt && smsReceipt.isOpen && (
        <div
          className="fixed top-2.5 left-2.5 right-2.5 max-w-[370px] mx-auto z-50 animate-slide-down select-none pointer-events-auto"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Notification Card Container */}
          <div className="w-full bg-[#1e1f23] border border-[#333539] rounded-2xl shadow-2xl p-3.5 text-white flex flex-col gap-2 backdrop-blur-md transition-all">
            {/* Top Row: App Icon + App Name (VF-Cash) + Time + Chevron */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Red Vodafone Cash App Icon */}
                <div className="w-5 h-5 rounded-md bg-[#e60000] flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                  </svg>
                </div>
                <span className="font-bold text-[13px] text-white tracking-wide">
                  {smsReceipt.sender}
                </span>
                <span className="text-[10px] text-zinc-400 ms-1">
                  {isRtl ? 'الآن' : 'now'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                <button
                  onClick={() => {
                    phoneSound.playTapClick();
                    onCloseReceipt();
                  }}
                  className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={isRtl ? 'إغلاق الإشعار' : 'Dismiss'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Body Text (Frame 01:17: fee is 1 EGP!) */}
            <div className="text-[12.5px] text-zinc-100 leading-relaxed whitespace-pre-line font-sans px-0.5">
              {smsReceipt.body}
            </div>

            {/* Blue URL link (http://vf.eg/vfcash) */}
            {smsReceipt.url && (
              <a
                href={smsReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#4d8bf8] hover:text-[#6ba1ff] flex items-center gap-1.5 underline px-0.5"
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
