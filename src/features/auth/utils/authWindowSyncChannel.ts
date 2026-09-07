import { AUTH_WINDOW_SYNC_CHANNEL } from '../constants/authWindow.constants';

type AuthWindowSyncSignal = 'presence-changed' | 'pending-logout';

interface AuthWindowSyncChannel {
  publish: (signal: AuthWindowSyncSignal) => void;
  close: () => void;
}

const isAuthWindowSyncSignal = (
  value: unknown
): value is AuthWindowSyncSignal => {
  return value === 'presence-changed' || value === 'pending-logout';
};

export const createAuthWindowSyncChannel = (
  onSignal: (signal: AuthWindowSyncSignal) => void
): AuthWindowSyncChannel | null => {
  if (typeof BroadcastChannel !== 'function') {
    return null;
  }

  try {
    const channel = new BroadcastChannel(AUTH_WINDOW_SYNC_CHANNEL);

    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isAuthWindowSyncSignal(event.data)) {
        onSignal(event.data);
      }
    };

    return {
      publish: (signal) => {
        try {
          channel.postMessage(signal);
        } catch {
          // localStorage/storage-event continúa siendo el fallback.
        }
      },
      close: () => {
        try {
          channel.close();
        } catch {
          // El cierre del canal no debe afectar el flujo de autenticación.
        }
      },
    };
  } catch {
    return null;
  }
};
