export const AUTH_WINDOW_TIMING = {
  HEARTBEAT_MS: 1000,
  ACTIVE_WINDOW_TTL_MS: 15000,
  RELOAD_GRACE_MS: 5000,
} as const;

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
