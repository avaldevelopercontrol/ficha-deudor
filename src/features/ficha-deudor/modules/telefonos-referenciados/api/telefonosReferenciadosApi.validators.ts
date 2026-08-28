import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CreateTelefonoResponse,
  TelefonoEditarApi,
  TelefonoFuenteBusquedaApi,
  TelefonoHorarioGestionApi,
  TelefonoOperadorApi,
  TelefonoReferenciadoApi,
  TelefonoResultadoApi,
  TelefonoUbicacionApi,
} from '../types/telefono.types';

export const isTelefonoReferenciadoApi =
  createObjectGuard<TelefonoReferenciadoApi>({
    nId_PersTelef: isInteger,
    prioridad: isInteger,
    nroTelefono: isString,
    horario: isString,
    referenciaUbicacion: isString,
    estado: isString,
    fechaEstado: isString,
    fechaBase: isString,
    contactados: isString,
    noContactados: isInteger,
    cantidadIvr: isInteger,
    fuente: isString,
    ordenSearch: isString,
  });

export const isTelefonoEditarApi =
  createObjectGuard<TelefonoEditarApi>({
    nId_PersTelef: isInteger,
    nTelef_Nro: isString,
    nTelef_Anexo: isString,
    nId_PersRefUbi: isInteger,
    cTelef_Coment: isString,
    bEstado: isBoolean,
    nTelef_Prioridad: isInteger,
    nId_PersTelefOpe: isInteger,
    nId_PersDeudorGestionHrs: isInteger,
    dFecCarga_PersTelef: isString,
    nId_Fuente: isInteger,
    nreferencia: isInteger,
    nId_OperadorTelefonico: isInteger,
    bReclamo: isBoolean,
  });

export const isCreateTelefonoResponse =
  createObjectGuard<CreateTelefonoResponse>({
    nId_PersTelef: isInteger,
    nId_PersDeudor: isInteger,
    nTelef_Nro: isString,
  });

export const isTelefonoResultadoApi =
  createObjectGuard<TelefonoResultadoApi>({
    nId_PersTelefOpe: isInteger,
    cNombre_PersTelefOpe: isString,
  });

export const isTelefonoOperadorApi =
  createObjectGuard<TelefonoOperadorApi>({
    nId_OperadorTelefonico: isInteger,
    cAbrevOperadorTelef: isString,
  });

export const isTelefonoUbicacionApi =
  createObjectGuard<TelefonoUbicacionApi>({
    nId_PersRefUbi: isInteger,
    cNombre_PersRefUbi: isString,
  });

export const isTelefonoHorarioGestionApi =
  createObjectGuard<TelefonoHorarioGestionApi>({
    nId_PersDeudorGestionHrs: isInteger,
    cNombren_PersDeudorGestionHrs: isString,
  });

export const isTelefonoFuenteBusquedaApi =
  createObjectGuard<TelefonoFuenteBusquedaApi>({
    nId_Fuente: isInteger,
    cDescripcion: isString,
  });
