import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
} from './portfolioControlCenterApi.types';
import {
  expectArray,
  expectEnum,
  expectFiniteNumber,
  expectNonEmptyString,
  expectNonNegativeInteger,
  expectNullableDate,
  expectNullableDateTime,
  expectNullableFiniteNumber,
  expectNullablePositiveInteger,
  expectNullableString,
  expectPositiveInteger,
  expectRecord,
  type ContractParser,
  validateCampaign,
  validatePagination,
} from './portfolioControlCenterApi.validation';

const OVERDUE_AGING_KEYS = new Set([
  '1-3',
  '4-7',
  '8-plus',
  'unclassified',
]);

const DUE_TODAY_STATUS_KEYS = new Set([
  'pending',
  'partial',
  'covered',
]);

export const parsePortfolioSupervisorPerformanceApiResponse: ContractParser<PortfolioSupervisorPerformanceApiResponse> = (
  value
) => {
  const contract = 'Portfolio Supervisor Performance';
  const response = expectRecord(value, contract, '$');

  expectNullableDate(response.dateFrom, contract, '$.dateFrom');
  expectNullableDate(response.dateTo, contract, '$.dateTo');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');
  const supervisors = expectArray(
    response.supervisors,
    contract,
    '$.supervisors'
  );

  supervisors.forEach((rawItem, index) => {
    const path = `$.supervisors[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(item.supervisorId, contract, `${path}.supervisorId`);
    expectNonEmptyString(
      item.supervisorName,
      contract,
      `${path}.supervisorName`
    );
    for (const key of [
      'advisorCount',
      'managementCount',
      'promiseCount',
      'paymentCount',
    ] as const) {
      expectNonNegativeInteger(item[key], contract, `${path}.${key}`);
    }
    for (const key of [
      'rpcRate',
      'closeRate',
      'promiseFulfillmentRate',
    ] as const) {
      expectNullableFiniteNumber(item[key], contract, `${path}.${key}`);
    }
    expectFiniteNumber(
      item.attributableRecoveredAmount,
      contract,
      `${path}.attributableRecoveredAmount`
    );
  });

  return value as PortfolioSupervisorPerformanceApiResponse;
};

export const parsePortfolioAdvisorPerformanceApiResponse: ContractParser<PortfolioAdvisorPerformanceApiResponse> = (
  value
) => {
  const contract = 'Portfolio Advisor Performance';
  const response = expectRecord(value, contract, '$');

  expectNullableDate(response.dateFrom, contract, '$.dateFrom');
  expectNullableDate(response.dateTo, contract, '$.dateTo');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');
  const advisors = expectArray(response.advisors, contract, '$.advisors');

  advisors.forEach((rawItem, index) => {
    const path = `$.advisors[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(item.advisorId, contract, `${path}.advisorId`);
    expectNonEmptyString(item.advisorName, contract, `${path}.advisorName`);
    expectNullablePositiveInteger(
      item.currentSupervisorId,
      contract,
      `${path}.currentSupervisorId`
    );
    expectNullableString(
      item.currentSupervisorName,
      contract,
      `${path}.currentSupervisorName`
    );
    for (const key of [
      'managementCount',
      'promiseCount',
      'paymentCount',
    ] as const) {
      expectNonNegativeInteger(item[key], contract, `${path}.${key}`);
    }
    for (const key of ['rpcRate', 'closeRate'] as const) {
      expectNullableFiniteNumber(item[key], contract, `${path}.${key}`);
    }
    expectFiniteNumber(
      item.attributableRecoveredAmount,
      contract,
      `${path}.attributableRecoveredAmount`
    );
  });

  return value as PortfolioAdvisorPerformanceApiResponse;
};

export const parsePortfolioOverduePromisesApiResponse: ContractParser<PortfolioOverduePromisesApiResponse> = (
  value
) => {
  const contract = 'Portfolio Overdue Promises';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');
  expectNullableDate(response.asOfDate, contract, '$.asOfDate');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');

  const summary = expectRecord(response.summary, contract, '$.summary');
  expectNonNegativeInteger(
    summary.overdueCount,
    contract,
    '$.summary.overdueCount'
  );
  expectFiniteNumber(summary.overdueAmount, contract, '$.summary.overdueAmount');
  expectFiniteNumber(
    summary.outstandingAmount,
    contract,
    '$.summary.outstandingAmount'
  );

  const aging = expectArray(response.aging, contract, '$.aging');
  aging.forEach((rawItem, index) => {
    const path = `$.aging[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectEnum(
      item.key,
      OVERDUE_AGING_KEYS,
      contract,
      `${path}.key`
    );
    expectNonEmptyString(item.label, contract, `${path}.label`);
    expectNonNegativeInteger(item.count, contract, `${path}.count`);
    expectFiniteNumber(item.promiseAmount, contract, `${path}.promiseAmount`);
    expectFiniteNumber(
      item.outstandingAmount,
      contract,
      `${path}.outstandingAmount`
    );
  });

  const filters = expectRecord(response.filters, contract, '$.filters');
  for (const [key, path] of [
    ['advisors', '$.filters.advisors'],
    ['supervisors', '$.filters.supervisors'],
  ] as const) {
    const options = expectArray(filters[key], contract, path);
    options.forEach((rawOption, index) => {
      const optionPath = `${path}[${index}]`;
      const option = expectRecord(rawOption, contract, optionPath);
      expectPositiveInteger(option.id, contract, `${optionPath}.id`);
      expectNonEmptyString(option.name, contract, `${optionPath}.name`);
    });
  }

  if (response.pagination !== undefined) {
    validatePagination(response.pagination, contract, '$.pagination');
  }

  const items = expectArray(response.items, contract, '$.items');
  items.forEach((rawItem, index) => {
    const path = `$.items[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(item.promiseId, contract, `${path}.promiseId`);
    expectPositiveInteger(item.debtorId, contract, `${path}.debtorId`);
    expectNullableDate(item.dueDate, contract, `${path}.dueDate`);
    if (item.overdueDays !== null) {
      expectNonNegativeInteger(item.overdueDays, contract, `${path}.overdueDays`);
    }
    for (const key of [
      'promiseAmount',
      'paidAmount',
      'outstandingAmount',
    ] as const) {
      expectFiniteNumber(item[key], contract, `${path}.${key}`);
    }
    expectEnum(
      item.agingKey,
      OVERDUE_AGING_KEYS,
      contract,
      `${path}.agingKey`
    );
    expectNullablePositiveInteger(item.advisorId, contract, `${path}.advisorId`);
    expectNullableString(item.advisorName, contract, `${path}.advisorName`);
    expectNullablePositiveInteger(
      item.supervisorId,
      contract,
      `${path}.supervisorId`
    );
    expectNullableString(
      item.supervisorName,
      contract,
      `${path}.supervisorName`
    );
  });

  return value as PortfolioOverduePromisesApiResponse;
};

export const parsePortfolioDueTodayPromisesApiResponse: ContractParser<PortfolioDueTodayPromisesApiResponse> = (
  value
) => {
  const contract = 'Portfolio Due Today Promises';
  const response = expectRecord(value, contract, '$');

  validateCampaign(response.campaign, contract, '$.campaign');
  expectNullableDate(response.asOfDate, contract, '$.asOfDate');
  expectNullableDateTime(response.updatedAt, contract, '$.updatedAt');

  const summary = expectRecord(response.summary, contract, '$.summary');
  expectNonNegativeInteger(
    summary.dueTodayCount,
    contract,
    '$.summary.dueTodayCount'
  );
  for (const key of [
    'dueTodayAmount',
    'paidAmount',
    'outstandingAmount',
  ] as const) {
    expectFiniteNumber(summary[key], contract, `$.summary.${key}`);
  }

  const status = expectArray(response.status, contract, '$.status');
  status.forEach((rawItem, index) => {
    const path = `$.status[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectEnum(
      item.key,
      DUE_TODAY_STATUS_KEYS,
      contract,
      `${path}.key`
    );
    expectNonEmptyString(item.label, contract, `${path}.label`);
    expectNonNegativeInteger(item.count, contract, `${path}.count`);
    for (const key of [
      'promiseAmount',
      'paidAmount',
      'outstandingAmount',
    ] as const) {
      expectFiniteNumber(item[key], contract, `${path}.${key}`);
    }
  });

  if (response.pagination !== undefined) {
    validatePagination(response.pagination, contract, '$.pagination');
  }

  const items = expectArray(response.items, contract, '$.items');
  items.forEach((rawItem, index) => {
    const path = `$.items[${index}]`;
    const item = expectRecord(rawItem, contract, path);
    expectPositiveInteger(item.promiseId, contract, `${path}.promiseId`);
    expectPositiveInteger(item.debtorId, contract, `${path}.debtorId`);
    for (const key of [
      'promiseAmount',
      'paidAmount',
      'outstandingAmount',
    ] as const) {
      expectFiniteNumber(item[key], contract, `${path}.${key}`);
    }
    expectNullableDate(
      item.lastPaymentDate,
      contract,
      `${path}.lastPaymentDate`
    );
    expectEnum(
      item.statusKey,
      DUE_TODAY_STATUS_KEYS,
      contract,
      `${path}.statusKey`
    );
    expectNullablePositiveInteger(item.advisorId, contract, `${path}.advisorId`);
    expectNullableString(item.advisorName, contract, `${path}.advisorName`);
    expectNullablePositiveInteger(
      item.supervisorId,
      contract,
      `${path}.supervisorId`
    );
    expectNullableString(
      item.supervisorName,
      contract,
      `${path}.supervisorName`
    );
  });

  return value as PortfolioDueTodayPromisesApiResponse;
};
