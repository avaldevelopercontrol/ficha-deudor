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
  const parentOption = opciones.find(
    (opcion) =>
      opcion.idModulo ===
      form.padreId
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

    sUrlBI: '',

    sIcono:
      form.icono.trim(),

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
