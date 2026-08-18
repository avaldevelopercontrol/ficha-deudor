import type {
  SelectOption,
} from '@shared/types';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';

import {
  suggestModuloCode,
} from './registrarModulo.utils';

export const resolveModuloCodeAfterNameChange = (
  modulo: OpcionApi,
  nextName: string
): string => {
  const currentCode =
    modulo.sCodigoOpcion?.trim() ?? '';

  const isRootModule =
    (
      Number(
        modulo.nId_OpcionPadre
      ) || 0
    ) === 0;

  if (
    isRootModule
  ) {
    return currentCode;
  }

  return suggestModuloCode(
    nextName
  );
};

const sortModulesByOrder = (
  left: Modulo,
  right: Modulo
): number => {
  if (left.orden !== right.orden) {
    return left.orden - right.orden;
  }

  return left.idModulo - right.idModulo;
};

export const getDescendantIds = (
  moduloId: number,
  modulos: readonly Modulo[]
): Set<number> => {
  const descendantIds = new Set<number>();
  const pendingParentIds = [moduloId];

  while (pendingParentIds.length > 0) {
    const parentId = pendingParentIds.shift();

    if (parentId === undefined) {
      continue;
    }

    modulos.forEach((modulo) => {
      if (
        modulo.idPadre === parentId &&
        !descendantIds.has(modulo.idModulo)
      ) {
        descendantIds.add(modulo.idModulo);
        pendingParentIds.push(modulo.idModulo);
      }
    });
  }

  return descendantIds;
};

export const buildEditableParentOptions = (
  modulo: OpcionApi,
  modulos: readonly Modulo[]
): SelectOption<number>[] => {
  const currentId = modulo.nId_Opcion;
  const originalParentId =
    Number(modulo.nId_OpcionPadre) || 0;

  if (originalParentId === 0) {
    return [
      {
        id: 0,
        label: 'Sin padre (nivel raíz)',
      },
    ];
  }

  const excludedIds = getDescendantIds(
    currentId,
    modulos
  );

  excludedIds.add(currentId);

  return modulos
    .filter(
      (candidate) =>
        !excludedIds.has(candidate.idModulo)
    )
    .sort((left, right) => {
      if (left.tipo !== right.tipo) {
        return left.tipo - right.tipo;
      }

      return left.nombre.localeCompare(
        right.nombre,
        'es-PE'
      );
    })
    .map((candidate) => ({
      id: candidate.idModulo,
      label:
        candidate.nombre ||
        candidate.codigo ||
        `Id ${candidate.idModulo}`,
    }));
};

export const getSiblingModules = (
  parentId: number,
  currentModuloId: number,
  modulos: readonly Modulo[]
): Modulo[] =>
  modulos
    .filter(
      (modulo) =>
        modulo.idPadre === parentId &&
        modulo.idModulo !== currentModuloId
    )
    .sort(sortModulesByOrder);

export const calculateEditableOrder = (
  modulo: OpcionApi,
  modulos: readonly Modulo[]
): number => {
  const parentId =
    Number(modulo.nId_OpcionPadre) || 0;

  if (parentId === 0) {
    return 0;
  }

  const siblingsWithCurrent = modulos
    .filter(
      (candidate) =>
        candidate.idPadre === parentId
    )
    .sort(sortModulesByOrder);

  const currentIndex =
    siblingsWithCurrent.findIndex(
      (candidate) =>
        candidate.idModulo ===
        modulo.nId_Opcion
    );

  if (currentIndex >= 0) {
    return currentIndex + 1;
  }

  const rawOrder = Number(modulo.nOrden);

  if (
    Number.isInteger(rawOrder) &&
    rawOrder > 0
  ) {
    return Math.min(
      rawOrder,
      siblingsWithCurrent.length + 1
    );
  }

  return siblingsWithCurrent.length + 1;
};

export const mapOpcionApiToEditarModuloForm = (
  modulo: OpcionApi,
  modulos: readonly Modulo[]
): EditarModuloFormData => {
  const estado =
    Boolean(modulo.bEstado);

  return {
    nombre:
      modulo.sNombreOpcion?.trim() ?? '',

    descripcion:
      modulo.sDescripcionOpcion?.trim() ?? '',

    codigo:
      modulo.sCodigoOpcion?.trim() ?? '',

    icono:
      modulo.sIcono?.trim() ?? '',

    padreId:
      Number(modulo.nId_OpcionPadre) || 0,

    orden:
      calculateEditableOrder(
        modulo,
        modulos
      ),

    visible:
      estado &&
      Boolean(modulo.bVisible),

    estado,
  };
};

export const buildOrderOptions = (
  parentId: number,
  currentModuloId: number,
  modulos: readonly Modulo[]
): SelectOption<number>[] => {
  if (parentId === 0) {
    return [
      {
        id: 0,
        label: '0 - Opción raíz',
      },
    ];
  }

  const totalPositions =
    getSiblingModules(
      parentId,
      currentModuloId,
      modulos
    ).length + 1;

  return Array.from(
    {
      length: totalPositions,
    },
    (_, index) => {
      const position = index + 1;

      return {
        id: position,
        label:
          position === 1
            ? '1 - Primera posición'
            : `${position} - Posición ${position}`,
      };
    }
  );
};

export interface OrderPreviewItem {
  id: number;
  label: string;
  position: number;
  isCurrent: boolean;
}

export const buildOrderPreview = (
  form: EditarModuloFormData,
  currentModuloId: number,
  modulos: readonly Modulo[]
): OrderPreviewItem[] => {
  if (form.padreId === 0) {
    return [
      {
        id: currentModuloId,
        label:
          form.nombre ||
          form.codigo ||
          'Módulo actual',
        position: 0,
        isCurrent: true,
      },
    ];
  }

  const siblings = getSiblingModules(
    form.padreId,
    currentModuloId,
    modulos
  );

  const safePosition = Math.max(
    1,
    Math.min(
      form.orden,
      siblings.length + 1
    )
  );

  const preview = siblings.map(
    (sibling) => ({
      id: sibling.idModulo,
      label:
        sibling.nombre ||
        sibling.codigo ||
        `Id ${sibling.idModulo}`,
      isCurrent: false,
    })
  );

  preview.splice(
    safePosition - 1,
    0,
    {
      id: currentModuloId,
      label:
        form.nombre ||
        form.codigo ||
        'Módulo actual',
      isCurrent: true,
    }
  );

  return preview.map(
    (item, index) => ({
      ...item,
      position: index + 1,
    })
  );
};

export const resolveOrderAfterParentChange = (
  parentId: number,
  currentModuloId: number,
  modulos: readonly Modulo[]
): number => {
  if (parentId === 0) {
    return 0;
  }

  return (
    getSiblingModules(
      parentId,
      currentModuloId,
      modulos
    ).length + 1
  );
};
