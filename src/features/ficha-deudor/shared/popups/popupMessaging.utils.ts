import {
  FICHA_DEUDOR_POPUP_REGISTRY,
} from './popupRegistry';

import type {
  FichaDeudorPopupContext,
  FichaDeudorPopupType,
} from './popupContext.types';

const POPUP_WINDOW_PREFIX = 'avalperu-popup';
const POPUP_CONTEXT_REQUEST = 'AVALPERU_POPUP_CONTEXT_REQUEST';
const POPUP_CONTEXT_RESPONSE = 'AVALPERU_POPUP_CONTEXT_RESPONSE';

export interface PopupContextRequestMessage {
  type: typeof POPUP_CONTEXT_REQUEST;
  popupId: string;
}

export interface PopupContextResponseMessage<
  T extends FichaDeudorPopupType = FichaDeudorPopupType,
> {
  type: typeof POPUP_CONTEXT_RESPONSE;
  popupId: string;
  popupType: T;
  context: FichaDeudorPopupContext<T>;
}

export const isPopupContextRequestMessage = (
  value: unknown
): value is PopupContextRequestMessage => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as Partial<PopupContextRequestMessage>;

  return (
    message.type === POPUP_CONTEXT_REQUEST &&
    typeof message.popupId === 'string'
  );
};

export const isPopupContextResponseMessage = (
  value: unknown
): value is PopupContextResponseMessage => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as Partial<PopupContextResponseMessage>;

  return (
    message.type === POPUP_CONTEXT_RESPONSE &&
    typeof message.popupId === 'string' &&
    typeof message.popupType === 'string' &&
    typeof message.context === 'object' &&
    message.context !== null
  );
};

const createPopupId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const buildPopupWindowName = (
  popupType: FichaDeudorPopupType,
  popupId: string
): string => {
  return `${POPUP_WINDOW_PREFIX}:${popupType}:${popupId}`;
};

export const getPopupIdFromWindowName = (
  windowName: string
): string | null => {
  const [, , popupId] = windowName.split(':');

  return popupId || null;
};

const buildPopupFeatures = (
  width: number,
  height: number
): string => {
  const left = Math.max(
    0,
    Math.round((window.screen.width - width) / 2)
  );

  const top = Math.max(
    0,
    Math.round((window.screen.height - height) / 2)
  );

  return [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=yes',
    'toolbar=no',
    'menubar=no',
    'location=no',
  ].join(',');
};

export const openFichaDeudorPopup = <
  T extends FichaDeudorPopupType,
>(
  popupType: T,
  context: FichaDeudorPopupContext<T>
): Window | null => {
  const config = FICHA_DEUDOR_POPUP_REGISTRY[popupType];
  const popupId = createPopupId();

  const popupWindow = window.open(
    'about:blank',
    buildPopupWindowName(popupType, popupId),
    buildPopupFeatures(config.width, config.height)
  );

  if (!popupWindow) {
    return null;
  }

  const handleContextRequest = (
    event: MessageEvent<unknown>
  ): void => {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.source !== popupWindow) {
      return;
    }

    if (!isPopupContextRequestMessage(event.data)) {
      return;
    }

    if (event.data.popupId !== popupId) {
      return;
    }

    const response: PopupContextResponseMessage<T> = {
      type: POPUP_CONTEXT_RESPONSE,
      popupId,
      popupType,
      context,
    };

    popupWindow.postMessage(
      response,
      window.location.origin
    );

    window.removeEventListener(
      'message',
      handleContextRequest
    );
  };

  window.addEventListener(
    'message',
    handleContextRequest
  );

  popupWindow.location.href = new URL(
    config.path,
    window.location.origin
  ).toString();

  return popupWindow;
};

export const requestPopupContext = (
  popupId: string
): void => {
  const request: PopupContextRequestMessage = {
    type: POPUP_CONTEXT_REQUEST,
    popupId,
  };

  window.opener?.postMessage(
    request,
    window.location.origin
  );
};