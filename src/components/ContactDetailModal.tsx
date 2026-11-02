import React from 'react';
import { X, Star, Phone, MessageSquare, Edit3, Trash2, Mail, FileText, Share2 } from 'lucide-react';
import { Contact } from '../types';
import { phoneSound } from '../utils/audio';

interface ContactDetailModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onCall: (sim: 'Vodafone' | 'Orange EG') => void;
  onSendMessage: (phone: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onToggleFavorite: (contactId: string) => void;
  lang?: 'ar' | 'en';
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onCall,
  onSendMessage,
  onEdit,
  onDelete,
  onToggleFavorite,
  lang = 'ar',
}) => {
  if (!isOpen) return null;

  const isRtl = lang === 'ar';
  const initial = contact.name.charAt(0).toUpperCase();

  // Egyptian whatsapp number formatting
  const rawPhone = contact.phone.replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') ? `2${rawPhone}` : rawPhone;
  const waLink = `https://wa.me/${waPhone}`;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full sm:max-w-[360px] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Header Banner with Avatar */}
        <div className="relative pt-8 pb-6 px-6 flex flex-col items-center bg-gradient-to-b from-zinc-850 to-zinc-900 border-b border-zinc-800/80">
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onClose();
            }}
            className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              phoneSound.playTapClick();
              onToggleFavorite(contact.id);
            }}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-amber-400 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                contact.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'
              }`}
            />
          </button>

          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-xl mb-3 bg-gradient-to-tr ${
              contact.avatarColor || 'from-emerald-600 to-teal-800'
            }`}
          >
            {initial}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight text-center">
            {contact.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                contact.carrier === 'Vodafone'
                  ? 'bg-red-950 text-red-300 border border-red-800/60'
                  : contact.carrier === 'Orange'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {contact.carrier || (isRtl ? 'محمول مصر' : 'Egypt Mobile')}
            </span>
            {contact.group && (
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">
                {contact.group}
              </span>
            )}
          </div>
        </div>

        {/* Quick Dial Actions Row */}
        <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 text-center">
          {/* Call Vodafone */}
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onCall('Vodafone');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-red-950/80 hover:bg-red-600 border border-red-800/70 text-red-200 hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'فودافون' : 'Vodafone'}
            </span>
          </button>

          {/* Call Orange */}
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onCall('Orange EG');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-amber-950/80 hover:bg-amber-600 border border-amber-800/70 text-amber-200 hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'أورنج' : 'Orange'}
            </span>
          </button>

          {/* Send SMS */}
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onSendMessage(contact.phone);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-zinc-800 hover:bg-blue-600 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'رسالة' : 'SMS'}
            </span>
          </button>

          {/* WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-950/80 hover:bg-emerald-600 border border-emerald-800/70 text-emerald-300 hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95">
              <span className="font-bold text-xs">WA</span>
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">
              {isRtl ? 'واتساب' : 'WhatsApp'}
            </span>
          </a>
        </div>

        {/* Contact info list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-xs">
          {/* Phone row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-zinc-400 text-[10px]">{isRtl ? 'رقم الهاتف' : 'Phone'}</span>
                <span className="font-mono text-zinc-100 text-sm" dir="ltr">
                  {contact.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Email row */}
          {contact.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <Mail className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-zinc-400 text-[10px]">{isRtl ? 'البريد الإلكتروني' : 'Email'}</span>
                <span className="text-zinc-200" dir="ltr">
                  {contact.email}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-zinc-400 text-[10px]">{isRtl ? 'ملاحظات' : 'Notes'}</span>
                <span className="text-zinc-300 leading-relaxed">{contact.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions: Edit & Delete */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-950/60">
          <button
            onClick={() => {
              phoneSound.playTapClick();
              onDelete(contact.id);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isRtl ? 'حذف' : 'Delete'}</span>
          </button>

          <button
            onClick={() => {
              phoneSound.playTapClick();
              onEdit(contact);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 py-1.5 px-4 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isRtl ? 'تعديل' : 'Edit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
