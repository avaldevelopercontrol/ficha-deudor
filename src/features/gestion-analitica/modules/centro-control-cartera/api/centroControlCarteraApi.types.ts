export interface OpcionesFiltroCarteraApiResponse {
  availableDateFrom: string | null;
  availableDateTo: string | null;
  updatedAt: string | null;
  portfolio: {
    id: number;
  };
  businessUnits?: readonly {
    code: string;
    name: string;
  }[];
  selectedBusinessUnit?: string | null;
  campaigns: readonly {
    code: string;
    name: string;
    year?: number;
    month?: number;
    startDate: string;
    endDate: string;
    availableDateFrom: string;
    availableDateTo: string;
  }[];
  subPortfolios: readonly {
    id: number;
    name: string;
  }[];
  supervisors: readonly {
    id: number;
    name: string;
  }[];
  availability: {
    subPortfolioCampaigns: readonly {
      subPortfolioId: number;
      campaignCode: string;
      availableDateFrom: string;
      availableDateTo: string;
    }[];
    supervisorContexts: readonly {
      supervisorId: number;
      subPortfolioId: number;
      campaignCode: string;
      availableDateFrom: string;
      availableDateTo: string;
    }[];
  };
}

export interface PortfolioSummaryApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  period: {
    dateFrom: string;
    dateTo: string;
    snapshotDate: string;
  };
  updatedAt: string | null;
  freshness?: {
    operationAsOfAt: string | null;
    portfolioBaseRefreshedAt: string | null;
    refreshedAt: string | null;
  };
  summary: {
    assignedPortfolio: number;
    managedPortfolio: number;
    pendingPortfolio: number;
    managementCount: number;
    managementIntensity: number | null;
    recoveredAmount: number;
    contactabilityRate: number | null;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    promiseFulfillmentRate: number | null;
    paymentCount: number;
  };
}

export interface MetaCarteraProgressApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  period: {
    dateTo: string;
    asOfDate: string | null;
  };
  updatedAt: string | null;
  target: {
    monthlyTargetAmount: number;
    expectedToDateAmount: number;
    targetAchievementRate: number | null;
    paceAchievementRate: number | null;
    gapAmount: number;
    gapRate: number | null;
  } | null;
}

export interface PromesasCarteraApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  updatedAt: string | null;
  promises: {
    dueTodayCount: number;
    dueTodayAmount: number;
    overdueCount: number;
    fulfillmentRate: number | null;
  };
}

export interface EvolucionCarteraApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  period: {
    dateFrom: string;
    dateTo: string;
  };
  updatedAt: string | null;
  evolution: readonly {
    period: string;
    assignedPortfolio: number;
    managedPortfolio: number;
    pendingPortfolio: number;
    recoveredAmount: number;
  }[];
}

export interface EvolucionCarteraComparativaApiSeries {
  campaign: {
    code: string;
    name: string;
  };
  period: {
    dateFrom: string;
    dateTo: string;
  };
  coversComparablePeriod: boolean;
  evolution: EvolucionCarteraApiResponse['evolution'];
}

export interface EvolucionCarteraComparativaApiResponse {
  referencePeriod: {
    dateFrom: string;
    dateTo: string;
  };
  comparableProgressMonths: number;
  comparableRecoveryMonths: number;
  previousMonth: EvolucionCarteraComparativaApiSeries | null;
  bestProgress: EvolucionCarteraComparativaApiSeries | null;
  bestRecovery: EvolucionCarteraComparativaApiSeries | null;
}

export interface PanoramaCarteraApiResponse {
  summary: PortfolioSummaryApiResponse;
  targetProgress: MetaCarteraProgressApiResponse;
  promises: PromesasCarteraApiResponse;
  evolution: EvolucionCarteraApiResponse;
}

export interface InicializacionCarteraApiResponse {
  filterOptions: OpcionesFiltroCarteraApiResponse;
  overview: PanoramaCarteraApiResponse | null;
}
export interface RendimientoSupervisorCarteraApiResponse {
  dateFrom: string | null;
  dateTo: string | null;
  updatedAt: string | null;
  supervisors: readonly {
    supervisorId: number;
    supervisorName: string;
    advisorCount: number;
    managementCount: number;
    managedDebtorCount: number | null;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    promiseFulfillmentRate: number | null;
    paymentCount: number;
    attributableRecoveredAmount: number;
  }[];
}

export interface RendimientoAsesorCarteraApiResponse {
  dateFrom: string | null;
  dateTo: string | null;
  updatedAt: string | null;
  advisors: readonly {
    advisorId: number;
    advisorName: string;
    periodSupervisorId: number | null;
    periodSupervisorName: string | null;
    currentSupervisorId: number | null;
    currentSupervisorName: string | null;
    managementCount: number;
    managedDebtorCount: number | null;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    paymentCount: number;
    attributableRecoveredAmount: number;
  }[];
}

export interface PromesasCarteraVencidasApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    overdueCount: number;
    overdueAmount: number;
    outstandingAmount: number;
  };
  aging: readonly {
    key: '1-3' | '4-7' | '8-plus' | 'unclassified';
    label: string;
    count: number;
    promiseAmount: number;
    outstandingAmount: number;
  }[];
  filters: {
    advisors: readonly {
      id: number;
      name: string;
    }[];
    supervisors: readonly {
      id: number;
      name: string;
    }[];
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  items: readonly {
    promiseId: number;
    debtorId: number;
    debtorName: string | null;
    dueDate: string | null;
    overdueDays: number | null;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    situationKey: 'no-payment-recorded' | 'partial-payment';
    situationLabel: string;
    agingKey: '1-3' | '4-7' | '8-plus' | 'unclassified';
    advisorId: number | null;
    advisorName: string | null;
    supervisorId: number | null;
    supervisorName: string | null;
  }[];
}


export interface PromesasCarteraVenceHoyApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    dueTodayCount: number;
    dueTodayAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  status: readonly {
    key: 'pending' | 'partial' | 'covered';
    label: string;
    count: number;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  items: readonly {
    promiseId: number;
    debtorId: number;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    lastPaymentDate: string | null;
    statusKey: 'pending' | 'partial' | 'covered';
    advisorId: number | null;
    advisorName: string | null;
    supervisorId: number | null;
    supervisorName: string | null;
  }[];
}

export interface SeguimientoPromesasCarteraApiResponse {
  campaign: {
    code: string;
    name: string;
  };
  dueDate: string;
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    promiseCount: number;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  status: readonly {
    key:
      | 'pending'
      | 'partial'
      | 'fulfilled'
      | 'broken'
      | 'paid-out-of-range';
    label: string;
    count: number;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  items: readonly {
    promiseId: number;
    debtorId: number;
    debtorName: string | null;
    dueDate: string | null;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    lastPaymentDate: string | null;
    statusKey:
      | 'pending'
      | 'partial'
      | 'fulfilled'
      | 'broken'
      | 'paid-out-of-range';
    managed: boolean;
    managementCount: number;
    callCount: number;
    contactKey: 'direct' | 'indirect' | 'no-contact' | 'no-management';
    contactLabel: string;
    paymentConfirmed: boolean | null;
    lastManagementAt: string | null;
    advisorId: number | null;
    advisorName: string | null;
    supervisorId: number | null;
    supervisorName: string | null;
  }[];
}
