import React, { useState, useEffect } from 'react';
import { X, Check, User } from 'lucide-react';
import { Contact } from '../types';
import { phoneSound } from '../utils/audio';

interface ContactFormModalProps {
  isOpen: boolean;
  initialPhone?: string;
  initialContact?: Contact | null;
  onSave: (contact: Partial<Contact>) => void;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

const COLOR_PRESETS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-purple-600 to-violet-800',
  'from-cyan-600 to-blue-800',
  'from-red-600 to-rose-700',
  'from-zinc-600 to-zinc-800',
];

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  initialPhone = '',
  initialContact = null,
  onSave,
  onClose,
  lang = 'ar',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carrier, setCarrier] = useState<'Vodafone' | 'Orange' | 'Etisalat' | 'WE'>('Vodafone');
  const [group, setGroup] = useState<'Family' | 'Work' | 'Friends' | 'Cash' | 'General'>('General');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(COLOR_PRESETS[0]);
  const [error, setError] = useState('');

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name);
      setPhone(initialContact.phone);
      setCarrier(initialContact.carrier || 'Vodafone');
      setGroup(initialContact.group || 'General');
      setEmail(initialContact.email || '');
      setNotes(initialContact.notes || '');
      setAvatarColor(initialContact.avatarColor || COLOR_PRESETS[0]);
    } else {
      setName('');
      setPhone(initialPhone || '');
      // Auto-detect Egyptian network based on prefix
      if (initialPhone.startsWith('010')) setCarrier('Vodafone');
      else if (initialPhone.startsWith('012')) setCarrier('Orange');
      else if (initialPhone.startsWith('011')) setCarrier('Etisalat');
      else if (initialPhone.startsWith('015')) setCarrier('WE');
      else setCarrier('Vodafone');

      setGroup('General');
      setEmail('');
      setNotes('');
      setAvatarColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    }
    setError('');
  }, [initialContact, initialPhone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isRtl ? 'يرجى إدخال اسم جهة الاتصال' : 'Please enter contact name');
      return;
    }
    if (!phone.trim()) {
      setError(isRtl ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    phoneSound.playTapClick();
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      carrier,
      group,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarColor,
    });
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-[360px] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-base">
              {initialContact
                ? isRtl
                  ? 'تعديل جهة الاتصال'
                  : 'Edit Contact'
                : isRtl
                ? 'إنشاء جهة اتصال جديدة'
                : 'Create Contact'}
            </span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Color selector preview */}
          <div className="flex flex-col items-center justify-center py-2">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg mb-3 bg-gradient-to-tr ${avatarColor}`}
            >
              {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {COLOR_PRESETS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAvatarColor(col)}
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr ${col} border-2 transition-transform cursor-pointer ${
                    avatarColor === col ? 'border-white scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name field */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'الاسم *' : 'Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isRtl ? 'مثال: كريم عماد' : 'e.g. Kareem Emad'}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Phone field */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              dir="ltr"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* Carrier Selector */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'شبكة المحمول المصرية' : 'Egyptian Carrier'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Vodafone', 'Orange', 'Etisalat', 'WE'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCarrier(c)}
                  className={`py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer border ${
                    carrier === c
                      ? c === 'Vodafone'
                        ? 'bg-red-600 border-red-500 text-white font-bold'
                        : c === 'Orange'
                        ? 'bg-amber-600 border-amber-500 text-white font-bold'
                        : c === 'Etisalat'
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                        : 'bg-indigo-600 border-indigo-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'المجموعة' : 'Group'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['General', 'Work', 'Family', 'Friends', 'Cash'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    group === g
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {g === 'General'
                    ? isRtl ? 'عام' : 'General'
                    : g === 'Work'
                    ? isRtl ? 'العمل' : 'Work'
                    : g === 'Family'
                    ? isRtl ? 'العائلة' : 'Family'
                    : g === 'Friends'
                    ? isRtl ? 'الأصدقاء' : 'Friends'
                    : isRtl ? 'كاش' : 'Cash'}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              dir="ltr"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">
              {isRtl ? 'ملاحظات' : 'Notes'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRtl ? 'ملاحظات إضافية...' : 'Additional notes...'}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isRtl ? 'حفظ جهة الاتصال' : 'Save Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
