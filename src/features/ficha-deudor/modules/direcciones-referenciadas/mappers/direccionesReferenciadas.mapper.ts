import { toStringValue } from '@shared/utils/formValueMappers';
import { getCurrentPeruDateTime } from '../../../shared/utils/date.utils';
import {
  toOptionalIdOrZero,
  toRequiredId,
} from '../../../shared/utils/number.utils';
import type {
  CreateDireccionRequest,
  DireccionByIdApi,
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
  DireccionReferenciadaApi,
  DireccionUbicacion,
  DireccionUbicacionApi,
  Distrito,
  DistritoApi,
  Provincia,
  ProvinciaApi,
  UpdateDireccionRequest,
} from '../types/direccion.types';

export const mapDireccionReferenciada = (
  item: DireccionReferenciadaApi
): DireccionReferenciada => {
  return {
    id: toStringValue(item.nId_PersDirecc),
    direccion: toStringValue(item.direccion),
    refUbicacion: toStringValue(item.referenciaUbicacion),
    tipoDeudor: toStringValue(item.tipoDeudor),
    nombre: toStringValue(item.nombre),
    estado: toStringValue(item.estado),

    departamento: '',
    provincia: '',
    distrito: '',
    comentario: '',
    llegoDeBase: false,
    nombreAval: '',
  };
};

export const mapDireccionesReferenciadas = (
  data: DireccionReferenciadaApi[]
): DireccionReferenciada[] => {
  return data.map(mapDireccionReferenciada);
};

export const buildCreateDireccionRequest = (
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  data: DireccionFormData,
  currentDate = new Date()
): CreateDireccionRequest => {
  return {
    nId_PersDeudor: toRequiredId(id_deudor, 'nId_PersDeudor'),
    cDirecc_Nomb: toStringValue(data.direccion),
    nId_PersRefUbi: toOptionalIdOrZero(
      data.refUbicacion,
      'nId_PersRefUbi'
    ),
    cDirecc_Coment: toStringValue(data.comentario),
    bEstado: true,
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: toStringValue(data.tipoDeudor),
    dFec_Actualizacion:
      getCurrentPeruDateTime(
        currentDate
      ),
    nId_Cliente: toRequiredId(id_cliente, 'nId_Cliente'),
    nid_CalifDirecc: null,
    nid_usuarioUpd: toRequiredId(id_usuario, 'nid_usuarioUpd'),
    nId_Departamento: toRequiredId(
      data.departamento,
      'nId_Departamento'
    ),
    nId_Provincia: toRequiredId(data.provincia, 'nId_Provincia'),
    nId_Distrito: toRequiredId(data.distrito, 'nId_Distrito'),
  };
};

export const buildUpdateDireccionRequest = (
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_direccion: string,
  data: DireccionEditFormData,
  currentDate = new Date()
): UpdateDireccionRequest => {
  return {
    nId_PersDirecc: toRequiredId(id_direccion, 'nId_PersDirecc'),
    nId_PersDeudor: toRequiredId(id_deudor, 'nId_PersDeudor'),
    cDirecc_Nomb: toStringValue(data.direccion),
    nId_PersRefUbi: toOptionalIdOrZero(
      data.refUbicacion,
      'nId_PersRefUbi'
    ),
    cDirecc_Coment: toStringValue(data.comentario),
    bEstado: data.estado,
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: toStringValue(data.tipoDeudor),
    dFec_Actualizacion:
      getCurrentPeruDateTime(
        currentDate
      ),
    nId_Cliente: toRequiredId(id_cliente, 'nId_Cliente'),
    nid_CalifDirecc: null,
    nid_usuarioUpd: toRequiredId(id_usuario, 'nid_usuarioUpd'),
    nId_Departamento: toRequiredId(
      data.departamento,
      'nId_Departamento'
    ),
    nId_Provincia: toRequiredId(data.provincia, 'nId_Provincia'),
    nId_Distrito: toRequiredId(data.distrito, 'nId_Distrito'),
  };
};

export {
  mapDepartamentos,
} from '@shared/catalogos/departamentos/mappers/departamento.mapper';

export const mapProvincias = (data: ProvinciaApi[]): Provincia[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_Provincia),
    nombre: toStringValue(item.cNombre_Provincia),
  }));
};

export const mapDistritos = (data: DistritoApi[]): Distrito[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_Distrito),
    nombre: toStringValue(item.cNombre_Distrito),
  }));
};

export const mapDireccionUbicaciones = (
  data: DireccionUbicacionApi[]
): DireccionUbicacion[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_PersRefUbi),
    nombre: toStringValue(item.cNombre_PersRefUbi),
  }));
};

export type { DireccionByIdApi };