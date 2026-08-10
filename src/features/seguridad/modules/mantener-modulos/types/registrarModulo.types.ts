export interface ModuloFormData {
  nombre: string;
  descripcion: string;
  codigo: string;
  icono: string;
  padreId: number;
  visible: boolean;
  estado: boolean;
}

export interface RegistrarModuloFormData
  extends ModuloFormData {
  applicationOptionCode: string;
}

export type ModuloFormFieldChange = <
  K extends keyof ModuloFormData,
>(
  field: K,
  value: ModuloFormData[K]
) => void;

export type RegistrarModuloFieldChange = <
  K extends keyof RegistrarModuloFormData,
>(
  field: K,
  value: RegistrarModuloFormData[K]
) => void;
