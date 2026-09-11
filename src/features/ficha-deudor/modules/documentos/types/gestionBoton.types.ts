export interface GestionBotonApi {
  nId_Boton: number;
  nId_Cliente: number;
  nId_Contrato: number;
  nombreBoton: string;
  descripcionBoton: string;
  bEstado: boolean;
}

export interface GestionBoton {
  id: number;
  nombre: string;
  label: string;
}
