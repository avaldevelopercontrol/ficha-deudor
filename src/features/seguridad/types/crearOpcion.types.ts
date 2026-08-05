import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface CreateOpcionRequestApi {
  sCodigoOpcion: string;
  sNombreOpcion: string;
  sDescripcionOpcion: string;
  sUrlOpcion: string;
  sIcono: string;
  nTipo: number;
  nId_OpcionPadre: number;
  nOrden: number;
  bVisible: boolean;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string;
}

export interface CreateOpcionResponseApi {
  nId_Opcion: number;
  sCodigoOpcion: string;
  sNombreOpcion: string;
  nId_OpcionPadre: number;
}

export type CreateOpcionApiResponse =
  ApiResponseSimple<
    CreateOpcionResponseApi
  >;
