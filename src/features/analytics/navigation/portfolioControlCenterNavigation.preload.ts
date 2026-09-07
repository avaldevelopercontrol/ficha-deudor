import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control/registry/applicationOptionIds';

import {
  prefetchAnalyticsAccess,
} from '../access/services/analyticsAccess.prefetch';

let pageImport: Promise<
  typeof import('../pages/PortfolioControlCenterPage')
> | null = null;

export const loadPortfolioControlCenterPage = () => {
  if (pageImport) {
    return pageImport;
  }

  const request = import(
    '../pages/PortfolioControlCenterPage'
  );
  pageImport = request;

  void request.catch(() => {
    if (pageImport === request) {
      pageImport = null;
    }
  });

  return request;
};

export const preloadPortfolioControlCenterNavigation = () => {
  void loadPortfolioControlCenterPage().catch(
    () => undefined
  );
  void prefetchAnalyticsAccess(
    APPLICATION_OPTION_IDS.PORTFOLIO_CONTROL_CENTER
  ).catch(() => undefined);
};
