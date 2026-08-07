import {
  getApplicationOptionDefinition,
} from '@features/access-control/registry';

import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  RegistrarModuloFormData,
} from '../modules/mantener-modulos/types/registrarModulo.types';

import {
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

  const applicationOption =
    getApplicationOptionDefinition(
      form.applicationOptionCode
    );

  if (
    !applicationOption ||
    !applicationOption.enabled ||
    !applicationOption.registrable
  ) {
    throw new Error(
      'El módulo desarrollado seleccionado no se encuentra disponible.'
    );
  }

  const codigo =
    form.codigo.trim();

  if (
    codigo.toLocaleLowerCase('es-PE') !==
    applicationOption.code
      .trim()
      .toLocaleLowerCase('es-PE')
  ) {
    throw new Error(
      'El código del módulo no corresponde a la pantalla seleccionada.'
    );
  }

  return {
    sCodigoOpcion:
      codigo,

    sNombreOpcion:
      form.nombre.trim(),

    sDescripcionOpcion:
      form.descripcion.trim(),

    sUrlOpcion:
      applicationOption.path,

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
