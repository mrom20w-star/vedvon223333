import React from 'react';
import { Grid, Clock, Users, Star } from 'lucide-react';
import { TabType } from '../types';
import { phoneSound } from '../utils/audio';

interface PhoneShellProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang?: 'ar' | 'en';
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  currentTab,
  onTabChange,
  lang = 'ar',
  children,
}) => {
  const isRtl = lang === 'ar';

  return (
    <div
      className="w-full h-screen h-[100dvh] bg-black text-zinc-100 flex flex-col justify-between overflow-hidden select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Main Screen Content View (Full Screen, No top bars) */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {children}
      </div>

      {/* Bottom Navigation Tabs Bar */}
      <nav className="h-16 bg-black border-t border-zinc-900/90 flex items-center justify-around px-2 text-zinc-400 select-none z-30 shrink-0">
        {/* Keypad Tab */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            onTabChange('keypad');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer ${
            currentTab === 'keypad' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-5 h-5 stroke-[2]" />
          <span className="text-[10.5px] font-semibold">
            {isRtl ? 'لوحة المفاتيح' : 'Keypad'}
          </span>
        </button>

        {/* Recents Tab */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            onTabChange('recents');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer ${
            currentTab === 'recents' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clock className="w-5 h-5 stroke-[2]" />
          <span className="text-[10.5px] font-semibold">
            {isRtl ? 'السجل' : 'Recents'}
          </span>
        </button>

        {/* Contacts Tab */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            onTabChange('contacts');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer ${
            currentTab === 'contacts' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-5 h-5 stroke-[2]" />
          <span className="text-[10.5px] font-semibold">
            {isRtl ? 'جهات الاتصال' : 'Contacts'}
          </span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => {
            phoneSound.playTapClick();
            onTabChange('favorites');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors cursor-pointer ${
            currentTab === 'favorites' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Star className="w-5 h-5 stroke-[2]" />
          <span className="text-[10.5px] font-semibold">
            {isRtl ? 'المفضلة' : 'Favorites'}
          </span>
        </button>
      </nav>

      {/* Android bottom gesture pill */}
      <div className="w-full pb-1 pt-0.5 flex justify-center bg-black shrink-0">
        <div className="w-28 h-1 rounded-full bg-zinc-700/60" />
      </div>
    </div>
  );
};
