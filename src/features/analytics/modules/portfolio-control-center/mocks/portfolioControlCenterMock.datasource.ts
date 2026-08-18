import type {
  PortfolioControlCenterData,
  PortfolioControlCenterDataSource,
  PortfolioControlCenterFilterOptions,
} from '../../../types/portfolioControlCenter.types';
import {
  PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK,
} from './portfolioControlCenterFilterOptions.mock';
import {
  buildPortfolioControlCenterMockData,
} from './portfolioControlCenterMock.utils';

const MOCK_DELAY_MS = 300;
const MOCK_FILTER_DELAY_MS = 120;

const createAbortError = (): Error => {
  const error = new Error(
    'La solicitud fue cancelada.'
  );
  error.name = 'AbortError';

  return error;
};

const waitForMockResponse = (
  signal: AbortSignal,
  delayMs: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const handleAbort = () => {
      clearTimeout(timeoutId);
      reject(createAbortError());
    };

    const timeoutId = setTimeout(() => {
      signal.removeEventListener(
        'abort',
        handleAbort
      );
      resolve();
    }, delayMs);

    signal.addEventListener(
      'abort',
      handleAbort,
      { once: true }
    );
  });
};

const cloneFilterOptions = (): PortfolioControlCenterFilterOptions => ({
  ...PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK,
  portfolio: PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.portfolio
    ? { ...PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.portfolio }
    : null,
  subPortfolios:
    PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.subPortfolios.map(
      (item) => ({ ...item })
    ),
  campaigns:
    PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.campaigns.map(
      (item) => ({ ...item })
    ),
  supervisors:
    PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.supervisors.map(
      (item) => ({ ...item })
    ),
  availability: {
    subPortfolioCampaigns:
      PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.availability.subPortfolioCampaigns.map(
        (item) => ({ ...item })
      ),
    supervisorContexts:
      PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK.availability.supervisorContexts.map(
        (item) => ({ ...item })
      ),
  },
});

export const portfolioControlCenterMockDataSource: PortfolioControlCenterDataSource = {
  async load(filters, signal): Promise<PortfolioControlCenterData> {
    await waitForMockResponse(
      signal,
      MOCK_DELAY_MS
    );

    return buildPortfolioControlCenterMockData(
      filters
    );
  },

  async loadFilterOptions(signal) {
    await waitForMockResponse(
      signal,
      MOCK_FILTER_DELAY_MS
    );

    return cloneFilterOptions();
  },
};
