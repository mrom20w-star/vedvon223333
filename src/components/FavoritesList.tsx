import React from 'react';
import { Star, Phone, MessageSquare, Plus } from 'lucide-react';
import { Contact } from '../types';

interface FavoritesListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onCallContact: (contact: Contact, sim: 'Vodafone' | 'Orange EG') => void;
  onSendMessage: (phone: string) => void;
  onGoToContacts: () => void;
  lang?: 'ar' | 'en';
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  contacts,
  onSelectContact,
  onCallContact,
  onSendMessage,
  onGoToContacts,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';
  const favorites = contacts.filter((c) => c.isFavorite);

  return (
    <div className="flex flex-col flex-1 h-full select-none overflow-hidden">
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{isRtl ? 'المفضلة' : 'Favorites'}</span>
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        </h1>
        <button
          onClick={onGoToContacts}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
        >
          {isRtl ? 'إدارة المفضلة' : 'Manage'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-zinc-500 gap-3 text-center">
            <Star className="w-10 h-10 opacity-30 text-amber-400" />
            <p className="text-xs max-w-xs">
              {isRtl
                ? 'لا توجد جهات اتصال في المفضلة بعد. اضغط على النجمة بجوار أي جهة اتصال لإضافتها هنا للاتصال السريع.'
                : 'No favorites yet. Tap the star icon next to any contact to add them for quick dialing.'}
            </p>
            <button
              onClick={onGoToContacts}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'اختر من جهات الاتصال' : 'Choose from contacts'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {favorites.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className="flex flex-col items-center p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all cursor-pointer group shadow-sm text-center"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md mb-2 bg-gradient-to-tr ${
                    contact.avatarColor || 'from-indigo-600 to-purple-800'
                  }`}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-sm text-zinc-100 group-hover:text-white truncate w-full">
                  {contact.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5" dir="ltr">
                  {contact.phone}
                </span>

                {/* Quick Dial Actions */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800/80 w-full justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallContact(contact, 'Vodafone');
                    }}
                    title={isRtl ? 'فودافون' : 'Vodafone'}
                    className="p-2 rounded-full bg-red-950/80 hover:bg-red-700 active:scale-95 text-red-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallContact(contact, 'Orange EG');
                    }}
                    title={isRtl ? 'أورنج' : 'Orange'}
                    className="p-2 rounded-full bg-amber-950/80 hover:bg-amber-600 active:scale-95 text-amber-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendMessage(contact.phone);
                    }}
                    title={isRtl ? 'رسالة' : 'SMS'}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-blue-600 active:scale-95 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
