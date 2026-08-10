export type RegistrarPerfilEstado =
  | 0
  | 1;

export interface RegistrarPerfilFormData {
  nombrePerfil: string;
  abreviatura: string;
  estado: RegistrarPerfilEstado;
}

export type RegistrarPerfilFieldChange = <
  K extends keyof RegistrarPerfilFormData,
>(
  field: K,
  value: RegistrarPerfilFormData[K]
) => void;