import {
  isSupportedSisgesIconValue,
} from '@shared/icons/sisges';

import {
  isValidEmailValue,
} from '@shared/utils/validators';

import type {
  Modulo,
} from '../../../types/opcion.types';

import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';

import type {
  ModuloFormData,
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';

import {
  buildOrderOptions,
  getDescendantIds,
} from '../utils/editarModulo.utils';

import {
  hasModuloChildren,
  isValidOptionImageSource,
  isValidPowerBiUrl,
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from '../utils/powerBiModulo.utils';

import {
  normalizeModuloAvailability,
  validateModuloAvailabilityTransition,
} from '../utils/moduloAvailability.utils';

interface ModuloFormValidationOptions {
  modulosExistentes?:
    readonly Modulo[];

  moduloIdActual?:
    number;

  isImplemented?:
    boolean;
}

const normalizeComparableValue = (
  value: string
): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE');

export const normalizeModuloForm = <
  TForm extends ModuloFormData,
>(
  form: TForm
): TForm =>
  normalizeModuloAvailability({
    ...form,

    nombre:
      form.nombre.trim(),

    descripcion:
      form.descripcion.trim(),

    codigo:
      form.codigo.trim(),

    icono:
      form.esPowerBI
        ? POWER_BI_DEFAULT_ICON
        : form.icono.trim(),

    esPowerBI:
      Boolean(form.esPowerBI),

    urlBI:
      form.esPowerBI
        ? form.urlBI.trim()
        : '',

    imagenOpcion:
      form.esPowerBI
        ? form.imagenOpcion.trim()
        : '',

    emailOpcion:
      form.esPowerBI
        ? (form.emailOpcion ?? '').trim()
        : '',
  });

export const normalizeRegistrarModuloForm = (
  form: RegistrarModuloFormData
): RegistrarModuloFormData =>
  normalizeModuloForm(form);

const validateCommonModuloFields = (
  form: ModuloFormData,
  {
    modulosExistentes = [],
    moduloIdActual,
    isImplemented = false,
  }: ModuloFormValidationOptions = {}
): Record<string, string> => {
  const errors:
    Record<string, string> = {};

  const normalizedForm =
    normalizeModuloForm(form);

  const normalizedName =
    normalizeComparableValue(
      normalizedForm.nombre
    );

  const normalizedCode =
    normalizeComparableValue(
      normalizedForm.codigo
    );

  const otherModules =
    modulosExistentes.filter(
      (modulo) =>
        modulo.idModulo !==
        moduloIdActual
    );

  if (!normalizedForm.nombre) {
    errors.nombre =
      'El nombre del módulo es obligatorio.';
  } else if (
    otherModules.some(
      (modulo) =>
        normalizeComparableValue(
          modulo.nombre
        ) === normalizedName
    )
  ) {
    errors.nombre =
      'Ya existe un módulo con el mismo nombre.';
  }

  if (
    normalizedForm.icono &&
    !isSupportedSisgesIconValue(
      normalizedForm.icono
    )
  ) {
    errors.icono =
      'Seleccione un icono válido del catálogo SISGES.';
  }

  if (!normalizedForm.codigo) {
    errors.codigo =
      'El código del módulo es obligatorio.';
  } else if (
    /[\\/]/.test(
      normalizedForm.codigo
    )
  ) {
    errors.codigo =
      'El código no debe contener barras.';
  } else if (
    !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(
      normalizedForm.codigo
    )
  ) {
    errors.codigo =
      'El código debe iniciar con una letra y solo puede contener letras, números, guiones o guiones bajos.';
  } else if (
    otherModules.some(
      (modulo) =>
        normalizeComparableValue(
          modulo.codigo
        ) === normalizedCode
    )
  ) {
    errors.codigo =
      'Ya existe un módulo con el mismo código.';
  }

  const currentModule =
    moduloIdActual === undefined
      ? undefined
      : modulosExistentes.find(
          (modulo) =>
            modulo.idModulo ===
            moduloIdActual
        );

  const isRootModule =
    currentModule?.idPadre === 0;

  if (isRootModule) {
    if (normalizedForm.padreId !== 0) {
      errors.padreId =
        'La opción raíz no puede asignarse a otro padre.';
    }
  } else if (
    !Number.isInteger(
      normalizedForm.padreId
    ) ||
    normalizedForm.padreId <= 0 ||
    !modulosExistentes.some(
      (modulo) =>
        modulo.idModulo ===
        normalizedForm.padreId
    )
  ) {
    errors.padreId =
      'El padre seleccionado no es válido.';
  } else if (
    moduloIdActual !== undefined
  ) {
    const invalidParentIds =
      getDescendantIds(
        moduloIdActual,
        modulosExistentes
      );

    invalidParentIds.add(
      moduloIdActual
    );

    if (
      invalidParentIds.has(
        normalizedForm.padreId
      )
    ) {
      errors.padreId =
        'El módulo no puede depender de sí mismo ni de uno de sus descendientes.';
    }
  }

  if (normalizedForm.esPowerBI) {
    if (
      normalizedForm.padreId !==
      POWER_BI_PARENT_OPTION_ID
    ) {
      errors.padreId =
        'Los módulos Power BI deben pertenecer a Reportería.';
    }

    if (!normalizedForm.urlBI) {
      errors.urlBI =
        'La URL de Power BI es obligatoria.';
    } else if (
      !isValidPowerBiUrl(
        normalizedForm.urlBI
      )
    ) {
      errors.urlBI =
        'Ingrese una URL válida que utilice http o https.';
    }

    if (!normalizedForm.emailOpcion) {
      errors.emailOpcion =
        'El correo de contacto es obligatorio para un módulo Power BI.';
    } else if (
      !isValidEmailValue(
        normalizedForm.emailOpcion
      )
    ) {
      errors.emailOpcion =
        'Ingrese un correo electrónico válido.';
    }

    if (
      normalizedForm.imagenOpcion &&
      !isValidOptionImageSource(
        normalizedForm.imagenOpcion
      )
    ) {
      errors.imagenOpcion =
        'Ingrese una URL http/https o una ruta relativa que inicie con /.';
    }

    if (isRootModule) {
      errors.esPowerBI =
        'La opción raíz no puede configurarse como Power BI.';
    }

    if (isImplemented) {
      errors.esPowerBI =
        'Un módulo ya implementado en SISGES no puede convertirse en Power BI.';
    }

    if (
      moduloIdActual !== undefined &&
      hasModuloChildren(
        moduloIdActual,
        modulosExistentes
      )
    ) {
      errors.esPowerBI =
        'Un módulo con opciones hijas no puede convertirse en Power BI.';
    }
  }

  if (
    typeof normalizedForm.visible !==
    'boolean'
  ) {
    errors.visible =
      'La visibilidad seleccionada no es válida.';
  }

  if (
    typeof normalizedForm.estado !==
    'boolean'
  ) {
    errors.estado =
      'El estado seleccionado no es válido.';
  }

  if (
    moduloIdActual !== undefined &&
    typeof normalizedForm.visible ===
      'boolean' &&
    typeof normalizedForm.estado ===
      'boolean'
  ) {
    Object.assign(
      errors,
      validateModuloAvailabilityTransition(
        normalizedForm,
        moduloIdActual,
        modulosExistentes
      )
    );
  }

  return errors;
};

export const validateRegistrarModuloForm = (
  form: RegistrarModuloFormData,
  options: ModuloFormValidationOptions = {}
): Record<string, string> =>
  validateCommonModuloFields(
    form,
    options
  );

export const validateEditarModuloForm = (
  form: EditarModuloFormData,
  {
    modulosExistentes = [],
    moduloIdActual,
    isImplemented = false,
  }: ModuloFormValidationOptions = {}
): Record<string, string> => {
  const errors =
    validateCommonModuloFields(
      form,
      {
        modulosExistentes,
        moduloIdActual,
        isImplemented,
      }
    );

  if (moduloIdActual === undefined) {
    errors.orden =
      'No se pudo identificar el módulo a ordenar.';

    return errors;
  }

  const currentModule =
    modulosExistentes.find(
      (modulo) =>
        modulo.idModulo ===
        moduloIdActual
    );

  /*
   * Root no participa del orden de hermanos. Su posición siempre se
   * normaliza a 0 al construir el request, por lo que no corresponde
   * exigir ni validar una posición editable para esta opción.
   */
  if (currentModule?.idPadre === 0) {
    return errors;
  }

  const validOrders =
    buildOrderOptions(
      form.padreId,
      moduloIdActual,
      modulosExistentes
    ).map(
      (option) => option.id
    );

  if (
    !Number.isInteger(form.orden) ||
    !validOrders.includes(form.orden)
  ) {
    errors.orden =
      'La posición seleccionada no es válida para el padre indicado.';
  }

  return errors;
};
