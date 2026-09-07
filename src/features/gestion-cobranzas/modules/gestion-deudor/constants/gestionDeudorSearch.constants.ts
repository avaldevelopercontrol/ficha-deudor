import type { SelectOption } from '@shared/types';
import type { TipoBusquedaGestionDeudor } from '../types/gestionDeudor.types';

export const TIPO_BUSQUEDA_GESTION_DEUDOR_OPTIONS: SelectOption<TipoBusquedaGestionDeudor>[] = [
  { id: 'R', label: 'RUC' },
  { id: 'D', label: 'DNI' },
  { id: 'F', label: 'TELÉFONO' },
];

export const GESTION_DEUDOR_SEARCH_TAGS = ['RUC', 'DNI', 'Teléfono'] as const;

export const GESTION_DEUDOR_PAGE_SIZE_OPTIONS = [5, 10, 30, 50] as const;
