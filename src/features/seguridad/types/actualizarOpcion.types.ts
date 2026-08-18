import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

import type {
  CreateOpcionResponseApi,
} from './crearOpcion.types';

export interface UpdateOpcionRequestApi {
  nId_Opcion: number;
  sCodigoOpcion: string;
  sNombreOpcion: string;
  sDescripcionOpcion: string;
  sUrlOpcion: string;
  sUrlBI: string;
  sIcono: string;
  nTipo: number;
  nId_OpcionPadre: number;
  nOrden: number;
  bVisible: boolean;
  bEstado: boolean;
  nModifica: number;
  dFechaModifica: string;
}

export type UpdateOpcionResponseApi =
  CreateOpcionResponseApi;

export type UpdateOpcionApiResponse =
  ApiResponseSimple<
    UpdateOpcionResponseApi
  >;
