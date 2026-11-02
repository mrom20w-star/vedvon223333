import React, { useState } from 'react';
import { X, Send, MessageSquare, CheckCheck } from 'lucide-react';
import { phoneSound } from '../utils/audio';

interface SmsComposerModalProps {
  isOpen: boolean;
  recipientPhone: string;
  recipientName?: string;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const SmsComposerModal: React.FC<SmsComposerModalProps> = ({
  isOpen,
  recipientPhone,
  recipientName,
  onClose,
  lang = 'ar',
}) => {
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';

  const quickTemplates = isRtl
    ? [
        'تم تحويل المبلغ عبر فودافون كاش ✅',
        'هكلمك بعد شوية إن شاء الله',
        'أنا في الطريق إليك حالياً',
        'كلمني أول ما تفضى ضروري',
      ]
    : [
        'Amount transferred via Vodafone Cash ✅',
        'I will call you back shortly',
        'I am on my way now',
        'Please call me when you are free',
      ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    phoneSound.playSuccessChime();
    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-[340px] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">
                {isRtl ? 'إرسال رسالة نصية' : 'New Message'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono" dir="ltr">
                {recipientName ? `${recipientName} (${recipientPhone})` : recipientPhone}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onClose();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
            <CheckCheck className="w-12 h-12 text-emerald-400 animate-bounce" />
            <span className="text-sm font-semibold text-white">
              {isRtl ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 flex flex-col gap-3 text-xs">
            {/* Quick Templates */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400">
                {isRtl ? 'رسائل سريعة جاهزة:' : 'Quick templates:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {quickTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      phoneSound.playTapClick();
                      setMessage(template);
                    }}
                    className="text-[10.5px] px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors text-start"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRtl ? 'اكتب نص الرسالة هنا...' : 'Type message here...'}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'إرسال SMS' : 'Send SMS'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
