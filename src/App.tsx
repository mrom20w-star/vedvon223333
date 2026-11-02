import React, { useState, useEffect } from 'react';
import { Dialpad } from './components/Dialpad';
import { RecentsList } from './components/RecentsList';
import { ContactsList } from './components/ContactsList';
import { FavoritesList } from './components/FavoritesList';
import { CallScreen } from './components/CallScreen';
import { UssdDialog } from './components/UssdDialog';
import { ContactDetailModal } from './components/ContactDetailModal';
import { ContactFormModal } from './components/ContactFormModal';
import { SmsComposerModal } from './components/SmsComposerModal';
import { PhoneShell } from './components/PhoneShell';
import { INITIAL_CONTACTS, INITIAL_CALL_LOGS } from './data/initialContacts';
import { Contact, CallLog, TabType, UssdDialogState, SmsReceiptState } from './types';
import { parseAndExecuteUssd, handleUssdNextStep } from './utils/ussdEngine';
import { requestNotificationPermission } from './utils/notifications';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currentTab, setCurrentTab] = useState<TabType>('keypad');
  // Starts completely blank as requested by user
  const [dialedNumber, setDialedNumber] = useState<string>('');

  // Contacts & Recents Persistence
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('android_contacts_v1');
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const saved = localStorage.getItem('android_call_logs_v1');
      return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
    } catch {
      return INITIAL_CALL_LOGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('android_contacts_v1', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('android_call_logs_v1', JSON.stringify(callLogs));
  }, [callLogs]);

  // Outgoing call state
  const [activeCall, setActiveCall] = useState<{
    number: string;
    name?: string;
    avatarColor?: string;
    sim: 'Vodafone' | 'Orange EG';
  } | null>(null);

  // USSD states
  const [isUssdRunning, setIsUssdRunning] = useState<boolean>(false);
  const [ussdDialogState, setUssdDialogState] = useState<UssdDialogState | null>(null);
  const [smsReceipt, setSmsReceipt] = useState<SmsReceiptState | null>(null);

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactFormState, setContactFormState] = useState<{
    isOpen: boolean;
    initialPhone?: string;
    initialContact?: Contact | null;
  }>({ isOpen: false });

  const [smsModalState, setSmsModalState] = useState<{
    isOpen: boolean;
    phone: string;
    name?: string;
  }>({ isOpen: false, phone: '' });

  // Handle Placing a Call
  const handleInitiateCall = (rawNumber: string, sim: 'Vodafone' | 'Orange EG') => {
    requestNotificationPermission();
    const num = rawNumber.trim();
    if (!num) return;

    // Check if USSD code (e.g. *9*7*01095612011*500# or *868*1#)
    if (num.startsWith('*') && num.endsWith('#')) {
      setIsUssdRunning(true);
      setTimeout(() => {
        setIsUssdRunning(false);
        const result = parseAndExecuteUssd(num, sim);
        if (result.dialogState) {
          setUssdDialogState(result.dialogState);
        } else if (result.smsReceipt) {
          setSmsReceipt(result.smsReceipt);
        }
      }, 1200);
      return;
    }

    // Standard phone call
    const matched = contacts.find((c) => c.phone === num);
    setActiveCall({
      number: num,
      name: matched?.name,
      avatarColor: matched?.avatarColor,
      sim,
    });
  };

  const handleEndCall = (durationSeconds: number) => {
    if (!activeCall) return;

    // Log call
    const newLog: CallLog = {
      id: `call-${Date.now()}`,
      phone: activeCall.number,
      name: activeCall.name,
      sim: activeCall.sim,
      type: 'outgoing',
      timestamp: Date.now(),
      durationSeconds,
    };
    setCallLogs((prev) => [newLog, ...prev]);
    setActiveCall(null);
  };

  // USSD Step response
  const handleUssdReply = (reply: string) => {
    if (!ussdDialogState) return;

    setIsUssdRunning(true);
    const curr = { ...ussdDialogState };
    setUssdDialogState(null);

    setTimeout(() => {
      setIsUssdRunning(false);
      setDialedNumber('');

      const next = handleUssdNextStep(curr, reply);
      if (next.dialogState) {
        setUssdDialogState(next.dialogState);
      }
      if (next.smsReceipt) {
        const receipt = next.smsReceipt;
        // Realistic network delay of 1.8s ("بعديها بثانية أو ثانيتين")
        setTimeout(() => {
          setSmsReceipt(receipt);

          // Also add to recents call log
          const amount = curr.amount || 500;
          const phone = curr.targetPhone || '01095612011';
          const newLog: CallLog = {
            id: `ussd-${Date.now()}`,
            phone: `*9*7*${phone}*${amount}#`,
            sim: curr.sim,
            type: 'ussd',
            timestamp: Date.now(),
            ussdSummary: `تحويل ${amount} جنيه لرقم ${phone}`,
            amount,
          };
          setCallLogs((prev) => [newLog, ...prev]);
        }, 1800);
      }
    }, 1200);
  };

  // Contact CRUD
  const handleSaveContact = (contactData: Partial<Contact>) => {
    if (contactFormState.initialContact) {
      // Edit
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactFormState.initialContact!.id ? ({ ...c, ...contactData } as Contact) : c
        )
      );
      if (selectedContact?.id === contactFormState.initialContact.id) {
        setSelectedContact({ ...selectedContact, ...contactData } as Contact);
      }
    } else {
      // Create new
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        name: contactData.name || 'جهة اتصال جديدة',
        phone: contactData.phone || '',
        carrier: contactData.carrier || 'Vodafone',
        email: contactData.email,
        group: contactData.group || 'General',
        notes: contactData.notes,
        avatarColor: contactData.avatarColor || 'from-emerald-600 to-teal-800',
        isFavorite: false,
        createdAt: Date.now(),
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setContactFormState({ isOpen: false });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    setSelectedContact(null);
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  return (
    <PhoneShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      lang={lang}
    >
      {/* Screen View Router (StatusBar removed completely as requested) */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {currentTab === 'keypad' && (
          <Dialpad
            dialedNumber={dialedNumber}
            onNumberChange={setDialedNumber}
            onCall={(sim) => handleInitiateCall(dialedNumber, sim)}
            onCreateContact={(phone) =>
              setContactFormState({ isOpen: true, initialPhone: phone, initialContact: null })
            }
            onSaveToExisting={() => {
              setCurrentTab('contacts');
            }}
            onSendMessage={(phone) => setSmsModalState({ isOpen: true, phone })}
            lang={lang}
          />
        )}

        {currentTab === 'recents' && (
          <RecentsList
            callLogs={callLogs}
            contacts={contacts}
            onSelectCall={(phone, sim) => handleInitiateCall(phone, sim)}
            onOpenContactDetails={(contact) => setSelectedContact(contact)}
            onOpenNumberDetails={(phone, name) => {
              const found = contacts.find((c) => c.phone === phone);
              if (found) setSelectedContact(found);
              else {
                setContactFormState({ isOpen: true, initialPhone: phone, initialContact: null });
              }
            }}
            onClearLogs={() => setCallLogs([])}
            onGoToKeypad={() => setCurrentTab('keypad')}
            lang={lang}
          />
        )}

        {currentTab === 'contacts' && (
          <ContactsList
            contacts={contacts}
            onSelectContact={(c) => setSelectedContact(c)}
            onCallContact={(c, sim) => handleInitiateCall(c.phone, sim)}
            onSendMessage={(phone) => setSmsModalState({ isOpen: true, phone })}
            onCreateContact={() =>
              setContactFormState({ isOpen: true, initialPhone: '', initialContact: null })
            }
            onToggleFavorite={handleToggleFavorite}
            lang={lang}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoritesList
            contacts={contacts}
            onSelectContact={(c) => setSelectedContact(c)}
            onCallContact={(c, sim) => handleInitiateCall(c.phone, sim)}
            onSendMessage={(phone) => setSmsModalState({ isOpen: true, phone })}
            onGoToContacts={() => setCurrentTab('contacts')}
            lang={lang}
          />
        )}
      </div>

      {/* Active In-Call Screen Overlay */}
      {activeCall && (
        <CallScreen
          number={activeCall.number}
          name={activeCall.name}
          avatarColor={activeCall.avatarColor}
          sim={activeCall.sim}
          onEndCall={handleEndCall}
          lang={lang}
        />
      )}

      {/* USSD Dialog & VF-Cash Receipt Modal */}
      <UssdDialog
        isRunning={isUssdRunning}
        dialogState={ussdDialogState}
        smsReceipt={smsReceipt}
        onSendReply={handleUssdReply}
        onCancel={() => setUssdDialogState(null)}
        onCloseReceipt={() => setSmsReceipt(null)}
        lang={lang}
      />

      {/* Contact Details Sheet */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          isOpen={true}
          onClose={() => setSelectedContact(null)}
          onCall={(sim) => {
            handleInitiateCall(selectedContact.phone, sim);
            setSelectedContact(null);
          }}
          onSendMessage={(phone) => {
            setSmsModalState({
              isOpen: true,
              phone,
              name: selectedContact.name,
            });
          }}
          onEdit={(c) => {
            setContactFormState({ isOpen: true, initialContact: c });
          }}
          onDelete={handleDeleteContact}
          onToggleFavorite={handleToggleFavorite}
          lang={lang}
        />
      )}

      {/* Create / Edit Contact Form */}
      <ContactFormModal
        isOpen={contactFormState.isOpen}
        initialPhone={contactFormState.initialPhone}
        initialContact={contactFormState.initialContact}
        onSave={handleSaveContact}
        onClose={() => setContactFormState({ isOpen: false })}
        lang={lang}
      />

      {/* SMS Composer Modal */}
      <SmsComposerModal
        isOpen={smsModalState.isOpen}
        recipientPhone={smsModalState.phone}
        recipientName={smsModalState.name}
        onClose={() => setSmsModalState({ isOpen: false, phone: '' })}
        lang={lang}
      />
    </PhoneShell>
  );
}
