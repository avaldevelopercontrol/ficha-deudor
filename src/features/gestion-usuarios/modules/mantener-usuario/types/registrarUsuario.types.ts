import type {
  SelectOption,
} from '@shared/types';

import type {
  CampanaDiscadorOption,
} from '../../../types/usuarioCatalogos.types';

export type SexoUsuarioValue =
  | 1
  | 2
  | '';

export interface RegistrarUsuarioFormData {
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  contrasena: string;
  perfil: string;
  grupo: string;
  codigoRecaudador: boolean;
  estado: boolean;
  fechaNacimiento: string;
  sexo: SexoUsuarioValue;
  departamentoLabor: string;
  ciudadGestor: string;
  subZonalOficina: string;
  movilEmpresa: string;
  anexo: string;
  emailEmpresa: string;
  emailPersonal: string;
  campanaDiscador: string;
}

export interface RegistrarUsuarioCatalogos {
  perfiles:
    SelectOption<string>[];

  grupos:
    SelectOption<string>[];

  estados:
    SelectOption<boolean>[];

  sexos:
    SelectOption<
      SexoUsuarioValue
    >[];

  departamentosLabor:
    SelectOption<string>[];

  subZonalesOficina:
    SelectOption<string>[];

  campanasDiscador:
    CampanaDiscadorOption[];
}

export type RegistrarUsuarioCatalogField =
  | 'perfiles'
  | 'grupos'
  | 'departamentosLabor'
  | 'subZonalesOficina'
  | 'campanasDiscador';

export type RegistrarUsuarioCatalogLoading =
  Record<
    RegistrarUsuarioCatalogField,
    boolean
  >;

export type RegistrarUsuarioCatalogErrors =
  Partial<
    Record<
      RegistrarUsuarioCatalogField,
      string
    >
  >;

export type RegistrarUsuarioFieldChange = <
  K extends keyof RegistrarUsuarioFormData,
>(
  field: K,
  value: RegistrarUsuarioFormData[K]
) => void;