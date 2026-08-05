import {
  isValidPopupId,
} from '@shared/utils/popupId.utils';
import {
  isPositiveIntegerValue,
} from '../../../shared/utils/number.utils';
import type {
  Gestor,
  GestorSeleccionadoMessage,
} from '../types/gestor.types';

export const GESTOR_SELECTION_PROTOCOL_VERSION = 1;
export const GESTOR_SELECTED_MESSAGE_TYPE =
  'GESTOR_SELECTED';

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

export const buildGestorSeleccionadoMessage = (
  gestor: Gestor,
  popupId: string
): GestorSeleccionadoMessage => {
  if (
    !isValidPopupId(popupId) ||
    !isPositiveIntegerValue(gestor.id) ||
    gestor.id !== gestor.id.trim() ||
    !gestor.nombre.trim()
  ) {
    throw new Error(
      'No se puede enviar una selección de gestor inválida.'
    );
  }

  return {
    version: GESTOR_SELECTION_PROTOCOL_VERSION,
    type: GESTOR_SELECTED_MESSAGE_TYPE,
    popupId,
    payload: {
      id: gestor.id,
      nombre: gestor.nombre,
    },
  };
};

export const isGestorSeleccionadoMessage = (
  value: unknown,
  expectedPopupId?: string
): value is GestorSeleccionadoMessage => {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.version !==
      GESTOR_SELECTION_PROTOCOL_VERSION ||
    value.type !== GESTOR_SELECTED_MESSAGE_TYPE ||
    !isValidPopupId(value.popupId) ||
    (expectedPopupId !== undefined &&
      value.popupId !== expectedPopupId) ||
    !isRecord(value.payload)
  ) {
    return false;
  }

  return (
    typeof value.payload.id === 'string' &&
    value.payload.id === value.payload.id.trim() &&
    isPositiveIntegerValue(value.payload.id) &&
    typeof value.payload.nombre === 'string' &&
    value.payload.nombre.trim().length > 0
  );
};
