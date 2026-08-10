import {
  getRegistrableApplicationOptions,
  type ApplicationOptionDefinition,
} from '@features/access-control/registry';

import type {
  SelectOption,
} from '@shared/types';

import type {
  Modulo,
} from '../../../types/opcion.types';

import type {
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';

const normalizeTextForCode = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

const normalizeComparableCode = (
  value: string
): string =>
  value
    .trim()
    .toLocaleLowerCase('es-PE');

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
  applicationOptionCode: '',
  nombre: '',
  descripcion: '',
  codigo: '',
  icono: '',
  padreId:
    resolveDefaultParentId(
      opciones
    ),
  visible: true,
  estado: true,
});

export const getAvailableApplicationOptions = (
  opciones: readonly Modulo[]
): readonly ApplicationOptionDefinition[] => {
  const registeredCodes = new Set(
    opciones
      .map((opcion) =>
        normalizeComparableCode(
          opcion.codigo
        )
      )
      .filter(Boolean)
  );

  return getRegistrableApplicationOptions().filter(
    (definition) =>
      !registeredCodes.has(
        normalizeComparableCode(
          definition.code
        )
      )
  );
};

export const buildApplicationOptionSelectOptions = (
  opciones: readonly ApplicationOptionDefinition[]
): SelectOption<string>[] =>
  opciones.map((option) => ({
    id: option.code,
    label:
      `${option.sectionName} — ${option.name}`,
  }));

export const resolveApplicationOptionParentId = (
  definition: ApplicationOptionDefinition,
  opciones: readonly Modulo[]
): number | null => {
  if (!definition.parentCode) {
    return null;
  }

  return (
    opciones.find(
      (opcion) =>
        normalizeComparableCode(
          opcion.codigo
        ) ===
        normalizeComparableCode(
          definition.parentCode ?? ''
        )
    )?.idModulo ?? null
  );
};

export const applyApplicationOptionToForm = (
  currentForm: RegistrarModuloFormData,
  definition: ApplicationOptionDefinition,
  opciones: readonly Modulo[]
): RegistrarModuloFormData => {
  const parentId =
    resolveApplicationOptionParentId(
      definition,
      opciones
    );

  return {
    ...currentForm,
    applicationOptionCode:
      definition.code,
    nombre: definition.name,
    descripcion:
      definition.description,
    codigo: definition.code,
    icono: definition.icon,
    padreId:
      parentId ??
      currentForm.padreId,
  };
};

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
