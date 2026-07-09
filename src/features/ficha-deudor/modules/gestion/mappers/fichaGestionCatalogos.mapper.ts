import type {
  GestionEstadoApi,
  GestionEstadoList,
  GestionTipoApi,
  GestionTipoList,
  GestionPaletaRespuestaApi,
  GestionPaletaRespuestaList,
  GestionEstadoClaroApi,
  GestionEstadoClaroList,
  GestionMotivoNoPagoApi,
  GestionMotivoNoPagoList,
} from '../../../shared/types';

export const mapGestionEstados = (
  data: GestionEstadoApi[] | null | undefined
): GestionEstadoList[] => {
  return (data ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
};

export const mapGestionTipos = (
  data: GestionTipoApi[] | null | undefined
): GestionTipoList[] => {
  return (data ?? []).map((item) => ({
    id: String(item.nId_TipoGestion),
    nombre: item.cNomTipoGestion,
  }));
};

export const mapGestionPaletaRespuesta = (
  data: GestionPaletaRespuestaApi[] | null | undefined
): GestionPaletaRespuestaList[] => {
  return (data ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
    idTipoContacto: item.nId_TipoContacto ?? null,
  }));
};

export const mapGestionEstadoClaro = (
  data: GestionEstadoClaroApi[] | null | undefined
): GestionEstadoClaroList[] => {
  return (data ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
};

export const mapGestionMotivoNoPago = (
  data: GestionMotivoNoPagoApi[] | null | undefined
): GestionMotivoNoPagoList[] => {
  return (data ?? []).map((item) => ({
    id: String(item.nId_MotivoNoPago),
    nombre: item.cNombreMotivoNoPago,
  }));
};