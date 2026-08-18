import type {
  PortfolioControlCenterFilterOptions,
} from '../../../types/portfolioControlCenter.types';

export const PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-08-08',
  availableDateTo: '2026-08-12',
  portfolio: { id: '95' },
  subPortfolios: [
    {
      id: 'portfolio-001',
      label: 'Subcartera Consumo',
    },
    {
      id: 'portfolio-002',
      label: 'Subcartera Recuperación',
    },
  ],
  campaigns: [
    {
      id: 'campaign-001',
      label: 'Cartera Consumo - Agosto',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      availableDateFrom: '2026-08-08',
      availableDateTo: '2026-08-12',
    },
    {
      id: 'campaign-002',
      label: 'Cartera Temprana',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      availableDateFrom: '2026-08-08',
      availableDateTo: '2026-08-12',
    },
    {
      id: 'campaign-003',
      label: 'Recuperación Masiva',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      availableDateFrom: '2026-08-08',
      availableDateTo: '2026-08-12',
    },
    {
      id: 'campaign-004',
      label: 'Cartera Especial',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      availableDateFrom: '2026-08-08',
      availableDateTo: '2026-08-12',
    },
  ],
  supervisors: [
    {
      id: 'supervisor-001',
      label: 'Equipo Norte',
    },
    {
      id: 'supervisor-002',
      label: 'Equipo Centro',
    },
    {
      id: 'supervisor-003',
      label: 'Equipo Sur',
    },
    {
      id: 'supervisor-004',
      label: 'Equipo Especial',
    },
  ],
  availability: {
    subPortfolioCampaigns: [
      {
        subPortfolioId: 'portfolio-001',
        campaignId: 'campaign-001',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        subPortfolioId: 'portfolio-001',
        campaignId: 'campaign-002',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        subPortfolioId: 'portfolio-002',
        campaignId: 'campaign-003',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        subPortfolioId: 'portfolio-002',
        campaignId: 'campaign-004',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
    ],
    supervisorContexts: [
      {
        supervisorId: 'supervisor-001',
        subPortfolioId: 'portfolio-001',
        campaignId: 'campaign-001',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        supervisorId: 'supervisor-002',
        subPortfolioId: 'portfolio-001',
        campaignId: 'campaign-002',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        supervisorId: 'supervisor-003',
        subPortfolioId: 'portfolio-002',
        campaignId: 'campaign-003',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
      {
        supervisorId: 'supervisor-004',
        subPortfolioId: 'portfolio-002',
        campaignId: 'campaign-004',
        availableDateFrom: '2026-08-08',
        availableDateTo: '2026-08-12',
      },
    ],
  },
};
