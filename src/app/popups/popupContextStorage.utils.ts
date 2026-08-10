import {
  isValidPopupId,
} from '@shared/utils/popupId.utils';
import {
  isFichaDeudorPopupContext,
  isFichaDeudorPopupType,
  type FichaDeudorPopupContext,
  type FichaDeudorPopupType,
} from './popupContext.types';

export const POPUP_CONTEXT_STORAGE_VERSION = 1;
export const POPUP_CONTEXT_MAX_AGE_MS =
  12 * 60 * 60 * 1_000;

const POPUP_CONTEXT_FUTURE_TOLERANCE_MS =
  5 * 60 * 1_000;

interface StoredPopupContextEnvelope<
  T extends FichaDeudorPopupType = FichaDeudorPopupType,
> {
  version: typeof POPUP_CONTEXT_STORAGE_VERSION;
  savedAt: number;
  popupType: T;
  popupId: string;
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

export const getPopupContextStorageKey = (
  popupType: FichaDeudorPopupType,
  popupId: string
): string => {
  return `avalperu_popup_context:${popupType}:${popupId}`;
};

const isStoredPopupContextEnvelope = (
  value: unknown,
  expectedPopupType: FichaDeudorPopupType,
  expectedPopupId: string,
  now: number
): value is StoredPopupContextEnvelope => {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.version !== POPUP_CONTEXT_STORAGE_VERSION ||
    !Number.isFinite(value.savedAt) ||
    typeof value.savedAt !== 'number' ||
    !Number.isSafeInteger(value.savedAt) ||
    !isFichaDeudorPopupType(value.popupType) ||
    !isValidPopupId(value.popupId) ||
    value.popupType !== expectedPopupType ||
    value.popupId !== expectedPopupId
  ) {
    return false;
  }

  const age = now - value.savedAt;

  if (
    age > POPUP_CONTEXT_MAX_AGE_MS ||
    age < -POPUP_CONTEXT_FUTURE_TOLERANCE_MS
  ) {
    return false;
  }

  return isFichaDeudorPopupContext(
    value.popupType,
    value.context
  );
};

export const savePopupContextToStorage = <
  T extends FichaDeudorPopupType,
>(
  storage: Storage,
  popupType: T,
  popupId: string,
  context: FichaDeudorPopupContext<T>,
  now = Date.now()
): void => {
  if (
    !isValidPopupId(popupId) ||
    !isFichaDeudorPopupContext(popupType, context)
  ) {
    throw new Error(
      'No se puede almacenar un contexto de popup inválido.'
    );
  }

  const envelope: StoredPopupContextEnvelope<T> = {
    version: POPUP_CONTEXT_STORAGE_VERSION,
    savedAt: now,
    popupType,
    popupId,
    context,
  };

  storage.setItem(
    getPopupContextStorageKey(popupType, popupId),
    JSON.stringify(envelope)
  );
};

export const loadPopupContextFromStorage = <
  T extends FichaDeudorPopupType,
>(
  storage: Storage,
  popupType: T,
  popupId: string,
  now = Date.now()
): FichaDeudorPopupContext<T> | null => {
  const storageKey = getPopupContextStorageKey(
    popupType,
    popupId
  );

  try {
    const storedValue = storage.getItem(storageKey);

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (
      !isStoredPopupContextEnvelope(
        parsedValue,
        popupType,
        popupId,
        now
      )
    ) {
      storage.removeItem(storageKey);
      return null;
    }

    return parsedValue.context as FichaDeudorPopupContext<T>;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
};
