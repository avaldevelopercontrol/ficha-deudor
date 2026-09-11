export interface ModuloMutationState {
  idModulo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  urlBI: string | null;
  imagenOpcion: string | null;
  emailOpcion: string | null;
  icono: string;
  tipo: number;
  idPadre: number;
  orden: number;
  visible: boolean;
  estado: boolean;
}
