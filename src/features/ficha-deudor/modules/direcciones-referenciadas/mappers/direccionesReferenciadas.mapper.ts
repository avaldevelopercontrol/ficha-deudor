import { toNumberValue, toStringValue } from '@shared/utils/formValueMappers';
import type {
  CreateDireccionRequest,
  Departamento,
  DepartamentoApi,
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
  data: DireccionFormData
): CreateDireccionRequest => {
  return {
    nId_PersDeudor: toNumberValue(id_deudor),
    cDirecc_Nomb: toStringValue(data.direccion),
    nId_PersRefUbi: toNumberValue(data.refUbicacion),
    cDirecc_Coment: toStringValue(data.comentario),
    bEstado: true,
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: toStringValue(data.tipoDeudor),
    dFec_Actualizacion: new Date().toISOString(),
    nId_Cliente: toNumberValue(id_cliente),
    nid_CalifDirecc: null,
    nid_usuarioUpd: toNumberValue(id_usuario),
    nId_Departamento: toNumberValue(data.departamento),
    nId_Provincia: toNumberValue(data.provincia),
    nId_Distrito: toNumberValue(data.distrito),
  };
};

export const buildUpdateDireccionRequest = (
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_direccion: string,
  data: DireccionEditFormData
): UpdateDireccionRequest => {
  return {
    nId_PersDirecc: toNumberValue(id_direccion),
    nId_PersDeudor: toNumberValue(id_deudor),
    cDirecc_Nomb: toStringValue(data.direccion),
    nId_PersRefUbi: toNumberValue(data.refUbicacion),
    cDirecc_Coment: toStringValue(data.comentario),
    bEstado: data.estado,
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: toStringValue(data.tipoDeudor),
    dFec_Actualizacion: new Date().toISOString(),
    nId_Cliente: toNumberValue(id_cliente),
    nid_CalifDirecc: null,
    nid_usuarioUpd: toNumberValue(id_usuario),
    nId_Departamento: toNumberValue(data.departamento),
    nId_Provincia: toNumberValue(data.provincia),
    nId_Distrito: toNumberValue(data.distrito),
  };
};

export const mapDepartamentos = (data: DepartamentoApi[]): Departamento[] => {
  return data.map((item) => ({
    id: toStringValue(item.nId_Departamento),
    nombre: toStringValue(item.cNombre_Departamento),
  }));
};

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