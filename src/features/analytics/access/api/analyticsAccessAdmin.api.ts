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
} from '../domain/analyticsAccessAdmin.types';
import {
  buildSyncAnalyticsPowerBiConfigurationPayload,
  assertAnalyticsPositiveInteger,
} from './analyticsAccessAdmin.input';
import {
  mapAnalyticsPowerBiConfiguration,
} from './analyticsAccessAdmin.mapper';
import {
  parseAnalyticsPowerBiConfigurationDto,
} from './analyticsAccessAdmin.validators';

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

export const getAnalyticsPowerBiConfiguration =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsPowerBiConfiguration> => {
    assertAnalyticsPositiveInteger('optionId', optionId);

    const rawResponse = await analyticsApiClient.get<unknown>(
      `/api/v1/analytics-access/options/${optionId}/power-bi-configuration`,
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
      `/api/v1/analytics-access/options/${input.optionId}/power-bi-configuration`,
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
