export interface PortfolioFilterOptionsApiResponse {
  availableDateFrom: string | null;
  availableDateTo: string | null;
  updatedAt: string | null;
  portfolio: {
    id: number;
  };
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

export interface PortfolioTargetProgressApiResponse {
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

export interface PortfolioPromisesApiResponse {
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

export interface PortfolioEvolutionApiResponse {
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
export interface PortfolioCampaignPerformanceApiResponse {
  updatedAt: string | null;
  campaigns: readonly {
    campaignCode: string;
    campaignName: string;
    dateFrom: string;
    dateTo: string;
    snapshotDate: string;
    assignedPortfolio: number;
    managedPortfolio: number;
    pendingPortfolio: number;
    progressRate: number | null;
    managementCount: number;
    contactabilityRate: number | null;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    promiseFulfillmentRate: number | null;
    paymentCount: number;
    recoveredAmount: number;
    targetAmount: number | null;
  }[];
}

export interface PortfolioSupervisorPerformanceApiResponse {
  dateFrom: string | null;
  dateTo: string | null;
  updatedAt: string | null;
  supervisors: readonly {
    supervisorId: number;
    supervisorName: string;
    advisorCount: number;
    managementCount: number;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    promiseFulfillmentRate: number | null;
    paymentCount: number;
    attributableRecoveredAmount: number;
  }[];
}

export interface PortfolioAdvisorPerformanceApiResponse {
  dateFrom: string | null;
  dateTo: string | null;
  updatedAt: string | null;
  advisors: readonly {
    advisorId: number;
    advisorName: string;
    currentSupervisorId: number | null;
    currentSupervisorName: string | null;
    managementCount: number;
    rpcRate: number | null;
    closeRate: number | null;
    promiseCount: number;
    paymentCount: number;
    attributableRecoveredAmount: number;
  }[];
}

export interface PortfolioOverduePromisesApiResponse {
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
  items: readonly {
    promiseId: number;
    debtorId: number;
    dueDate: string | null;
    overdueDays: number | null;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    agingKey: '1-3' | '4-7' | '8-plus' | 'unclassified';
    advisorId: number | null;
    advisorName: string | null;
    supervisorId: number | null;
    supervisorName: string | null;
  }[];
}


export interface PortfolioDueTodayPromisesApiResponse {
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
