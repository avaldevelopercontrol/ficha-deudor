import {
  useMemo,
} from 'react';

import type {
  Column,
} from '@shared/types';

import {
  PRODUCCION_GESTOR_HOY_COLUMNS,
  PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS,
} from '../constants/produccionGestorHoy.constants';

import type {
  ProduccionGestorHoyRow,
} from '../types/produccionGestorHoy.types';

export const useProduccionGestorHoyColumns =
  (): Column<ProduccionGestorHoyRow>[] => {
    return useMemo(
      () => [
        {
          key: 'hora',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .hora,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .hora,
        },
        {
          key:
            'totalGestionesTelefonicas',

          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .totalGestionesTelefonicas,

          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .totalGestionesTelefonicas,
        },
        {
          key: 'contactos',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .contactos,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .contactos,
        },
        {
          key: 'busquedas',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .busquedas,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .busquedas,
        },
        {
          key: 'sms',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .sms,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .sms,
        },
        {
          key: 'noContactos',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .noContactos,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .noContactos,
        },
        {
          key: 'otros',
          label:
            PRODUCCION_GESTOR_HOY_COLUMNS
              .otros,
          width:
            PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS
              .otros,
        },
      ],
      []
    );
  };