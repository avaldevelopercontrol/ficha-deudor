import type {
  PortfolioBootstrapApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioFilterOptionsApiResponse,
  PortfolioOverviewApiResponse,
  PortfolioPromisesApiResponse,
  PortfolioSummaryApiResponse,
  PortfolioTargetProgressApiResponse,
} from './portfolioControlCenterApi.types';
import {
  expectArray,
  expectDate,
  expectFiniteNumber,
  expectNonEmptyString,
  expectNonNegativeInteger,
  expectNullableDate,
  expectNullableDateTime,
  expectNullableFiniteNumber,
  expectNullableString,
  expectPositiveInteger,
  expectRecord,
  fail,
  type ContractParser,
  validateCampaign,
} from './portfolioControlCenterApi.validation';

export const parsePortfolioFilterOptionsApiResponse: ContractParser<PortfolioFilterOptionsApiResponse> = (
  value
) => {
  const contract = 'Portfolio Filter Options';
  const response = expectRecord(value, contract, '$');

  expectNullableDate(
    response.availableDateFrom,
    contract,
    '$.availableDateFrom'
  );
  expectNullableDate(
    response.availableDateTo,
    contract,
    '$.availableDateTo'
  );
  expectNullableDateTime(
    response.updatedAt,
    contract,
    '$.updatedAt'
  );

  const portfolio = expectRecord(
    response.portfolio,
    contract,
    '$.portfolio'
  );
  expectPositiveInteger(portfolio.id, contract, '$.portfolio.id');

  const businessUnitCodes: string[] = [];
  if (response.businessUnits !== undefined) {
    const businessUnits = expectArray(
      response.businessUnits,
      contract,
      '$.businessUnits'
    );
    businessUnits.forEach((rawItem, index) => {
      const path = `$.businessUnits[${index}]`;
      const item = expectRecord(rawItem, contract, path);
      businessUnitCodes.push(
        expectNonEmptyString(item.code, contract, `${path}.code`)
      );
      expectNonEmptyString(item.name, contract, `${path}.name`);
    });
  }

  if (response.selectedBusinessUnit !== undefined) {
    const selectedBusinessUnit = expectNullableString(
      response.selectedBusinessUnit,
      contract,
      '$.selectedBusinessUnit'
    );

    if (
      selectedBusinessUnit !== null &&
      response.businessUnits !== undefined &&
      !businessUnitCodes.some(
        (code) =>
          code.localeCompare(
            selectedBusinessUnit,
            undefined,
            { sensitivity: 'accent' }
          ) === 0
      )
    ) {
      fail(
        contract,
        '$.selectedBusinessUnit',
        'una Business Unit incluida en $.businessUnits o null'
      );
    }
  }

  const campaigns = expectArray(
    response.campaigns,
    contract,
    '$.campaigns'
  );
  campaigns.forEach((rawCampaign, index) => {
    const path = `$.campaigns[${index}]`;
    const campaign = expectRecord(rawCampaign, contract, path);
    expectNonEmptyString(campaign.code, contract, `${path}.code`);
    expectNonEmptyString(campaign.name, contract, `${path}.name`);

    if (campaign.year !== undefined) {
      expectPositiveInteger(campaign.year, contract, `${path}.year`);
    }
    if (campaign.month !== undefined) {
      const month = expectPositiveInteger(
        campaign.month,
        contract,
        `${path}.month`
      );
      if (month > 12) {
        fail(contract, `${path}.month`, 'un mes entre 1 y 12');
      }
    }

    expectDate(campaign.startDate, contract, `${path}.startDate`);
    expectDate(campaign.endDate, contract, `${path}.endDate`);
    expectDate(
      campaign.availableDateFrom,
      contract,
      `${path}.availableDateFrom`
    );
    expectDate(
      campaign.availableDateTo,
      contract,
      `${path}.availableDateTo`
    );
  });

  for (const [key, path] of [
    ['subPortfolios', '$.subPortfolios'],
    ['supervisors', '$.supervisors'],
  ] as const) {
    const items = expectArray(response[key], contract, path);
    items.forEach((rawItem, index) => {
      const itemPath = `${path}[${index}]`;
      const item = expectRecord(rawItem, contract, itemPath);
      expectPositiveInteger(item.id, contract, `${itemPath}.id`);
      expectNonEmptyString(item.name, contract, `${itemPath}.name`);
    });
  }

  const availability = expectRecord(
    response.availability,
    contract,
    '$.availability'
  );
  const subPortfolioCampaigns = expectArray(
    availability.subPortfolioCampaigns,
    contract,
    '$.availability.subPortfolioCampaigns'
  );
  subPortfolioCampaigns.forEach((rawItem, index) => {
    const path = `$.availability.subPortfolioCampaigns[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(
      item.subPortfolioId,
      contract,
      `${path}.subPortfolioId`
    );
    expectNonEmptyString(
      item.campaignCode,
      contract,
      `${path}.campaignCode`
    );
    expectDate(
      item.availableDateFrom,
      contract,
      `${path}.availableDateFrom`
    );
    expectDate(
      item.availableDateTo,
      contract,
      `${path}.availableDateTo`
    );
  });

  const supervisorContexts = expectArray(
    availability.supervisorContexts,
    contract,
    '$.availability.supervisorContexts'
  );
  supervisorContexts.forEach((rawItem, index) => {
    const path = `$.availability.supervisorContexts[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(
      item.supervisorId,
      contract,
      `${path}.supervisorId`
    );
    expectPositiveInteger(
      item.subPortfolioId,
      contract,
      `${path}.subPortfolioId`
    );
    expectNonEmptyString(
      item.campaignCode,
      contract,
      `${path}.campaignCode`
    );
    expectDate(
      item.availableDateFrom,
      contract,
      `${path}.availableDateFrom`
    );
    expectDate(
      item.availableDateTo,
      contract,
      `${path}.availableDateTo`
    );
  });

  return value as PortfolioFilterOptionsApiResponse;
};

export const parsePortfolioSummaryApiResponse: ContractParser<PortfolioSummaryApiResponse> = (
  value
) => {
  const contract = 'Portfolio Summary';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');

  const period = expectRecord(response.period, contract, '$.period');
  expectDate(period.dateFrom, contract, '$.period.dateFrom');
  expectDate(period.dateTo, contract, '$.period.dateTo');
  expectDate(period.snapshotDate, contract, '$.period.snapshotDate');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');

  if (response.freshness !== undefined) {
    const freshness = expectRecord(
      response.freshness,
      contract,
      '$.freshness'
    );
    expectNullableDateTime(
      freshness.operationAsOfAt,
      contract,
      '$.freshness.operationAsOfAt'
    );
    expectNullableDateTime(
      freshness.portfolioBaseRefreshedAt,
      contract,
      '$.freshness.portfolioBaseRefreshedAt'
    );
    expectNullableDateTime(
      freshness.refreshedAt,
      contract,
      '$.freshness.refreshedAt'
    );
  }

  const summary = expectRecord(response.summary, contract, '$.summary');
  for (const key of [
    'assignedPortfolio',
    'managedPortfolio',
    'pendingPortfolio',
    'recoveredAmount',
  ] as const) {
    expectFiniteNumber(summary[key], contract, `$.summary.${key}`);
  }
  for (const key of [
    'managementCount',
    'promiseCount',
    'paymentCount',
  ] as const) {
    expectNonNegativeInteger(summary[key], contract, `$.summary.${key}`);
  }
  for (const key of [
    'managementIntensity',
    'contactabilityRate',
    'rpcRate',
    'closeRate',
    'promiseFulfillmentRate',
  ] as const) {
    expectNullableFiniteNumber(summary[key], contract, `$.summary.${key}`);
  }

  return value as PortfolioSummaryApiResponse;
};

export const parsePortfolioTargetProgressApiResponse: ContractParser<PortfolioTargetProgressApiResponse> = (
  value
) => {
  const contract = 'Portfolio Target Progress';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');
  const period = expectRecord(response.period, contract, '$.period');
  expectDate(period.dateTo, contract, '$.period.dateTo');
  expectNullableDate(period.asOfDate, contract, '$.period.asOfDate');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');

  if (response.target !== null) {
    const target = expectRecord(response.target, contract, '$.target');
    for (const key of [
      'monthlyTargetAmount',
      'expectedToDateAmount',
      'gapAmount',
    ] as const) {
      expectFiniteNumber(target[key], contract, `$.target.${key}`);
    }
    for (const key of [
      'targetAchievementRate',
      'paceAchievementRate',
      'gapRate',
    ] as const) {
      expectNullableFiniteNumber(target[key], contract, `$.target.${key}`);
    }
  }

  return value as PortfolioTargetProgressApiResponse;
};

export const parsePortfolioPromisesApiResponse: ContractParser<PortfolioPromisesApiResponse> = (
  value
) => {
  const contract = 'Portfolio Promises';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');
  const promises = expectRecord(response.promises, contract, '$.promises');
  expectNonNegativeInteger(
    promises.dueTodayCount,
    contract,
    '$.promises.dueTodayCount'
  );
  expectFiniteNumber(
    promises.dueTodayAmount,
    contract,
    '$.promises.dueTodayAmount'
  );
  expectNonNegativeInteger(
    promises.overdueCount,
    contract,
    '$.promises.overdueCount'
  );
  expectNullableFiniteNumber(
    promises.fulfillmentRate,
    contract,
    '$.promises.fulfillmentRate'
  );

  return value as PortfolioPromisesApiResponse;
};

export const parsePortfolioEvolutionApiResponse: ContractParser<PortfolioEvolutionApiResponse> = (
  value
) => {
  const contract = 'Portfolio Evolution';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');
  const period = expectRecord(response.period, contract, '$.period');
  expectDate(period.dateFrom, contract, '$.period.dateFrom');
  expectDate(period.dateTo, contract, '$.period.dateTo');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');

  const evolution = expectArray(response.evolution, contract, '$.evolution');
  evolution.forEach((rawItem, index) => {
    const path = `$.evolution[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectDate(item.period, contract, `${path}.period`);
    for (const key of [
      'assignedPortfolio',
      'managedPortfolio',
      'pendingPortfolio',
      'recoveredAmount',
    ] as const) {
      expectFiniteNumber(item[key], contract, `${path}.${key}`);
    }
  });

  return value as PortfolioEvolutionApiResponse;
};

export const parsePortfolioOverviewApiResponse: ContractParser<PortfolioOverviewApiResponse> = (
  value
) => {
  const contract = 'Portfolio Overview';
  const response = expectRecord(value, contract, '$');

  parsePortfolioSummaryApiResponse(response.summary);
  parsePortfolioTargetProgressApiResponse(response.targetProgress);
  parsePortfolioPromisesApiResponse(response.promises);
  parsePortfolioEvolutionApiResponse(response.evolution);

  return value as PortfolioOverviewApiResponse;
};

export const parsePortfolioBootstrapApiResponse: ContractParser<PortfolioBootstrapApiResponse> = (
  value
) => {
  const contract = 'Portfolio Bootstrap';
  const response = expectRecord(value, contract, '$');

  parsePortfolioFilterOptionsApiResponse(response.filterOptions);
  if (response.overview !== null) {
    parsePortfolioOverviewApiResponse(response.overview);
  }

  return value as PortfolioBootstrapApiResponse;
};
