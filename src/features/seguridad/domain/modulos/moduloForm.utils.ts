import type {
  Modulo,
} from '../../types/opcion.types';

import type {
  EditarModuloFormData,
  RegistrarModuloFormData,
} from './moduloForm.types';

import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from './powerBiModulo.utils';

const normalizeTextForCode = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

const capitalizeWord = (
  value: string
): string => {
  if (!value) {
    return '';
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

export const suggestModuloCode = (
  nombre: string
): string => {
  const normalizedName =
    normalizeTextForCode(nombre);

  if (!normalizedName) {
    return '';
  }

  const codeBody = normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalizeWord)
    .join('');

  return codeBody
    ? `m${codeBody}`
    : '';
};

export const resolveDefaultParentId = (
  opciones: readonly Modulo[]
): number => {
  const rootOption = opciones.find(
    (opcion) =>
      opcion.codigo.toLocaleLowerCase(
        'es-PE'
      ) === 'root' ||
      opcion.nombre.toLocaleLowerCase(
        'es-PE'
      ) === 'root'
  );

  const firstTopLevelOption =
    opciones.find(
      (opcion) =>
        opcion.idPadre === 0
    );

  return (
    rootOption ??
    firstTopLevelOption ??
    opciones[0]
  )?.idModulo ?? 0;
};

export const buildRegistrarModuloInitialForm = (
  opciones: readonly Modulo[]
): RegistrarModuloFormData => ({
  nombre: '',
  descripcion: '',
  codigo: '',
  icono: '',
  esPowerBI: false,
  urlBI: '',
  imagenOpcion: '',
  emailOpcion: '',
  padreId:
    resolveDefaultParentId(
      opciones
    ),
  visible: true,
  estado: true,
});

/**
 * Aplica las invariantes de un alta Power BI. La UI puede ocultar el selector
 * de tipo, pero el dominio sigue garantizando que el payload no pueda salir
 * como un módulo convencional por un cambio accidental de estado.
 */
export const asPowerBiRegistrarModuloForm = (
  form: RegistrarModuloFormData
): RegistrarModuloFormData => ({
  ...form,
  esPowerBI: true,
  icono: POWER_BI_DEFAULT_ICON,
  padreId: POWER_BI_PARENT_OPTION_ID,
});

/**
 * Mantiene las invariantes de un BI durante la edición. El formulario puede
 * reutilizar el editor genérico de módulos, pero un registro administrado
 * desde Mantener BI nunca debe dejar de ser Power BI ni cambiar de padre.
 */
export const asPowerBiEditarModuloForm = (
  form: EditarModuloFormData
): EditarModuloFormData => ({
  ...form,
  esPowerBI: true,
  icono: POWER_BI_DEFAULT_ICON,
  padreId: POWER_BI_PARENT_OPTION_ID,
});

export const buildRegistrarPowerBiInitialForm = (
  opciones: readonly Modulo[]
): RegistrarModuloFormData =>
  asPowerBiRegistrarModuloForm(
    buildRegistrarModuloInitialForm(
      opciones
    )
  );

export const normalizeParentRoute = (
  route: string
): string => {
  const trimmedRoute = route
    .trim()
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/');

  if (trimmedRoute === '/') {
    return '/';
  }

  return trimmedRoute.replace(
    /\/+$/g,
    ''
  );
};

export const buildModuloRoute = (
  parentRoute: string,
  codigo: string
): string => {
  const normalizedParentRoute =
    normalizeParentRoute(
      parentRoute
    );

  const normalizedCode = codigo
    .trim()
    .replace(/^\/+|\/+$/g, '');

  if (normalizedParentRoute === '/') {
    return `/${normalizedCode}/`;
  }

  return [
    normalizedParentRoute,
    normalizedCode,
  ]
    .filter(Boolean)
    .join('/') + '/';
};

export const calculateNextOrder = (
  parentId: number,
  opciones: readonly Modulo[]
): number => {
  const siblingOrders = opciones
    .filter(
      (opcion) =>
        opcion.idPadre ===
        parentId
    )
    .map(
      (opcion) =>
        opcion.orden
    )
    .filter(
      (orden) =>
        Number.isFinite(orden)
    );

  if (
    siblingOrders.length === 0
  ) {
    return 1;
  }

  return Math.max(
    ...siblingOrders
  ) + 1;
};
