/**
 * Triggers native system notifications on physical mobile phones & desktop browsers
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function sendDeviceNotification(title: string, body: string, url?: string) {
  // 1. Trigger physical phone vibration motor
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([250, 100, 250]);
    } catch {
      // ignore
    }
  }

  // 2. Trigger native OS / Android Notification in the system notification tray
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Vodafone_Logo.svg/512px-Vodafone_Logo.svg.png',
          badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Vodafone_Logo.svg/512px-Vodafone_Logo.svg.png',
          tag: 'vf-cash-transfer-success',
        });
        if (url) {
          notif.onclick = () => {
            window.focus();
            window.open(url, '_blank');
          };
        }
      } catch (err) {
        console.warn('Native notification error:', err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(title, {
              body,
              icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Vodafone_Logo.svg/512px-Vodafone_Logo.svg.png',
              tag: 'vf-cash-transfer-success',
            });
          } catch {
            // ignore
          }
        }
      });
    }
  }
}
