import {
  getAnalyticsPowerBiConfiguration,
  syncAnalyticsOption,
  syncAnalyticsPowerBiConfiguration,
  type AnalyticsOptionReportClientPublication,
  type AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import {
  createOpcion,
  fetchOpciones,
  updateOpcion,
} from '../../api/opcionesApi';

import type {
  Modulo,
  OpcionApi,
} from '../../types/opcion.types';
import type {
  EditarModuloFormData,
  RegistrarModuloFormData,
} from '../../domain/modulos/moduloForm.types';

export type ModuloReportClientPublication =
  AnalyticsOptionReportClientPublication;
export type ModuloReportClientPublicationInput =
  AnalyticsReportClientPublicationInput;

export const loadModulos = fetchOpciones;

export const loadPowerBiModuleConfiguration = (
  moduloId: number,
  signal: AbortSignal
) =>
  getAnalyticsPowerBiConfiguration(
    moduloId,
    signal
  );

export class ModuloAnalyticsSyncError extends Error {
  readonly hasPersistedSisgesChanges = true;

  constructor(message: string) {
    super(message);
    this.name = 'ModuloAnalyticsSyncError';
  }
}

export interface ModuloMaintenanceDependencies {
  createOpcion: typeof createOpcion;
  updateOpcion: typeof updateOpcion;
  syncAnalyticsOption: typeof syncAnalyticsOption;
  syncAnalyticsPowerBiConfiguration:
    typeof syncAnalyticsPowerBiConfiguration;
}

const DEFAULT_DEPENDENCIES: ModuloMaintenanceDependencies = {
  createOpcion,
  updateOpcion,
  syncAnalyticsOption,
  syncAnalyticsPowerBiConfiguration,
};

const resolveErrorDetail = (error: unknown): string =>
  error instanceof Error && error.message.trim()
    ? ` ${error.message.trim()}`
    : '';

export interface RegistrarModuloCommand {
  form: RegistrarModuloFormData;
  modulos: readonly Modulo[];
  authenticatedUserId: string;
  groupIds?: readonly number[];
}

export interface ActualizarModuloCommand {
  moduloDetalle: OpcionApi;
  form: EditarModuloFormData;
  modulos: readonly Modulo[];
  authenticatedUserId: string;
  groupIds?: readonly number[];
  reportClientPublications?:
    | readonly AnalyticsReportClientPublicationInput[]
    | null;
}

export const registrarModulo = async (
  command: RegistrarModuloCommand,
  dependencies: ModuloMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> => {
  const created = await dependencies.createOpcion(
    command.form,
    command.modulos,
    command.authenticatedUserId
  );

  if (!command.form.esPowerBI) {
    return;
  }

  try {
    await dependencies.syncAnalyticsOption({
      optionId: created.nId_Opcion,
      optionCode: command.form.codigo,
      optionName: command.form.nombre,
      isActive: command.form.estado,
      groupIds: command.groupIds ?? [],
    });
  } catch (error) {
    throw new ModuloAnalyticsSyncError(
      'El módulo fue creado correctamente en SISGES, pero no se pudo completar su configuración de grupos en Analytics.' +
        resolveErrorDetail(error) +
        ' No vuelva a registrarlo; complete la configuración de grupos Analytics para la opción creada.'
    );
  }
};

export const actualizarModulo = async (
  command: ActualizarModuloCommand,
  dependencies: ModuloMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> => {
  await dependencies.updateOpcion(
    command.moduloDetalle,
    command.form,
    command.modulos,
    command.authenticatedUserId
  );

  if (!command.form.esPowerBI) {
    return;
  }

  try {
    await dependencies.syncAnalyticsPowerBiConfiguration({
      optionId: command.moduloDetalle.nId_Opcion,
      optionCode: command.form.codigo,
      optionName: command.form.nombre,
      isActive: command.form.estado,
      groupIds: command.groupIds ?? [],
      publications: command.reportClientPublications ?? [],
    });
  } catch (error) {
    throw new ModuloAnalyticsSyncError(
      'El módulo fue actualizado correctamente en SISGES, pero no se pudo completar su configuración Power BI en Analytics.' +
        resolveErrorDetail(error) +
        ' Vuelva a editar el módulo y reintente el guardado.'
    );
  }
};
