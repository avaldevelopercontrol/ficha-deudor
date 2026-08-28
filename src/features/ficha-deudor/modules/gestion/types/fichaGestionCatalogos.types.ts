import type { SelectOption } from '@shared/types';

import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';

export interface GestionEstadoList {
  id: string;
  nombre: string;
}

export interface GestionTipoList {
  id: string;
  nombre: string;
}

export interface GestionPaletaRespuestaList {
  id: string;
  nombre: string;
  idTipoContacto?: number | null;
}

export interface GestionPaletaRespuestaParams {
  idCliente: string;
  idContrato: string;
  nivelPaleta: number;
  idSupOpeCodCliOut: string | number;
  idTipoGestion?: string | number;
}

export interface GestionEstadoClaroList {
  id: string;
  nombre: string;
}

export interface GestionMotivoNoPagoList {
  id: string;
  nombre: string;
}

interface FichaGestionCatalogResource<TOption> {
  options: TOption[];
  isLoading: boolean;
  error: string | null;
}

export interface FichaGestionDatosPrincipalesCatalogos {
  estados: FichaGestionCatalogResource<SelectOption>;
  tipos: FichaGestionCatalogResource<SelectOption>;
  np0: FichaGestionCatalogResource<PaletaRespuestaOption>;
  np1: FichaGestionCatalogResource<PaletaRespuestaOption>;
  np2: FichaGestionCatalogResource<PaletaRespuestaOption>;
}

export interface FichaGestionCatalogos {
  estadosOptions: SelectOption[];
  isLoadingEstados: boolean;
  errorEstados: string | null;

  tiposOptions: SelectOption[];
  isLoadingTipos: boolean;
  errorTipos: string | null;

  np0Options: PaletaRespuestaOption[];
  isLoadingNP0: boolean;
  errorNP0: string | null;

  np1Options: PaletaRespuestaOption[];
  isLoadingNP1: boolean;
  errorNP1: string | null;

  np2Options: PaletaRespuestaOption[];
  isLoadingNP2: boolean;
  errorNP2: string | null;

  estadoGestionClaroOptions: SelectOption[];
  isLoadingEstadoGestionClaro: boolean;
  errorEstadoGestionClaro: string | null;

  motivoNoPagoOptions: SelectOption[];
  isLoadingMotivoNoPago: boolean;
  errorMotivoNoPago: string | null;
}
