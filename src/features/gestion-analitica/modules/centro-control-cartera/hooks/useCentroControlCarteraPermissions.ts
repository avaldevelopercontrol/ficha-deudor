import {
  APPLICATION_OPTION_IDS,
  useOptionPermissions,
} from '@features/access-control';

export const useCentroControlCarteraPermissions = () =>
  useOptionPermissions(
    APPLICATION_OPTION_IDS.ANALISIS_CARTERAS
  );
