import type React from 'react';

import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';
import type {
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
} from '../utils/portfolioControlCenter.formatters';

interface SupervisorPerformanceTableProps {
  items: readonly SupervisorPerformanceItem[];
}

const columns: Column<SupervisorPerformanceItem>[] = [
  {
    key: 'supervisorName',
    label: 'Supervisor / equipo',
    width: '220px',
  },
  {
    key: 'advisorCount',
    label: 'Asesores',
    align: 'right',
    render: (row) =>
      formatPortfolioInteger(row.advisorCount),
  },
  {
    key: 'managementCount',
    label: 'Gestiones',
    align: 'right',
    render: (row) =>
      formatPortfolioInteger(row.managementCount),
  },
  {
    key: 'rpcRate',
    label: 'RPC',
    align: 'right',
    render: (row) =>
      formatPortfolioPercentage(row.rpcRate),
  },
  {
    key: 'closeRate',
    label: 'Tasa cierre',
    align: 'right',
    render: (row) =>
      formatPortfolioPercentage(row.closeRate),
  },
  {
    key: 'promiseCount',
    label: 'Promesas',
    align: 'right',
    render: (row) =>
      formatPortfolioInteger(row.promiseCount),
  },
  {
    key: 'promiseFulfillmentRate',
    label: 'Cumpl. PDP',
    align: 'right',
    render: (row) =>
      formatPortfolioPercentage(
        row.promiseFulfillmentRate
      ),
  },
  {
    key: 'paymentCount',
    label: 'Pagadores',
    align: 'right',
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

export const SupervisorPerformanceTable: React.FC<
  SupervisorPerformanceTableProps
> = ({ items }) => {
  return (
    <Table
      columns={columns}
      data={[...items]}
      emptyMessage="No hay supervisores para los filtros seleccionados."
      fitToPanel={false}
    />
  );
};
