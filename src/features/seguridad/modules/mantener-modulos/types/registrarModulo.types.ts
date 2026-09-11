import type {
  ModuloFormData as DomainModuloFormData,
  RegistrarModuloFormData as DomainRegistrarModuloFormData,
} from '../../../domain/modulos/moduloForm.types';

export type ModuloFormData = DomainModuloFormData;
export type RegistrarModuloFormData = DomainRegistrarModuloFormData;

export type ModuloFormFieldChange = <
  K extends keyof ModuloFormData,
>(
  field: K,
  value: ModuloFormData[K]
) => void;

export type RegistrarModuloFieldChange = ModuloFormFieldChange;
