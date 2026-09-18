import { analyticsApiClient } from '@shared/api/analyticsApiClient';

import type {
  AnalyticsOptionReportClientPublication,
  AnalyticsPowerBiConfiguration,
  AnalyticsPowerBiConfigurationGroup,
  AnalyticsReportClientGroupOption,
  AnalyticsReportClientGroupResolution,
  AnalyticsReportClientPublicationInput,
  SyncAnalyticsOptionInput,
  SyncAnalyticsPowerBiConfigurationInput,
} from '../domain/administracionAccesoAnalitica.types';
import {
  buildSyncAnalyticsPowerBiConfigurationPayload,
  assertAnalyticsPositiveInteger,
} from './administracionAccesoAnalitica.input';
import {
  mapAnalyticsPowerBiConfiguration,
} from './administracionAccesoAnalitica.mapper';
import {
  parseAnalyticsPowerBiConfigurationDto,
} from './administracionAccesoAnalitica.validators';

export type {
  AnalyticsOptionReportClientPublication,
  AnalyticsPowerBiConfigurationGroup,
  AnalyticsReportClientGroupOption,
  AnalyticsReportClientGroupResolution,
  AnalyticsReportClientPublicationInput,
  SyncAnalyticsPowerBiConfigurationInput,
};

export type AnalyticsPowerBiConfigurationResponse =
  AnalyticsPowerBiConfiguration;

const buildAnalyticsPowerBiConfigurationPath = (
  optionId: number
): string =>
  `/v1/Analitica/Acceso/Opciones/${optionId}/ConfiguracionPowerBi`;

export const getAnalyticsPowerBiConfiguration =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsPowerBiConfiguration> => {
    assertAnalyticsPositiveInteger('optionId', optionId);

    const rawResponse = await analyticsApiClient.get<unknown>(
      buildAnalyticsPowerBiConfigurationPath(optionId),
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );
    const response = parseAnalyticsPowerBiConfigurationDto(
      rawResponse
    );

    if (response.optionId !== optionId) {
      throw new Error(
        'Analytics devolvió una configuración Power BI para una opción distinta.'
      );
    }

    return mapAnalyticsPowerBiConfiguration(response);
  };

export const syncAnalyticsPowerBiConfiguration =
  async (
    input: SyncAnalyticsPowerBiConfigurationInput
  ): Promise<void> => {
    const payload = buildSyncAnalyticsPowerBiConfigurationPayload(
      input
    );

    await analyticsApiClient.patch<void>(
      buildAnalyticsPowerBiConfigurationPath(input.optionId),
      payload,
      {
        includeSelectedCrmClientId: false,
      }
    );
  };

export const syncAnalyticsOption = async (
  input: SyncAnalyticsOptionInput
): Promise<void> =>
  syncAnalyticsPowerBiConfiguration(input);
