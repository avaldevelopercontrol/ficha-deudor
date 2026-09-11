import type {
  GrupoEstado,
  GrupoFormData,
} from '../../../domain/grupos/grupoForm.types';

export type RegistrarGrupoEstado = GrupoEstado;
export type RegistrarGrupoFormData = GrupoFormData;

export type RegistrarGrupoFieldChange = <
  K extends keyof RegistrarGrupoFormData,
>(
  field: K,
  value: RegistrarGrupoFormData[K]
) => void;
