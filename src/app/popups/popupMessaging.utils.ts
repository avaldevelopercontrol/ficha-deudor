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

const POPUP_MAX_WIDTH_RATIO = 0.92;
const POPUP_MAX_HEIGHT_RATIO = 0.88;
const POPUP_EDGE_MARGIN = 24;

const buildPopupFeatures = (
  preferredWidth: number,
  preferredHeight: number
): string => {
  const availableWidth =
    window.screen.availWidth || window.screen.width;

  const availableHeight =
    window.screen.availHeight || window.screen.height;

  /*
   * Se aplica tanto un límite porcentual como un margen mínimo.
   * Así el popup no queda pegado a los bordes de la pantalla.
   */
  const maximumWidth = Math.max(
    100,
    Math.min(
      Math.floor(availableWidth * POPUP_MAX_WIDTH_RATIO),
      availableWidth - POPUP_EDGE_MARGIN * 2
    )
  );

  const maximumHeight = Math.max(
    100,
    Math.min(
      Math.floor(availableHeight * POPUP_MAX_HEIGHT_RATIO),
      availableHeight - POPUP_EDGE_MARGIN * 2
    )
  );

  const width = Math.min(
    preferredWidth,
    maximumWidth
  );

  const height = Math.min(
    preferredHeight,
    maximumHeight
  );

  /*
   * Se centra respecto de la ventana principal.
   * Funciona mejor cuando el usuario utiliza más de un monitor
   * que calcular siempre desde la coordenada 0.
   */
  const left = Math.round(
    window.screenX +
    (window.outerWidth - width) / 2
  );

  const top = Math.round(
    window.screenY +
    (window.outerHeight - height) / 2
  );

  return [
    'popup=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
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