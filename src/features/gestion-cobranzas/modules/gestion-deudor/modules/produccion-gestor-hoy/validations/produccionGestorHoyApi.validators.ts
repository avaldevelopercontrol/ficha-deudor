import {
  createInvalidGestionDeudorApiResponseError,
  parseGestionDeudorApiRecordCollection,
} from '@features/gestion-cobranzas/modules/gestion-deudor/api/gestionDeudorApiBoundary';

import type {
  ProduccionGestorHoyApi,
} from '../api/produccionGestorHoyApi.types';

const REQUIRED_PRODUCCION_FIELDS = [
  'hora',
  'total',
  'ges4',
  'ges15',
  'ges13',
  'ges4b',
  'ges0',
] as const satisfies readonly (keyof ProduccionGestorHoyApi)[];

const hasOwn = (
  value: Record<string, unknown>,
  property: string
): boolean => {
  return Object.prototype.hasOwnProperty.call(
    value,
    property
  );
};

const parseProduccionRecord = (
  value: Record<string, unknown>,
  fallbackMessage: string
): ProduccionGestorHoyApi => {
  if (
    !REQUIRED_PRODUCCION_FIELDS.every((field) =>
      hasOwn(value, field)
    )
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  return {
    hora: value.hora,
    total: value.total,
    ges4: value.ges4,
    ges15: value.ges15,
    ges13: value.ges13,
    ges4b: value.ges4b,
    ges0: value.ges0,
  };
};

export const parseProduccionGestorHoyResponse = (
  response: unknown,
  fallbackMessage: string
): ProduccionGestorHoyApi[] => {
  return parseGestionDeudorApiRecordCollection(
    response,
    fallbackMessage
  ).map((item) =>
    parseProduccionRecord(item, fallbackMessage)
  );
};
