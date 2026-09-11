import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  EditarModuloFormData,
} from '../domain/modulos/moduloForm.types';
import {
  buildModuloRoute,
} from '../domain/modulos/moduloForm.utils';
import {
  cascadeModuloHierarchyValues,
  renumberModuloParentChildren,
  resolveModuloRouteSegment,
} from '../domain/modulos/moduloHierarchy.utils';
import type {
  ModuloMutationState,
} from '../domain/modulos/moduloMutation.types';
import {
  hasModuloMutationChanged,
} from '../domain/modulos/moduloMutation.utils';
import {
  buildSafeModuloReorderSequence,
} from '../domain/modulos/moduloReorder.utils';
import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from '../domain/modulos/powerBiModulo.utils';
import {
  assertModuloAvailabilityTransition,
  normalizeModuloAvailability,
} from '../domain/modulos/moduloAvailability.utils';
import type {
  UpdateOpcionRequestApi,
} from '../types/actualizarOpcion.types';
import type {
  Modulo,
  OpcionApi,
} from '../types/opcion.types';

const parseAuthenticatedUserId = (
  value: string
): number => {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new Error(
      'No se pudo identificar al usuario autenticado que modifica la operación.'
    );
  }

  return parsedValue;
};

const mapModuloToMutationState = (
  modulo: Modulo
): ModuloMutationState => ({
  idModulo: modulo.idModulo,
  codigo: modulo.codigo,
  nombre: modulo.nombre,
  descripcion: modulo.descripcion,
  ruta: modulo.ruta,
  urlBI: modulo.urlBI?.trim() || null,
  imagenOpcion:
    modulo.imagenOpcion?.trim() || null,
  emailOpcion:
    modulo.emailOpcion?.trim() || null,
  icono: modulo.icono,
  tipo: modulo.tipo,
  idPadre: modulo.idPadre,
  orden: modulo.orden,
  visible: modulo.visibleActivo,
  estado: modulo.estadoActivo,
});

const mapOpcionApiToMutationState = (
  modulo: OpcionApi
): ModuloMutationState => ({
  idModulo: Number(modulo.nId_Opcion),
  codigo: modulo.sCodigoOpcion?.trim() ?? '',
  nombre: modulo.sNombreOpcion?.trim() ?? '',
  descripcion:
    modulo.sDescripcionOpcion?.trim() ?? '',
  ruta: modulo.sUrlOpcion?.trim() ?? '',
  urlBI: modulo.sUrlBI?.trim() || null,
  imagenOpcion:
    modulo.sImagenOpcion?.trim() || null,
  emailOpcion:
    modulo.sEmailOpcion?.trim() || null,
  icono: modulo.sIcono?.trim() ?? '',
  tipo: Number(modulo.nTipo) || 0,
  idPadre:
    Number(modulo.nId_OpcionPadre) || 0,
  orden: Number(modulo.nOrden) || 0,
  visible: Boolean(modulo.bVisible),
  estado: Boolean(modulo.bEstado),
});

const toUpdateRequest = (
  modulo: ModuloMutationState,
  authenticatedUserId: number,
  modifiedAt: string
): UpdateOpcionRequestApi => ({
  nId_Opcion: modulo.idModulo,
  sCodigoOpcion: modulo.codigo,
  sNombreOpcion: modulo.nombre,
  sDescripcionOpcion: modulo.descripcion,
  sUrlOpcion: modulo.ruta,
  sUrlBI: modulo.urlBI,
  sIcono: modulo.icono,
  sImagenOpcion: modulo.imagenOpcion,
  sEmailOpcion: modulo.emailOpcion,
  nTipo: modulo.tipo,
  nId_OpcionPadre: modulo.idPadre,
  nOrden: modulo.orden,
  bVisible: modulo.visible,
  bEstado: modulo.estado,
  nModifica: authenticatedUserId,
  dFechaModifica: modifiedAt,
});

