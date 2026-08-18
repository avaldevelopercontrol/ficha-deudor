import type React from 'react';

import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';
import type {
  AdvisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
} from '../utils/portfolioControlCenter.formatters';

interface AdvisorPerformanceTableProps {
  items: readonly AdvisorPerformanceItem[];
}

const columns: Column<AdvisorPerformanceItem>[] = [
  {
    key: 'advisorName',
    label: 'Asesor',
    width: '245px',
  },
  {
    key: 'currentSupervisorName',
    label: 'Supervisor actual',
    width: '280px',
    render: (row) => row.currentSupervisorName ?? '—',
  },
  {
    key: 'managementCount',
    label: 'Gestiones',
    align: 'right',
    width: '95px',
    render: (row) =>
      formatPortfolioInteger(row.managementCount),
  },
  {
    key: 'rpcRate',
    label: 'RPC',
    align: 'right',
    width: '85px',
    render: (row) =>
      formatPortfolioPercentage(row.rpcRate),
  },
  {
    key: 'closeRate',
    label: 'Tasa cierre',
    align: 'right',
    width: '95px',
    render: (row) =>
      formatPortfolioPercentage(row.closeRate),
  },
  {
    key: 'promiseCount',
    label: 'Promesas',
    align: 'right',
    width: '90px',
    render: (row) =>
      formatPortfolioInteger(row.promiseCount),
  },
  {
    key: 'paymentCount',
    label: 'Pagadores',
    align: 'right',
    width: '90px',
    render: (row) =>
      formatPortfolioInteger(row.paymentCount),
  },
  {
    key: 'attributableRecoveredAmount',
    label: 'Recaudo atribuible',
    align: 'right',
    width: '160px',
    render: (row) =>
      formatPortfolioCurrency(
        row.attributableRecoveredAmount
      ),
  },
];

export const AdvisorPerformanceTable: React.FC<
  AdvisorPerformanceTableProps
> = ({ items }) => {
  return (
    <Table
      columns={columns}
      data={[...items]}
      emptyMessage="No hay asesores para los filtros seleccionados."
      fitToPanel={false}
    />
  );
};
