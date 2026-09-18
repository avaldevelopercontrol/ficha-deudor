import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import type {
  PowerBiSessionActivityInput,
  PowerBiSessionCloseInput,
  PowerBiSessionOpenInput,
  PowerBiSessionOpened,
} from '../domain/powerBiSession.types';

interface AbrirSesionPowerBiResponseDto {
  idSesion: string;
  fechaInicioUtc: string;
}

const POWER_BI_SESSIONS_PATH =
  '/v1/Analitica/PowerBi/Sesiones';

const sessionPath = (
  sessionId: string,
  suffix: string
): string =>
  `${POWER_BI_SESSIONS_PATH}/${encodeURIComponent(sessionId)}/${suffix}`;

export const openPowerBiSession = async (
  input: PowerBiSessionOpenInput,
  signal?: AbortSignal
): Promise<PowerBiSessionOpened> => {
  const response =
    await analyticsApiClient.post<AbrirSesionPowerBiResponseDto>(
      POWER_BI_SESSIONS_PATH,
      {
        idOpcion: input.optionId,
        idCliente: input.client?.clientId ?? null,
        reportClient: input.client?.name ?? null,
      },
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );

  if (
    typeof response?.idSesion !== 'string' ||
    response.idSesion.trim().length === 0
  ) {
    throw new Error(
      'Analytics devolvió una sesión Power BI sin identificador.'
    );
  }

  if (
    typeof response.fechaInicioUtc !== 'string' ||
    response.fechaInicioUtc.trim().length === 0
  ) {
    throw new Error(
      'Analytics devolvió una sesión Power BI sin fecha de inicio.'
    );
  }

  return {
    sessionId: response.idSesion,
    startedAtUtc: response.fechaInicioUtc,
  };
};

export const updatePowerBiSessionActivity = (
  sessionId: string,
  input: PowerBiSessionActivityInput
): Promise<void> =>
  analyticsApiClient.put<void>(
    sessionPath(sessionId, 'Actividad'),
    {
      segundosVisibles: input.visibleSeconds,
      visible: input.visible,
    },
    {
      includeSelectedCrmClientId: false,
    }
  );

export const closePowerBiSession = (
  sessionId: string,
  input: PowerBiSessionCloseInput,
  keepalive = false
): Promise<void> =>
  analyticsApiClient.post<void>(
    sessionPath(sessionId, 'Cerrar'),
    {
      segundosVisibles: input.visibleSeconds,
      motivoCierre: input.reason,
    },
    {
      includeSelectedCrmClientId: false,
      keepalive,
    }
  );
