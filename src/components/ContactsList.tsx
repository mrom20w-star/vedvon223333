import React, { useState } from 'react';
import { Search, UserPlus, Star, Phone, MessageSquare } from 'lucide-react';
import { Contact } from '../types';

interface ContactsListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onCallContact: (contact: Contact, sim: 'Vodafone' | 'Orange EG') => void;
  onSendMessage: (phone: string) => void;
  onCreateContact: () => void;
  onToggleFavorite: (contactId: string) => void;
  lang?: 'ar' | 'en';
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onSelectContact,
  onCallContact,
  onSendMessage,
  onCreateContact,
  onToggleFavorite,
  lang = 'ar',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const isRtl = lang === 'ar';

  const filteredContacts = contacts
    .filter((c) => {
      if (selectedGroup !== 'All' && c.group !== selectedGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  // Group contacts by first character
  const groupedContacts: Record<string, Contact[]> = {};
  filteredContacts.forEach((contact) => {
    const firstChar = contact.name.trim().charAt(0).toUpperCase();
    if (!groupedContacts[firstChar]) {
      groupedContacts[firstChar] = [];
    }
    groupedContacts[firstChar].push(contact);
  });

  const letters = Object.keys(groupedContacts).sort((a, b) => a.localeCompare(b, 'ar'));

  return (
    <div className="flex flex-col flex-1 h-full select-none overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isRtl ? 'جهات الاتصال' : 'Contacts'}
          </h1>
          <button
            onClick={onCreateContact}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة جهة' : 'Add'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-500 absolute top-2.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث في جهات الاتصال...' : 'Search contacts...'}
            className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl py-2 pr-10 pl-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Group chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {['All', 'Work', 'Family', 'Friends', 'Cash'].map((grp) => {
            const labelMap: Record<string, string> = {
              All: isRtl ? 'الكل' : 'All',
              Work: isRtl ? 'العمل' : 'Work',
              Family: isRtl ? 'العائلة' : 'Family',
              Friends: isRtl ? 'الأصدقاء' : 'Friends',
              Cash: isRtl ? 'كاش' : 'Cash',
            };
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-100 text-black font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {labelMap[grp] || grp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-zinc-900/60 relative">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
            <UserPlus className="w-8 h-8 opacity-40" />
            <span className="text-xs">
              {isRtl ? 'لا توجد جهات اتصال مطابقة' : 'No matching contacts'}
            </span>
          </div>
        ) : (
          letters.map((char) => (
            <div key={char} className="pt-2">
              <div className="text-[11px] font-bold text-emerald-500 px-2 py-1 sticky top-0 bg-black/90 backdrop-blur-xs z-10">
                {char}
              </div>
              <div className="divide-y divide-zinc-900/40">
                {groupedContacts[char].map((contact) => (
                  <div
                    key={contact.id}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-zinc-900/50 rounded-xl transition-colors cursor-pointer group"
                    onClick={() => onSelectContact(contact)}
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 bg-gradient-to-tr ${
                          contact.avatarColor || 'from-zinc-700 to-zinc-900'
                        }`}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[13.5px] text-zinc-100 truncate">
                            {contact.name}
                          </span>
                          {contact.isFavorite && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                          <span dir="ltr">{contact.phone}</span>
                          {contact.carrier && (
                            <span
                              className={`text-[9.5px] px-1 py-0.2 rounded-2xs font-medium ${
                                contact.carrier === 'Vodafone'
                                  ? 'bg-red-950/80 text-red-300'
                                  : contact.carrier === 'Orange'
                                  ? 'bg-amber-950/80 text-amber-300'
                                  : contact.carrier === 'Etisalat'
                                  ? 'bg-emerald-950/80 text-emerald-300'
                                  : 'bg-indigo-950/80 text-indigo-300'
                              }`}
                            >
                              {contact.carrier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Call / Message Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCallContact(contact, 'Vodafone');
                        }}
                        title={isRtl ? 'اتصال فودافون' : 'Call via Vodafone'}
                        className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-emerald-600 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-zinc-800"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendMessage(contact.phone);
                        }}
                        title={isRtl ? 'رسالة' : 'Message'}
                        className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-blue-600 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-zinc-800"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
