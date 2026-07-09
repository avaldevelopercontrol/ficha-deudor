import { useMemo } from 'react';
import { ActionButton } from '@shared/components/ui';
import type { Column } from '@shared/types';
import type { Gestor } from '../types/gestor.types';

import {
  LISTA_GESTORES_POPUP_COLUMNS,
  LISTA_GESTORES_POPUP_COLUMN_WIDTHS,
  LISTA_GESTORES_POPUP_TEXTS,
} from '../constants/listaGestoresPopup.constants';

interface UseListaGestoresColumnsProps {
  onSelect: (row: Gestor) => void;
}

export const useListaGestoresColumns = ({
  onSelect,
}: UseListaGestoresColumnsProps): Column<Gestor>[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label: LISTA_GESTORES_POPUP_COLUMNS.id,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.id,
        render: (row: Gestor) => row.id,
      },
      {
        key: 'nombre',
        label: LISTA_GESTORES_POPUP_COLUMNS.nombre,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.nombre,
        render: (row: Gestor) => row.nombre || '—',
      },
      {
        key: 'perfil',
        label: LISTA_GESTORES_POPUP_COLUMNS.perfil,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.perfil,
        render: (row: Gestor) => row.perfil || '—',
      },
      {
        key: 'login',
        label: LISTA_GESTORES_POPUP_COLUMNS.login,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.login,
        render: (row: Gestor) => row.login || '—',
      },
      {
        key: 'subZona',
        label: LISTA_GESTORES_POPUP_COLUMNS.subZona,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.subZona,
        render: (row: Gestor) => row.subZona || '—',
      },
      {
        key: 'codRecaudacion',
        label: LISTA_GESTORES_POPUP_COLUMNS.codRecaudacion,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.codRecaudacion,
        render: (row: Gestor) => row.codRecaudacion || '—',
      },
      {
        key: 'acciones',
        label: LISTA_GESTORES_POPUP_COLUMNS.acciones,
        width: LISTA_GESTORES_POPUP_COLUMN_WIDTHS.acciones,
        filterable: false,
        render: (row: Gestor) => (
          <ActionButton
            label={LISTA_GESTORES_POPUP_TEXTS.selectButton}
            variant="primary"
            size="sm"
            onClick={() => onSelect(row)}
          />
        ),
      },
    ],
    [onSelect]
  );
};