import {
  FICHA_DEUDOR_POPUP_REGISTRY,
} from './popupRegistry';
import {
  isValidPopupId,
} from '@shared/utils/popupId.utils';

import {
  isFichaDeudorPopupContext,
  isFichaDeudorPopupType,
  type FichaDeudorPopupContext,
  type FichaDeudorPopupType,
} from './popupContext.types';

const POPUP_WINDOW_PREFIX = 'avalperu-popup';
const POPUP_CONTEXT_REQUEST =
  'AVALPERU_POPUP_CONTEXT_REQUEST';
const POPUP_CONTEXT_RESPONSE =
  'AVALPERU_POPUP_CONTEXT_RESPONSE';
const POPUP_CONTEXT_REQUEST_TIMEOUT_MS = 60_000;

export const POPUP_MESSAGING_PROTOCOL_VERSION = 1;

export interface PopupWindowDescriptor {
  popupType: FichaDeudorPopupType;
  popupId: string;
}

export interface PopupContextRequestMessage {
  version: typeof POPUP_MESSAGING_PROTOCOL_VERSION;
  type: typeof POPUP_CONTEXT_REQUEST;
  popupId: string;
  popupType: FichaDeudorPopupType;
}

export interface PopupContextResponseMessage<
  T extends FichaDeudorPopupType = FichaDeudorPopupType,
> {
  version: typeof POPUP_MESSAGING_PROTOCOL_VERSION;
  type: typeof POPUP_CONTEXT_RESPONSE;
  popupId: string;
  popupType: T;
  context: FichaDeudorPopupContext<T>;
}

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

export const isPopupContextRequestMessage = (
  value: unknown
): value is PopupContextRequestMessage => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version ===
      POPUP_MESSAGING_PROTOCOL_VERSION &&
    value.type === POPUP_CONTEXT_REQUEST &&
    isValidPopupId(value.popupId) &&
    isFichaDeudorPopupType(value.popupType)
  );
};

export const isPopupContextResponseMessage = (
  value: unknown
): value is PopupContextResponseMessage => {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.version !==
      POPUP_MESSAGING_PROTOCOL_VERSION ||
    value.type !== POPUP_CONTEXT_RESPONSE ||
    !isValidPopupId(value.popupId) ||
    !isFichaDeudorPopupType(value.popupType)
  ) {
    return false;
  }

  return isFichaDeudorPopupContext(
    value.popupType,
    value.context
  );
};

const createPopupId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

export const buildPopupWindowName = (
  popupType: FichaDeudorPopupType,
  popupId: string
): string => {
  return `${POPUP_WINDOW_PREFIX}:${popupType}:${popupId}`;
};

export const parsePopupWindowName = (
  windowName: string
): PopupWindowDescriptor | null => {
  const parts = windowName.split(':');

  if (parts.length !== 3) {
    return null;
  }

  const [prefix, popupType, popupId] = parts;

  if (
    prefix !== POPUP_WINDOW_PREFIX ||
    !isFichaDeudorPopupType(popupType) ||
    !isValidPopupId(popupId)
  ) {
    return null;
  }

  return {
    popupType,
    popupId,
  };
};

export const getPopupIdFromWindowName = (
  windowName: string
): string | null => {
  return parsePopupWindowName(windowName)?.popupId ?? null;
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
      Math.floor(
        availableWidth * POPUP_MAX_WIDTH_RATIO
      ),
      availableWidth - POPUP_EDGE_MARGIN * 2
    )
  );

  const maximumHeight = Math.max(
    100,
    Math.min(
      Math.floor(
        availableHeight * POPUP_MAX_HEIGHT_RATIO
      ),
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
  if (!isFichaDeudorPopupContext(popupType, context)) {
    throw new Error(
      `El contexto del popup ${popupType} no es válido.`
    );
  }

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

  let cleanupTimer: number | null = null;

  const cleanup = (): void => {
    window.removeEventListener(
      'message',
      handleContextRequest
    );

    if (cleanupTimer !== null) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
  };

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

    if (
      event.data.popupId !== popupId ||
      event.data.popupType !== popupType
    ) {
      return;
    }

    const response: PopupContextResponseMessage<T> = {
      version: POPUP_MESSAGING_PROTOCOL_VERSION,
      type: POPUP_CONTEXT_RESPONSE,
      popupId,
      popupType,
      context,
    };

    popupWindow.postMessage(
      response,
      window.location.origin
    );

    cleanup();
  };

  window.addEventListener(
    'message',
    handleContextRequest
  );

  cleanupTimer = window.setTimeout(
    cleanup,
    POPUP_CONTEXT_REQUEST_TIMEOUT_MS
  );

  popupWindow.location.href = new URL(
    config.path,
    window.location.origin
  ).toString();

  return popupWindow;
};

export const requestPopupContext = (
  popupType: FichaDeudorPopupType,
  popupId: string
): void => {
  if (!isValidPopupId(popupId)) {
    return;
  }

  const request: PopupContextRequestMessage = {
    version: POPUP_MESSAGING_PROTOCOL_VERSION,
    type: POPUP_CONTEXT_REQUEST,
    popupId,
    popupType,
  };

  window.opener?.postMessage(
    request,
    window.location.origin
  );
};
