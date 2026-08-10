import {
  getCurrentPeruDateTime,
  toPeruApiDateTimeOrCurrent,
} from '../../../shared/utils/date.utils';
import { toNumberValue, toStringValue } from '@shared/utils/formValueMappers';
import { toRequiredId } from '../../../shared/utils/number.utils';
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
  data: TelefonoFormData,
  currentDate = new Date()
): CreateTelefonoRequest => {
  const currentPeruDateTime =
    getCurrentPeruDateTime(
      currentDate
    );

  return {
    nId_PersDeudor: toRequiredId(id_deudor, 'nId_PersDeudor'),
    nTelef_Pre: '',
    nTelef_Nro: toStringValue(data.numero),
    nTelef_Anexo: toStringValue(data.anexo),
    nId_PersRefUbi: toRequiredId(data.ubicacion, 'nId_PersRefUbi'),
    nTelef_Prioridad: toRequiredId(data.prioridad, 'nTelef_Prioridad'),
    cTelef_Coment: toStringValue(data.comentario),
    nId_PersDeudorGestionHrs: toRequiredId(
      data.horarioGestion,
      'nId_PersDeudorGestionHrs'
    ),
    nId_PersTelefOpe: toRequiredId(data.resultado, 'nId_PersTelefOpe'),
    nId_Fuente: toRequiredId(data.fuenteBusqueda, 'nId_Fuente'),
    nreferencia: toRequiredId(data.referencia, 'nreferencia'),
    nid_usuarioupd: toRequiredId(id_usuario, 'nid_usuarioupd'),
    nId_OperadorTelefonico: toRequiredId(
      data.operadorTelefonico,
      'nId_OperadorTelefonico'
    ),
    bEstado: true,
    dFecUlt_PerstelefOpe:
      currentPeruDateTime,
    dFecCarga_PersTelef:
      currentPeruDateTime,
    bReclamo: data.reclamoIndecopi ?? false,
  };
};

export const buildUpdateTelefonoRequest = (
  id_deudor: string,
  id_usuario: string,
  id_telefono: number,
  data: TelefonoFormData,
  currentDate = new Date()
): CreateTelefonoRequest => {
  const numero = toStringValue(data.numero);

  const [nTelef_Pre, nTelef_Nro] = numero.includes('-')
    ? numero.split('-', 2)
    : ['', numero];

  return {
    nId_PersTelef: toRequiredId(id_telefono, 'nId_PersTelef'),
    nId_PersDeudor: toRequiredId(id_deudor, 'nId_PersDeudor'),
    nTelef_Pre: toStringValue(nTelef_Pre),
    nTelef_Nro: toStringValue(nTelef_Nro),
    nTelef_Anexo: toStringValue(data.anexo),
    nId_PersRefUbi: toRequiredId(data.ubicacion, 'nId_PersRefUbi'),
    nTelef_Prioridad: toRequiredId(data.prioridad, 'nTelef_Prioridad'),
    cTelef_Coment: toStringValue(data.comentario),
    nId_PersDeudorGestionHrs: toRequiredId(
      data.horarioGestion,
      'nId_PersDeudorGestionHrs'
    ),
    nId_PersTelefOpe: toRequiredId(data.resultado, 'nId_PersTelefOpe'),
    nId_Fuente: toRequiredId(data.fuenteBusqueda, 'nId_Fuente'),
    nreferencia: toRequiredId(data.referencia, 'nreferencia'),
    nid_usuarioupd: toRequiredId(id_usuario, 'nid_usuarioupd'),
    nId_OperadorTelefonico: toRequiredId(
      data.operadorTelefonico,
      'nId_OperadorTelefonico'
    ),
    bEstado: data.bEstado ?? true,
    dFecUlt_PerstelefOpe:
      getCurrentPeruDateTime(
        currentDate
      ),
    dFecCarga_PersTelef:
      toPeruApiDateTimeOrCurrent(
        data.dFecCarga_PersTelef,
        currentDate
      ),
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