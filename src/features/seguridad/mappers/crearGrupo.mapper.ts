import type {
  RegistrarGrupoFormData,
} from '../modules/mantener-grupo/types/registrarGrupo.types';

import type {
  CreateGrupoRequestApi,
} from '../types/crearGrupo.types';

export const buildCreateGrupoRequest = (
  form: RegistrarGrupoFormData
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
