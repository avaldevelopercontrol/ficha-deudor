import type React from 'react';

import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';
import type {
  CampaignPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
  formatPortfolioIntensityPercentage,
} from '../utils/portfolioControlCenter.formatters';

interface CampaignPerformanceTableProps {
  items: readonly CampaignPerformanceItem[];
}

const columns: Column<CampaignPerformanceItem>[] = [
  {
    key: 'campaignName',
    label: 'Campaña',
    width: '220px',
  },
  {
    key: 'assignedPortfolio',
    label: 'Asignada',
    align: 'right',
    render: (row) =>
      formatPortfolioInteger(row.assignedPortfolio),
  },
  {
    key: 'managedPortfolio',
    label: 'Gestionada',
    align: 'right',
    render: (row) =>
      formatPortfolioInteger(row.managedPortfolio),
  },
  {
    key: 'progressRate',
    label: 'Avance',
    align: 'right',
    render: (row) =>
      formatPortfolioPercentage(row.progressRate),
  },
  {
    key: 'managementCount',
    label: 'Intensidad',
    align: 'right',
    render: (row) =>
      formatPortfolioIntensityPercentage(
        row.managedPortfolio > 0
          ? row.managementCount /
              row.managedPortfolio
          : null
      ),
  },
  {
    key: 'contactabilityRate',
    label: 'Contactabilidad',
    align: 'right',
    render: (row) =>
      formatPortfolioPercentage(
        row.contactabilityRate
      ),
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
    key: 'recoveredAmount',
    label: 'Recaudo',
    align: 'right',
    width: '145px',
    render: (row) =>
      formatPortfolioCurrency(row.recoveredAmount),
  },
  {
    key: 'targetAmount',
    label: 'Meta',
    align: 'right',
    width: '145px',
    render: (row) =>
      formatPortfolioCurrency(row.targetAmount),
  },
];

export const CampaignPerformanceTable: React.FC<
  CampaignPerformanceTableProps
> = ({ items }) => {
  return (
    <Table
      columns={columns}
      data={[...items]}
      emptyMessage="No hay campañas para los filtros seleccionados."
      fitToPanel={false}
    />
  );
};
