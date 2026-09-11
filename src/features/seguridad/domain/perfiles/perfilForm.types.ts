export type PerfilEstado = 0 | 1;

export interface PerfilFormData {
  nombrePerfil: string;
  abreviatura: string;
  estado: PerfilEstado;
}
