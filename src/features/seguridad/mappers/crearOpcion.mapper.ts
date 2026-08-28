import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  RegistrarModuloFormData,
} from '../modules/mantener-modulos/types/registrarModulo.types';

import {
  buildModuloRoute,
  calculateNextOrder,
} from '../modules/mantener-modulos/utils/registrarModulo.utils';

import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from '../modules/mantener-modulos/utils/powerBiModulo.utils';

import type {
  CreateOpcionRequestApi,
} from '../types/crearOpcion.types';

import type {
  Modulo,
} from '../types/opcion.types';

const parseAuthenticatedUserId = (
  value: string
): number => {
  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue <= 0
  ) {
    throw new Error(
      'No se pudo identificar al usuario autenticado que registra la operación.'
    );
  }

  return parsedValue;
};

export const buildCreateOpcionRequest = (
  form: RegistrarModuloFormData,
  opciones: readonly Modulo[],
  authenticatedUserId: string,
  currentDate = new Date()
): CreateOpcionRequestApi => {
  const parentId =
    form.esPowerBI
      ? POWER_BI_PARENT_OPTION_ID
      : form.padreId;

  const parentOption = opciones.find(
    (opcion) =>
      opcion.idModulo ===
      parentId
  );

  if (!parentOption) {
    throw new Error(
      'El padre seleccionado no se encuentra disponible.'
    );
  }

  const codigo =
    form.codigo.trim();

  return {
    sCodigoOpcion:
      codigo,

    sNombreOpcion:
      form.nombre.trim(),

    sDescripcionOpcion:
      form.descripcion.trim(),

    // sUrlOpcion representa la jerarquía configurada en SISGES.
    // La ruta real de React permanece únicamente en el registry de pantallas.
    sUrlOpcion:
      buildModuloRoute(
        parentOption.ruta,
        codigo
      ),

    sUrlBI:
      form.esPowerBI
        ? form.urlBI.trim()
        : null,

    sIcono:
      form.esPowerBI
        ? POWER_BI_DEFAULT_ICON
        : form.icono.trim(),

    sImagenOpcion:
      form.esPowerBI
        ? (
            form.imagenOpcion.trim() ||
            null
          )
        : null,

    sEmailOpcion:
      form.esPowerBI
        ? (form.emailOpcion ?? '').trim()
        : null,

    nTipo:
      parentOption.tipo + 1,

    nId_OpcionPadre:
      parentOption.idModulo,

    nOrden:
      calculateNextOrder(
        parentOption.idModulo,
        opciones
      ),

    bVisible:
      form.estado &&
      form.visible,

    bEstado:
      form.estado,

    nCrea:
      parseAuthenticatedUserId(
        authenticatedUserId
      ),

    dFechaCrea:
      getCurrentPeruDateTime(
        currentDate
      ),
  };
};
