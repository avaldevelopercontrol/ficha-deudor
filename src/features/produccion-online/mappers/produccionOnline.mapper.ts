import type {
  SelectOption,
} from '@shared/types';

import type {
  ProduccionOnlineRow,
} from '../types/produccionOnline.types';
import {
  ensureProduccionArray,
  isProduccionRecord,
  toProduccionFiniteNumber,
  toProduccionInteger,
  toProduccionNonEmptyString,
} from './produccionOnlineParsing.utils';

const mapCatalogResponse = (
  response: unknown,
  fallbackMessage: string,
  idKey: string,
  labelKey: string
): SelectOption<number>[] =>
  ensureProduccionArray(
    response,
    fallbackMessage
  ).flatMap((item) => {
    if (!isProduccionRecord(item)) {
      return [];
    }

    const id = toProduccionInteger(
      item[idKey]
    );
    const label =
      toProduccionNonEmptyString(
        item[labelKey]
      );

    if (id === null || !label) {
      return [];
    }

    return [
      {
        id,
        label,
      },
    ];
  });

export const mapProvinciasProduccionResponse = (
  response: unknown
): SelectOption<number>[] =>
  mapCatalogResponse(
    response,
    'La lista de ciudades recibida no es válida.',
    'nId_Ubigeo',
    'cNombre_Ubigeo'
  );

export const mapPerfilesProduccionResponse = (
  response: unknown
): SelectOption<number>[] =>
  mapCatalogResponse(
    response,
    'La lista de perfiles recibida no es válida.',
    'nid_perfil',
    'per_Nombre'
  );

export const mapClientesProduccionResponse = (
  response: unknown
): SelectOption<number>[] =>
  mapCatalogResponse(
    response,
    'La lista de clientes recibida no es válida.',
    'nId_Cliente',
    'cCli_Siglas'
  );

export const mapProduccionResumenResponse = (
  response: unknown
): ProduccionOnlineRow[] =>
  ensureProduccionArray(
    response,
    'El resumen de producción recibido no es válido.'
  ).flatMap((item, index) => {
    if (!isProduccionRecord(item)) {
      return [];
    }

    const nombres =
      toProduccionNonEmptyString(
        item.nombresUsu
      );
    const cartera =
      toProduccionNonEmptyString(
        item.clienteNom
      );
    const contactosHora =
      toProduccionFiniteNumber(
        item.contactGesProm
      );
    const totalContactos =
      toProduccionFiniteNumber(
        item.contactGes
      );
    const totalGestiones =
      toProduccionFiniteNumber(
        item.totalesGes
      );

    if (
      !nombres ||
      !cartera ||
      contactosHora === null ||
      totalContactos === null ||
      totalGestiones === null
    ) {
      return [];
    }

    return [
      {
        id: index + 1,
        nombres,
        contactosHora,
        totalContactos,
        totalGestiones,
        cartera,
      },
    ];
  });
