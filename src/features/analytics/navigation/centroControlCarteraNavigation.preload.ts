import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control/registry/applicationOptionIds';

import {
  prefetchAccesoAnalitica,
} from '../acceso/services/accesoAnalitica.prefetch';

let pageImport: Promise<
  typeof import('../pages/CentroControlCarteraPage')
> | null = null;

export const loadCentroControlCarteraPage = () => {
  if (pageImport) {
    return pageImport;
  }

  const request = import(
    '../pages/CentroControlCarteraPage'
  );
  pageImport = request;

  void request.catch(() => {
    if (pageImport === request) {
      pageImport = null;
    }
  });

  return request;
};

export const preloadCentroControlCarteraNavigation = () => {
  void loadCentroControlCarteraPage().catch(
    () => undefined
  );
  void prefetchAccesoAnalitica(
    APPLICATION_OPTION_IDS.PORTFOLIO_CONTROL_CENTER
  ).catch(() => undefined);
};
