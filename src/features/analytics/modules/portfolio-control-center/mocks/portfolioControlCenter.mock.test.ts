import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  PORTFOLIO_CONTROL_CENTER_MOCK,
} from './portfolioControlCenter.mock';

const sumBy = <T>(
  items: readonly T[],
  selector: (item: T) => number
): number => {
  return items.reduce(
    (total, item) => total + selector(item),
    0
  );
};

export const suite = defineSuite(
  'portfolioControlCenter.mock',
  [
    test(
      'mantiene consistencia entre el resumen y las campañas mock',
      () => {
        const {
          summary,
          campaigns,
        } = PORTFOLIO_CONTROL_CENTER_MOCK;

        assert.equal(
          sumBy(
            campaigns,
            (item) => item.assignedPortfolio
          ),
          summary.assignedPortfolio
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.managedPortfolio
          ),
          summary.managedPortfolio
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.managementCount
          ),
          summary.managementCount
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.promiseCount
          ),
          summary.promiseCount
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.paymentCount
          ),
          summary.paymentCount
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.recoveredAmount
          ),
          summary.recoveredAmount
        );
        assert.equal(
          summary.assignedPortfolio -
            summary.managedPortfolio,
          summary.pendingPortfolio
        );
        assert.equal(
          sumBy(
            campaigns,
            (item) => item.targetAmount ?? 0
          ),
          2_500_000
        );
        assert.equal(
          sumBy(
            PORTFOLIO_CONTROL_CENTER_MOCK.supervisors,
            (item) => item.assignedPortfolio
          ),
          summary.assignedPortfolio
        );
        assert.equal(
          sumBy(
            PORTFOLIO_CONTROL_CENTER_MOCK.supervisors,
            (item) => item.managedPortfolio
          ),
          summary.managedPortfolio
        );
      }
    ),
  ]
);