const buildUpdatedCurrentModulo = (
  originalCurrent: ModuloMutationState,
  form: EditarModuloFormData,
  parentOption: ModuloMutationState | null,
  targetParentId: number
): ModuloMutationState => {
  const codigo = form.codigo.trim();
  const currentRouteSegment =
    originalCurrent.codigo !== codigo
      ? codigo
      : resolveModuloRouteSegment(
          originalCurrent.ruta,
          codigo
        );
  const hierarchyChanged =
    originalCurrent.idPadre !== targetParentId ||
    originalCurrent.codigo !== codigo;
  const updatedRoute =
    !hierarchyChanged && originalCurrent.ruta
      ? originalCurrent.ruta
      : parentOption
        ? buildModuloRoute(
            parentOption.ruta,
            currentRouteSegment
          )
        : buildModuloRoute('', currentRouteSegment);

  return {
    ...originalCurrent,
    codigo,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    ruta: updatedRoute,
    urlBI: form.esPowerBI
      ? form.urlBI.trim()
      : null,
    imagenOpcion: form.esPowerBI
      ? form.imagenOpcion.trim() || null
      : null,
    emailOpcion: form.esPowerBI
      ? (form.emailOpcion ?? '').trim()
      : null,
    icono: form.esPowerBI
      ? POWER_BI_DEFAULT_ICON
      : form.icono.trim(),
    tipo: parentOption
      ? parentOption.tipo + 1
      : originalCurrent.tipo,
    idPadre: targetParentId,
    orden:
      targetParentId === 0
        ? 0
        : form.orden,
    visible: form.visible,
    estado: form.estado,
  };
};

export const buildUpdateOpcionRequests = (
  moduloDetalle: OpcionApi,
  form: EditarModuloFormData,
  modulos: readonly Modulo[],
  authenticatedUserId: string,
  currentDate = new Date()
): UpdateOpcionRequestApi[] => {
  const currentModuloId =
    Number(moduloDetalle.nId_Opcion);
  const normalizedForm =
    normalizeModuloAvailability(form);

  assertModuloAvailabilityTransition(
    normalizedForm,
    currentModuloId,
    modulos
  );

  const originalCurrent =
    mapOpcionApiToMutationState(
      moduloDetalle
    );
  const originalById = new Map<
    number,
    ModuloMutationState
  >(
    modulos.map((modulo) => [
      modulo.idModulo,
      mapModuloToMutationState(modulo),
    ])
  );

  originalById.set(
    currentModuloId,
    originalCurrent
  );

  const modulesById = new Map(
    [...originalById.entries()].map(
      ([id, modulo]) => [
        id,
        { ...modulo },
      ]
    )
  );
  const originalParentId =
    originalCurrent.idPadre;
  const targetParentId =
    normalizedForm.esPowerBI
      ? POWER_BI_PARENT_OPTION_ID
      : normalizedForm.padreId;

  if (
    originalParentId === 0 &&
    targetParentId !== 0
  ) {
    throw new Error(
      'La opción raíz no puede asignarse a otro padre.'
    );
  }

  const parentOption =
    targetParentId === 0
      ? null
      : modulesById.get(targetParentId) ?? null;

  if (
    targetParentId !== 0 &&
    !parentOption
  ) {
    throw new Error(
      'El padre seleccionado no se encuentra disponible.'
    );
  }

  const updatedCurrent =
    buildUpdatedCurrentModulo(
      originalCurrent,
      normalizedForm,
      parentOption,
      targetParentId
    );

  modulesById.set(
    currentModuloId,
    updatedCurrent
  );

  if (
    originalParentId !== updatedCurrent.idPadre
  ) {
    renumberModuloParentChildren(
      modulesById,
      originalParentId,
      currentModuloId
    );
  }

  renumberModuloParentChildren(
    modulesById,
    updatedCurrent.idPadre,
    currentModuloId,
    updatedCurrent.orden
  );
  cascadeModuloHierarchyValues(
    modulesById,
    currentModuloId
  );

  const modifierId =
    parseAuthenticatedUserId(
      authenticatedUserId
    );
  const modifiedAt =
    getCurrentPeruDateTime(currentDate);
  const changedModules = [
    ...modulesById.values(),
  ].filter((updated) => {
    const original =
      originalById.get(updated.idModulo);

    return Boolean(
      original &&
      hasModuloMutationChanged(
        original,
        updated
      )
    );
  });

  changedModules.sort((left, right) => {
    if (left.tipo !== right.tipo) {
      return left.tipo - right.tipo;
    }

    return left.orden - right.orden;
  });

  return buildSafeModuloReorderSequence(
    originalById,
    changedModules,
    updatedCurrent
  ).map((modulo) =>
    toUpdateRequest(
      modulo,
      modifierId,
      modifiedAt
    )
  );
};
