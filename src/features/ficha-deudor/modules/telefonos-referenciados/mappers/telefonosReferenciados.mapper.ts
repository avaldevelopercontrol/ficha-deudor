import { parseApiDate } from '@shared/utils/dateUtils';
import { toNumberValue, toStringValue } from '@shared/utils/formValueMappers';
import type {
  CreateTelefonoRequest,
  TelefonoFormData,
  TelefonoFuenteBusquedaApi,
  TelefonoHorarioGestionApi,
  TelefonoList,
  TelefonoOperadorApi,
  TelefonoReferenciado,
  TelefonoReferenciadoApi,
  TelefonoResultadoApi,
  TelefonoUbicacionApi,
} from '../types/telefono.types';

export const mapTelefonoReferenciado = (
  item: TelefonoReferenciadoApi
): TelefonoReferenciado => {
  return {
    id: item.nId_PersTelef,
    prioridad: item.prioridad,
    numero: item.nroTelefono,
    horario: item.horario,
    refUbicacion: item.referenciaUbicacion,
    estado: item.estado,
    fechaEstado: item.fechaEstado,
    fechaBase: item.fechaBase,
    contactados: item.contactados,
    noContactados: item.noContactados,
    ivr: toStringValue(item.cantidadIvr),
    fuente: item.fuente,
    ordenSearch: toNumberValue(item.ordenSearch),

    anexo: '',
    operadorTelefonico: '',
    referencia: 0,
    reclamoIndecopi: false,
  };
};

export const mapTelefonosReferenciados = (
  data: TelefonoReferenciadoApi[]
): TelefonoReferenciado[] => {
  return data.map(mapTelefonoReferenciado);
};

export const buildCreateTelefonoRequest = (
  id_deudor: string,
  id_usuario: string,
  data: TelefonoFormData
): CreateTelefonoRequest => {
  const nowIso = new Date().toISOString();

  return {
    nId_PersDeudor: toNumberValue(id_deudor),
    nTelef_Pre: '',
    nTelef_Nro: toStringValue(data.numero),
    nTelef_Anexo: toStringValue(data.anexo),
    nId_PersRefUbi: toNumberValue(data.ubicacion),
    nTelef_Prioridad: toNumberValue(data.prioridad),
    cTelef_Coment: toStringValue(data.comentario),
    nId_PersDeudorGestionHrs: toNumberValue(data.horarioGestion),
    nId_PersTelefOpe: toNumberValue(data.resultado),
    nId_Fuente: toNumberValue(data.fuenteBusqueda),
    nreferencia: toNumberValue(data.referencia),
    nid_usuarioupd: toNumberValue(id_usuario),
    nId_OperadorTelefonico: toNumberValue(data.operadorTelefonico),
    bEstado: data.bEstado ?? true,
    dFecUlt_PerstelefOpe: nowIso,
    dFecCarga_PersTelef: nowIso,
    bReclamo: data.reclamoIndecopi ?? false,
  };
};

export const buildUpdateTelefonoRequest = (
  id_deudor: string,
  id_usuario: string,
  id_telefono: number,
  data: TelefonoFormData
): CreateTelefonoRequest => {
  const numero = toStringValue(data.numero);

  const [nTelef_Pre, nTelef_Nro] = numero.includes('-')
    ? numero.split('-', 2)
    : ['', numero];

  return {
    nId_PersTelef: id_telefono,
    nId_PersDeudor: toNumberValue(id_deudor),
    nTelef_Pre: toStringValue(nTelef_Pre),
    nTelef_Nro: toStringValue(nTelef_Nro),
    nTelef_Anexo: toStringValue(data.anexo),
    nId_PersRefUbi: toNumberValue(data.ubicacion),
    nTelef_Prioridad: toNumberValue(data.prioridad),
    cTelef_Coment: toStringValue(data.comentario),
    nId_PersDeudorGestionHrs: toNumberValue(data.horarioGestion),
    nId_PersTelefOpe: toNumberValue(data.resultado),
    nId_Fuente: toNumberValue(data.fuenteBusqueda),
    nreferencia: toNumberValue(data.referencia),
    nid_usuarioupd: toNumberValue(id_usuario),
    nId_OperadorTelefonico: toNumberValue(data.operadorTelefonico),
    bEstado: data.bEstado ?? true,
    dFecUlt_PerstelefOpe: new Date().toISOString(),
    dFecCarga_PersTelef: parseApiDate(data.dFecCarga_PersTelef),
    bReclamo: data.reclamoIndecopi ?? false,
  };
};

export const mapTelefonoResultados = (
  data: TelefonoResultadoApi[]
): TelefonoList[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_PersTelefOpe),
    nombre: item.cNombre_PersTelefOpe,
  }));
};

export const mapTelefonoOperadores = (
  data: TelefonoOperadorApi[]
): TelefonoList[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_OperadorTelefonico),
    nombre: item.cAbrevOperadorTelef,
  }));
};

export const mapTelefonoUbicaciones = (
  data: TelefonoUbicacionApi[]
): TelefonoList[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_PersRefUbi),
    nombre: item.cNombre_PersRefUbi,
  }));
};

export const mapTelefonoHorarioGestion = (
  data: TelefonoHorarioGestionApi[]
): TelefonoList[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_PersDeudorGestionHrs),
    nombre: item.cNombren_PersDeudorGestionHrs,
  }));
};

export const mapTelefonoFuenteBusqueda = (
  data: TelefonoFuenteBusquedaApi[]
): TelefonoList[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_Fuente),
    nombre: item.cDescripcion,
  }));
};