import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import type {
  SesionBiDetail,
  SesionesBiPanel,
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';
import {
  normalizeSesionBiDetailApiResponse,
  normalizeSesionesBiPanelApiResponse,
} from './sesionesBiApi.normalizer';
import {
  buildSesionBiDetailPath,
  buildSesionesBiPanelPath,
} from './sesionesBiApi.params';
import {
  parseSesionBiDetailApiResponse,
  parseSesionesBiPanelApiResponse,
} from './sesionesBiApi.validators';

export const fetchSesionesBiPanel = async (
  filters: SesionesBiPanelFilters,
  signal?: AbortSignal
): Promise<SesionesBiPanel> => {
  const response = await analyticsApiClient.get<unknown>(
    buildSesionesBiPanelPath(filters),
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return normalizeSesionesBiPanelApiResponse(
    parseSesionesBiPanelApiResponse(response)
  );
};

export const fetchSesionBiDetail = async (
  sessionId: string,
  signal?: AbortSignal
): Promise<SesionBiDetail> => {
  const response = await analyticsApiClient.get<unknown>(
    buildSesionBiDetailPath(sessionId),
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return normalizeSesionBiDetailApiResponse(
    parseSesionBiDetailApiResponse(response)
  );
};
