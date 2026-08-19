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

export type RegistrarModuloFormData =
  ModuloFormData;

export type ModuloFormFieldChange = <
  K extends keyof ModuloFormData,
>(
  field: K,
  value: ModuloFormData[K]
) => void;

export type RegistrarModuloFieldChange =
  ModuloFormFieldChange;
