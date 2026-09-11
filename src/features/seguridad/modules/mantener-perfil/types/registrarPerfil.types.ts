import type {
  PerfilFormData,
  PerfilEstado,
} from '../../../domain/perfiles/perfilForm.types';

export type RegistrarPerfilEstado = PerfilEstado;
export type RegistrarPerfilFormData = PerfilFormData;

export type RegistrarPerfilFieldChange = <
  K extends keyof RegistrarPerfilFormData,
>(
  field: K,
  value: RegistrarPerfilFormData[K]
) => void;
