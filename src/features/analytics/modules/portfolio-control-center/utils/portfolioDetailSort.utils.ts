import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';

export const PORTFOLIO_DETAIL_SORT_OPTIONS = {
  advisors: [
    { id: 'managementCount', label: 'Gestiones' },
    { id: 'rpcRate', label: 'RPC' },
    { id: 'closeRate', label: 'Tasa cierre' },
    { id: 'promiseCount', label: 'Promesas' },
    { id: 'paymentCount', label: 'Pagadores' },
    { id: 'attributableRecoveredAmount', label: 'Recaudo atribuible' },
  ],
  supervisors: [
    { id: 'advisorCount', label: 'Asesores' },
    { id: 'managementCount', label: 'Gestiones' },
    { id: 'rpcRate', label: 'RPC' },
    { id: 'closeRate', label: 'Tasa cierre' },
    { id: 'promiseCount', label: 'Promesas' },
    { id: 'promiseFulfillmentRate', label: 'Cumpl. PDP' },
    { id: 'paymentCount', label: 'Pagadores' },
    { id: 'attributableRecoveredAmount', label: 'Recaudo atribuible' },
  ],
  campaigns: [
    { id: 'assignedPortfolio', label: 'Asignada' },
    { id: 'managedPortfolio', label: 'Gestionada' },
    { id: 'progressRate', label: 'Avance' },
    { id: 'managementIntensity', label: 'Intensidad' },
    { id: 'contactabilityRate', label: 'Contactabilidad' },
    { id: 'rpcRate', label: 'RPC' },
    { id: 'closeRate', label: 'Tasa cierre' },
    { id: 'promiseCount', label: 'Promesas' },
    { id: 'promiseFulfillmentRate', label: 'Cumpl. PDP' },
    { id: 'paymentCount', label: 'Pagadores' },
    { id: 'recoveredAmount', label: 'Recaudo' },
    { id: 'targetAmount', label: 'Meta' },
  ],
} as const;

const sortByNumericValueDescending = <T>(
  items: readonly T[],
  getValue: (item: T) => number | null | undefined
): T[] =>
  items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftValue = getValue(left.item);
      const rightValue = getValue(right.item);

      const leftIsEmpty = leftValue === null || leftValue === undefined;
      const rightIsEmpty = rightValue === null || rightValue === undefined;

      if (leftIsEmpty && rightIsEmpty) {
        return left.index - right.index;
      }

      if (leftIsEmpty) {
        return 1;
      }

      if (rightIsEmpty) {
        return -1;
      }

      return rightValue - leftValue || left.index - right.index;
    })
    .map(({ item }) => item);

export const sortAdvisorPerformanceByHighest = (
  items: readonly AdvisorPerformanceItem[],
  sortKey: string
): AdvisorPerformanceItem[] => {
  switch (sortKey) {
    case 'managementCount':
      return sortByNumericValueDescending(items, (item) => item.managementCount);
    case 'rpcRate':
      return sortByNumericValueDescending(items, (item) => item.rpcRate);
    case 'closeRate':
      return sortByNumericValueDescending(items, (item) => item.closeRate);
    case 'promiseCount':
      return sortByNumericValueDescending(items, (item) => item.promiseCount);
    case 'paymentCount':
      return sortByNumericValueDescending(items, (item) => item.paymentCount);
    case 'attributableRecoveredAmount':
      return sortByNumericValueDescending(
        items,
        (item) => item.attributableRecoveredAmount
      );
    default:
      return [...items];
  }
};

export const sortSupervisorPerformanceByHighest = (
  items: readonly SupervisorPerformanceItem[],
  sortKey: string
): SupervisorPerformanceItem[] => {
  switch (sortKey) {
    case 'advisorCount':
      return sortByNumericValueDescending(items, (item) => item.advisorCount);
    case 'managementCount':
      return sortByNumericValueDescending(items, (item) => item.managementCount);
    case 'rpcRate':
      return sortByNumericValueDescending(items, (item) => item.rpcRate);
    case 'closeRate':
      return sortByNumericValueDescending(items, (item) => item.closeRate);
    case 'promiseCount':
      return sortByNumericValueDescending(items, (item) => item.promiseCount);
    case 'promiseFulfillmentRate':
      return sortByNumericValueDescending(
        items,
        (item) => item.promiseFulfillmentRate
      );
    case 'paymentCount':
      return sortByNumericValueDescending(items, (item) => item.paymentCount);
    case 'attributableRecoveredAmount':
      return sortByNumericValueDescending(
        items,
        (item) => item.attributableRecoveredAmount
      );
    default:
      return [...items];
  }
};

export const sortCampaignPerformanceByHighest = (
  items: readonly CampaignPerformanceItem[],
  sortKey: string
): CampaignPerformanceItem[] => {
  switch (sortKey) {
    case 'assignedPortfolio':
      return sortByNumericValueDescending(items, (item) => item.assignedPortfolio);
    case 'managedPortfolio':
      return sortByNumericValueDescending(items, (item) => item.managedPortfolio);
    case 'progressRate':
      return sortByNumericValueDescending(items, (item) => item.progressRate);
    case 'managementIntensity':
      return sortByNumericValueDescending(items, (item) =>
        item.managedPortfolio > 0
          ? item.managementCount / item.managedPortfolio
          : null
      );
    case 'contactabilityRate':
      return sortByNumericValueDescending(items, (item) => item.contactabilityRate);
    case 'rpcRate':
      return sortByNumericValueDescending(items, (item) => item.rpcRate);
    case 'closeRate':
      return sortByNumericValueDescending(items, (item) => item.closeRate);
    case 'promiseCount':
      return sortByNumericValueDescending(items, (item) => item.promiseCount);
    case 'promiseFulfillmentRate':
      return sortByNumericValueDescending(
        items,
        (item) => item.promiseFulfillmentRate
      );
    case 'paymentCount':
      return sortByNumericValueDescending(items, (item) => item.paymentCount);
    case 'recoveredAmount':
      return sortByNumericValueDescending(items, (item) => item.recoveredAmount);
    case 'targetAmount':
      return sortByNumericValueDescending(items, (item) => item.targetAmount);
    default:
      return [...items];
  }
};
