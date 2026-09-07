export const AUTH_WINDOW_TIMING = {
  // Renovación espaciada y lease amplio para tolerar throttling de pestañas en background.
  HEARTBEAT_MS: 10000,
  ACTIVE_WINDOW_TTL_MS: 120000,
  RELOAD_GRACE_MS: 5000,
  POPUP_FALLBACK_CHECK_MS: 30000,
  MAX_FUTURE_SKEW_MS: 5 * 60 * 1000,
} as const;

export const AUTH_WINDOW_SYNC_CHANNEL = 'ficha-deudor:auth-window-sync:v1';

export const AUTH_POPUP_PATH_KEYWORDS = [
  'email-deudor-popup',
  'agenda-deudor-popup',
  'pago-deudor-popup',
  'inf-deudor-popup',
  'emaildeudorpopup',
  'agendadeudorpopup',
  'pagodeudorpopup',
  'infdeudorpopup',
] as const;
