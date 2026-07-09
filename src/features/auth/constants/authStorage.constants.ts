export const AUTH_STORAGE_KEYS = {
  STATE: 'ficha_deudor_auth_state',
  TOKEN: 'auth_token',
  LOGOUT_EVENT: 'ficha_deudor_logout_event',
  MAIN_WINDOWS: 'ficha_deudor_main_windows',
  PENDING_LAST_MAIN_LOGOUT: 'ficha_deudor_pending_last_main_logout',
  WINDOW_ID: 'ficha_deudor_window_id',
} as const;

export const AUTH_LOGOUT_CUSTOM_EVENT = 'ficha-deudor:logout';
