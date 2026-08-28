import {
  createObjectGuard,
  isInteger,
  isOptionalNullableInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CreateAgendaResponse,
  CreateGestionOpeGesContratosResponse,
  GestionEstadoApi,
  GestionEstadoClaroApi,
  GestionMotivoNoPagoApi,
  GestionPaletaRespuestaApi,
  GestionTipoApi,
} from '../types/fichaGestionApi.types';

export const isGestionEstadoApi = createObjectGuard<GestionEstadoApi>({
  nId_OpeCodCliOut: isInteger,
  cNombre_OpeCodCliOut: isString,
});

export const isGestionTipoApi = createObjectGuard<GestionTipoApi>({
  nId_TipoGestion: isInteger,
  cNomTipoGestion: isString,
});

export const isGestionPaletaRespuestaApi =
  createObjectGuard<GestionPaletaRespuestaApi>({
    nId_OpeCodCliOut: isInteger,
    cNombre_OpeCodCliOut: isString,
    nId_TipoContacto: isOptionalNullableInteger,
  });

export const isGestionEstadoClaroApi =
  createObjectGuard<GestionEstadoClaroApi>({
    nId_OpeCodCliOut: isInteger,
    cNombre_OpeCodCliOut: isString,
  });

export const isGestionMotivoNoPagoApi =
  createObjectGuard<GestionMotivoNoPagoApi>({
    nId_MotivoNoPago: isInteger,
    cNombreMotivoNoPago: isString,
  });

export const isCreateGestionOpeGesContratosResponse =
  createObjectGuard<CreateGestionOpeGesContratosResponse>({
    nro: isInteger,
    nId_DocxCobrarOpeGes: isInteger,
    nId_DocxCobrarOpe: isInteger,
    nId_Cliente: isInteger,
    nId_Contrato: isInteger,
    nId_Cartera: isInteger,
    nId_DocxCobrar: isInteger,
    nId_PersDeudor: isInteger,
    nId_Usuario: isInteger,
  });

export const isCreateAgendaResponse =
  createObjectGuard<CreateAgendaResponse>({
    nid_Cliente: isInteger,
    nid_Cartera: isInteger,
    nid_UsuOpe: isInteger,
    nid_agenda: isInteger,
    nid_PersDeudor: isInteger,
  });
