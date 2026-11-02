export interface Contact {
  id: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  avatarColor?: string;
  carrier?: 'Vodafone' | 'Orange' | 'Etisalat' | 'WE';
  isFavorite?: boolean;
  group?: 'Family' | 'Work' | 'Friends' | 'Cash' | 'General';
  notes?: string;
  createdAt: number;
}

export interface CallLog {
  id: string;
  contactId?: string;
  name?: string;
  phone: string;
  sim: 'Vodafone' | 'Orange EG';
  type: 'incoming' | 'outgoing' | 'missed' | 'rejected' | 'ussd';
  timestamp: number;
  durationSeconds?: number;
  ussdSummary?: string;
  amount?: number;
}

export type TabType = 'keypad' | 'recents' | 'contacts' | 'favorites';

export interface UssdDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  inputPrompt?: boolean;
  inputValue?: string;
  step?: number;
  targetPhone?: string;
  amount?: number;
  sim: 'Vodafone' | 'Orange EG';
  sessionData?: Record<string, any>;
}

export interface SmsReceiptState {
  isOpen: boolean;
  sender: string;
  body: string;
  url?: string;
  timestamp: number;
}
