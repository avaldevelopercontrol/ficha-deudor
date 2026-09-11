export type GrupoEstado = boolean;

export interface GrupoFormData {
  nombre: string;
  sigla: string;
  clienteId: number | '';
  estado: GrupoEstado;
}
