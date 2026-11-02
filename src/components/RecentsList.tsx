import React, { useState } from 'react';
import { Search, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, ArrowUpRight, DollarSign, Info, MoreVertical, Trash2, Grid } from 'lucide-react';
import { CallLog, Contact } from '../types';

interface RecentsListProps {
  callLogs: CallLog[];
  contacts: Contact[];
  onSelectCall: (phone: string, sim: 'Vodafone' | 'Orange EG') => void;
  onOpenContactDetails: (contact: Contact) => void;
  onOpenNumberDetails: (phone: string, name?: string) => void;
  onClearLogs: () => void;
  onGoToKeypad?: () => void;
  lang?: 'ar' | 'en';
}

export const RecentsList: React.FC<RecentsListProps> = ({
  callLogs,
  contacts,
  onSelectCall,
  onOpenContactDetails,
  onOpenNumberDetails,
  onClearLogs,
  onGoToKeypad,
  lang = 'ar',
}) => {
  const [filter, setFilter] = useState<'all' | 'missed' | 'cash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const isRtl = lang === 'ar';

  const formatTimestamp = (ts: number) => {
    const diffHours = (Date.now() - ts) / (1000 * 3600);
    if (diffHours < 24) {
      const d = new Date(ts);
      let hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? (isRtl ? 'م' : 'PM') : (isRtl ? 'ص' : 'AM');
      hours = hours % 12 || 12;
      return `${hours}:${mins} ${ampm}`;
    }
    if (diffHours < 48) {
      return isRtl ? 'أمس' : 'Yesterday';
    }
    const days = Math.floor(diffHours / 24);
    return isRtl ? `منذ ${days} أيام` : `${days}d ago`;
  };

  const filteredLogs = callLogs.filter((log) => {
    if (filter === 'missed' && log.type !== 'missed') return false;
    if (filter === 'cash' && log.type !== 'ussd') return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = log.name?.toLowerCase().includes(query);
      const matchesPhone = log.phone.includes(query);
      const matchesSummary = log.ussdSummary?.toLowerCase().includes(query);
      return matchesName || matchesPhone || matchesSummary;
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1 h-full select-none overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2 relative">
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Phone
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute top-10 left-0 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1.5 px-1 z-30 min-w-[160px] text-xs">
                <button
                  onClick={() => {
                    onClearLogs();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-zinc-800 rounded-lg text-start transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRtl ? 'مسح سجل المكالمات' : 'Clear call history'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-500 absolute top-2.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث في السجل والأرقام...' : 'Search recents & numbers...'}
            className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl py-2 pr-10 pl-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isRtl ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'missed'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isRtl ? 'لم يرد عليها' : 'Missed'}
          </button>
          <button
            onClick={() => setFilter('cash')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'cash'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isRtl ? 'فودافون كاش' : 'Cash transfers'}
          </button>
        </div>
      </div>

      {/* Recents Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-zinc-900/60">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
            <Phone className="w-8 h-8 opacity-40" />
            <span className="text-xs">{isRtl ? 'لا توجد مكالمات حديثة' : 'No recent calls'}</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const matchedContact = contacts.find(
              (c) => c.phone === log.phone || (log.name && c.name.toLowerCase() === log.name.toLowerCase())
            );
            const displayName = log.name || matchedContact?.name || log.phone;
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div
                key={log.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-zinc-900/40 rounded-xl transition-colors group cursor-pointer"
                onClick={() => {
                  if (matchedContact) {
                    onOpenContactDetails(matchedContact);
                  } else {
                    onOpenNumberDetails(log.phone, log.name);
                  }
                }}
              >
                {/* Left (or Right in RTL): Avatar + Name + Subtitle */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
                      log.type === 'ussd'
                        ? 'bg-gradient-to-tr from-amber-600 to-red-600'
                        : matchedContact?.avatarColor
                        ? `bg-gradient-to-tr ${matchedContact.avatarColor}`
                        : 'bg-gradient-to-tr from-zinc-700 to-zinc-800'
                    }`}
                  >
                    {log.type === 'ussd' ? <DollarSign className="w-5 h-5 text-amber-200" /> : initial}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-medium text-[13.5px] truncate ${
                        log.type === 'missed' ? 'text-rose-400 font-semibold' : 'text-zinc-100'
                      }`}
                    >
                      {displayName}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                      {/* Call icon */}
                      {log.type === 'outgoing' && (
                        <PhoneOutgoing className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                      {log.type === 'incoming' && (
                        <PhoneIncoming className="w-3 h-3 text-blue-400 shrink-0" />
                      )}
                      {log.type === 'missed' && (
                        <PhoneMissed className="w-3 h-3 text-rose-500 shrink-0" />
                      )}
                      {log.type === 'ussd' && (
                        <ArrowUpRight className="w-3 h-3 text-amber-400 shrink-0" />
                      )}

                      {/* SIM Badge */}
                      <span
                        className={`text-[9.5px] font-semibold px-1 rounded-2xs ${
                          log.sim === 'Vodafone'
                            ? 'bg-red-950 text-red-300 border border-red-900/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-900/60'
                        }`}
                      >
                        {log.sim === 'Vodafone' ? 'VF' : 'ORG'}
                      </span>

                      <span>{log.type === 'ussd' ? log.ussdSummary : (isRtl ? 'مصر' : 'Egypt')}</span>
                      <span>•</span>
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Call Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCall(log.phone, log.sim);
                    }}
                    title={isRtl ? 'اتصال مباشر' : 'Call'}
                    className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-emerald-600 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-zinc-800"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (matchedContact) {
                        onOpenContactDetails(matchedContact);
                      } else {
                        onOpenNumberDetails(log.phone, log.name);
                      }
                    }}
                    title={isRtl ? 'تفاصيل' : 'Details'}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Green Dialpad Button matching frame 01:21! */}
      {onGoToKeypad && (
        <button
          onClick={onGoToKeypad}
          title="Open Keypad"
          className="absolute bottom-5 right-5 w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-2xl flex items-center justify-center transition-all cursor-pointer z-30"
        >
          <Grid className="w-6 h-6 stroke-[2]" />
        </button>
      )}
    </div>
  );
};
