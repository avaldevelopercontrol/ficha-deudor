export interface ModuloFormData {
  nombre: string;
  descripcion: string;
  codigo: string;
  icono: string;
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
