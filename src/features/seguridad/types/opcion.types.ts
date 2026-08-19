import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export type ModuloEstado =
  | 'Activo'
  | 'Inactivo';

export type ModuloIndicador =
  | 'Sí'
  | 'No';

export type ModuloImplementacion =
  | 'IMPLEMENTADO'
  | 'POWER BI'
  | 'AGRUPADOR'
  | 'SIN IMPLEMENTAR';

/**
 * Estructura recibida desde
 * GET /v1/Opcion/GetOpciones.
 */
export interface OpcionApi {
  nId_Opcion: number;
  sCodigoOpcion: string | null;
  sNombreOpcion: string | null;
  sDescripcionOpcion: string | null;
  sUrlOpcion: string | null;
  sUrlBI: string | null;
  sIcono?: string | null;
  sImagenOpcion?: string | null;
  sEmailOpcion?: string | null;
  nTipo: number;
  nId_OpcionPadre: number;
  sCodigoOpcionPadre?: string | null;
  sNombreOpcionPadre?: string | null;
  nOrden: number;
  bVisible: boolean;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string | null;
  nModifica: number;
  dFechaModifica: string | null;
}

/**
 * Modelo de dominio utilizado por la tabla y
 * por el formulario de registro de módulos.
 */
export interface Modulo {
  idModulo: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  ruta: string;
  /** URL externa del tablero Power BI. Null cuando la opción no es BI. */
  urlBI: string | null;
  /** URL o ruta del logo mostrado en la tarjeta de reportería. */
  imagenOpcion: string | null;
  /** Correo de contacto del tablero. Null cuando la opción no es Power BI. */
  emailOpcion?: string | null;
  icono: string;
  tipo: number;
  idPadre: number;
  codigoPadre: string;
  padre: string;
  orden: number;
  visibleActivo: boolean;
  visible: ModuloIndicador;
  estadoActivo: boolean;
  estado: ModuloEstado;
  /** Estado derivado para la tabla de Mantener módulo. */
  implementacion?: ModuloImplementacion;
}

export type GetOpcionesResponse =
  ApiResponseSimple<
    | OpcionApi[]
    | OpcionApi
    | null
  >;

export type GetOpcionByIdResponse =
  ApiResponseSimple<
    OpcionApi | null
  >;
