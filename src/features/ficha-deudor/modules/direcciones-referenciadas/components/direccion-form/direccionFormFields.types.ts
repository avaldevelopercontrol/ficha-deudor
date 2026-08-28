import type { DireccionFormData } from '../../types/direccion.types';
import type {
  FormGridColumns,
  SelectOption,
} from '../../../../shared/types/formField.types';

export type DireccionFormField =
  | 'direccion'
  | 'departamento'
  | 'provincia'
  | 'distrito'
  | 'refUbicacion'
  | 'comentario'
  | 'llegoDeBase'
  | 'tipoDeudor';

export type DireccionFormFieldValue = string | boolean;

export type DireccionFormValues = Pick<
  DireccionFormData,
  DireccionFormField
>;

export type DireccionFormErrors = Partial<
  Record<DireccionFormField, string>
>;

export type DireccionFormLabels = Record<
  DireccionFormField,
  string
> & {
  estado?: string;
};

export interface DireccionFormPlaceholders {
  direccion: string;
  comentario: string;
  select: string;
  loading: string;
  compactSelect?: string;
}

export interface DireccionFormLimits {
  direccionMaxLength?: number;
  comentarioMaxLength?: number;
  comentarioRows?: number;
}

export interface DireccionFormLayout {
  ubicacionColumns: FormGridColumns;
  footerColumns: FormGridColumns;
  comentarioRows?: number;
}

export interface DireccionFormFieldsProps {
  form: DireccionFormValues & {
    estado?: boolean;
  };
  errors: DireccionFormErrors;
  onChange: (
    field: DireccionFormField,
    value: DireccionFormFieldValue
  ) => void;
  onDepartamentoChange?: (value: string | number) => void;
  onProvinciaChange?: (value: string | number) => void;
  onEstadoChange?: (value: boolean) => void;
  labels: DireccionFormLabels;
  placeholders: DireccionFormPlaceholders;
  limits?: DireccionFormLimits;
  layout: DireccionFormLayout;
  departamentos: SelectOption[];
  provincias: SelectOption[];
  distritos: SelectOption[];
  refUbicacionOptions: SelectOption[];
  refUbicacionValue: string;
  isLoadingDepartamentos: boolean;
  isLoadingProvincias: boolean;
  isLoadingDistritos: boolean;
  isLoadingUbicaciones: boolean;
  errorDepartamentos?: string | null;
  errorUbicaciones?: string | null;
  showEstado?: boolean;
  estadosOptions?: SelectOption<boolean>[];
}
