import type {
  RegistrarGrupoFormData,
} from '../modules/mantener-grupo/types/registrarGrupo.types';

import type {
  UpdateGrupoRequestApi,
} from '../types/actualizarGrupo.types';

import type {
  GrupoDetalleApi,
} from '../types/grupo.types';

/**
 * Convierte el detalle del grupo al modelo
 * utilizado por el formulario compartido.
 */
export const mapGrupoDetalleApiToForm = (
  grupo: GrupoDetalleApi
): RegistrarGrupoFormData => ({
  nombre:
    grupo.cNombre_Grupo?.trim() ?? '',

  sigla:
    grupo.cSigla_Grupo?.trim() ?? '',

  clienteId:
    Number.isInteger(
      grupo.nid_cliente
    ) &&
    grupo.nid_cliente > 0
      ? grupo.nid_cliente
      : '',

  estado:
    grupo.bEstado === true,
});

/**
 * Garantiza que el detalle cargado corresponde exactamente
 * al registro que el usuario seleccionó en la tabla.
 *
 * El ID que se envía al PUT siempre proviene de la fila
 * seleccionada, nunca de un valor por defecto o incompleto
 * devuelto por el endpoint de detalle.
 */
export const assertGrupoDetalleMatchesSelectedId = (
  selectedGrupoId: number,
  grupo: GrupoDetalleApi
): void => {
  if (
    !Number.isInteger(selectedGrupoId) ||
    selectedGrupoId <= 0
  ) {
    throw new Error(
      'El identificador del grupo seleccionado no es válido.'
    );
  }

  if (
    !Number.isInteger(grupo.nId_Grupo) ||
    grupo.nId_Grupo <= 0
  ) {
    throw new Error(
      'El servicio devolvió un identificador de grupo no válido.'
    );
  }

  if (
    grupo.nId_Grupo !== selectedGrupoId
  ) {
    throw new Error(
      'El grupo cargado no corresponde al registro seleccionado.'
    );
  }
};

/**
 * Construye exclusivamente el payload de PUT /v1/Grupo.
 *
 * - nId_Grupo: siempre es el ID de la fila seleccionada.
 * - cNombre_Grupo: conserva el nombre actual/original.
 * - cNombre_GrupoNuevo: contiene el nombre editado.
 * - nCant_Grupo: por requerimiento del backend se envía null.
 *   No forma parte del formulario de mantenimiento.
 */
export const buildUpdateGrupoRequest = (
  selectedGrupoId: number,
  grupo: GrupoDetalleApi,
  form: RegistrarGrupoFormData
): UpdateGrupoRequestApi => {
  assertGrupoDetalleMatchesSelectedId(
    selectedGrupoId,
    grupo
  );

  const nombreActual =
    grupo.cNombre_Grupo?.trim();

  if (!nombreActual) {
    throw new Error(
      'No se pudo identificar el nombre actual del grupo.'
    );
  }

  return {
    nId_Grupo:
      selectedGrupoId,

    cNombre_Grupo:
      nombreActual,

    cNombre_GrupoNuevo:
      form.nombre.trim(),

    cSigla_Grupo:
      form.sigla.trim(),

    bEstado:
      form.estado,

    nCant_Grupo:
      null,

    nid_cliente:
      Number(form.clienteId),
  };
};
