import type {
  GrupoFormData,
} from '../domain/grupos/grupoForm.types';

import type {
  CreateGrupoRequestApi,
} from '../types/crearGrupo.types';

export const buildCreateGrupoRequest = (
  form: GrupoFormData
): CreateGrupoRequestApi => ({
  nId_Grupo: 0,
  cNombre_Grupo:
    form.nombre.trim(),
  cSigla_Grupo:
    form.sigla.trim(),
  bEstado: form.estado,
  nCant_Grupo: null,
  nid_cliente:
    Number(form.clienteId),
});
