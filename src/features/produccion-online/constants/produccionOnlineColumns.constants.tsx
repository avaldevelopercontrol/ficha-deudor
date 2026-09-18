import type {
  Column,
} from '@shared/types';

import type {
  ProduccionOnlineRow,
} from '../types/produccionOnline.types';

const formatMetric = (
  value: number
): string =>
  value.toLocaleString('es-PE', {
    maximumFractionDigits: 2,
  });

export const PRODUCCION_ONLINE_COLUMNS:
  Column<ProduccionOnlineRow>[] = [
    {
      key: 'id',
      label: 'Id',
      width: '50px',
    },
    {
      key: 'nombres',
      label: 'Apellidos y Nombres',
      width: '260px',
    },
    {
      key: 'contactosHora',
      label: 'Cont. x Hora',
      width: '130px',
      align: 'right',
      render: (row) =>
        formatMetric(row.contactosHora),
    },
    {
      key: 'totalContactos',
      label: 'Total Cont.',
      width: '120px',
      align: 'right',
      render: (row) =>
        formatMetric(row.totalContactos),
    },
    {
      key: 'totalGestiones',
      label: 'Total Gest.',
      width: '120px',
      align: 'right',
      render: (row) =>
        formatMetric(row.totalGestiones),
    },
    {
      key: 'cartera',
      label: 'Cartera',
      width: '190px',
    },
  ];
