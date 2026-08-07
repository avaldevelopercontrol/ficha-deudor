import type {
  ApiResponse,
} from '@shared/types/indexApi';

export interface ClienteActivoApi {
  nId_Cliente: number;
  cCli_Nombre: string | null;
}

export interface ClienteActivo {
  idCliente: number;
  nombreCliente: string;
}

export type GetClientesActivosResponse =
  ApiResponse<
    | ClienteActivoApi[]
    | ClienteActivoApi
    | null
  >;
