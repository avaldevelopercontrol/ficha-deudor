export interface ModuloFormData {
  nombre: string;
  descripcion: string;
  codigo: string;
  icono: string;
  esPowerBI: boolean;
  urlBI: string;
  imagenOpcion: string;
  emailOpcion?: string;
  padreId: number;
  visible: boolean;
  estado: boolean;
}

export type RegistrarModuloFormData = ModuloFormData;

export interface EditarModuloFormData extends ModuloFormData {
  orden: number;
}
