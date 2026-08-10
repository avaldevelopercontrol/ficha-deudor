export type RegistrarGrupoEstado =
  boolean;

export interface RegistrarGrupoFormData {
  nombre: string;
  sigla: string;
  clienteId: number | '';
  estado: RegistrarGrupoEstado;
}

export type RegistrarGrupoFieldChange = <
  K extends keyof RegistrarGrupoFormData,
>(
  field: K,
  value: RegistrarGrupoFormData[K]
) => void;
