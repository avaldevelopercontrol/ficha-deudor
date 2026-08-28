import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isOptionalNullableBoolean,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CreateDireccionResponse,
  DireccionByIdApi,
  DireccionReferenciadaApi,
  DireccionUbicacionApi,
  DistritoApi,
  ProvinciaApi,
  UpdateDireccionResponse,
} from '../types/direccion.types';

export const isDireccionReferenciadaApi =
  createObjectGuard<DireccionReferenciadaApi>({
    nId_PersDirecc: isInteger,
    direccion: isString,
    referenciaUbicacion: isString,
    tipoDeudor: isString,
    nombre: isString,
    estado: isString,
  });

const isDireccionMutationResponse =
  createObjectGuard<CreateDireccionResponse>({
    nId_PersDirecc: isInteger,
    nId_PersDeudor: isInteger,
    nId_Ubigeo: isInteger,
  });

export const isCreateDireccionResponse =
  isDireccionMutationResponse;

export const isUpdateDireccionResponse = (
  value: unknown
): value is UpdateDireccionResponse => {
  return isDireccionMutationResponse(value);
};

export const isDireccionByIdApi =
  createObjectGuard<DireccionByIdApi>({
    nId_PersDirecc: isInteger,
    cDirecc_Nomb: isString,
    nombreAval: isString,
    nId_PersRefUbi: isInteger,
    cDirecc_Coment: isString,
    bEstado: isOptionalNullableBoolean,
    bOrigen_Base: isBoolean,
    cTipoCoDeudor: isString,
    nId_Departamento: isInteger,
    nId_Provincia: isInteger,
    nId_Distrito: isInteger,
  });

export const isProvinciaApi = createObjectGuard<ProvinciaApi>({
  nId_Provincia: isInteger,
  cNombre_Provincia: isString,
});

export const isDistritoApi = createObjectGuard<DistritoApi>({
  nId_Distrito: isInteger,
  cNombre_Distrito: isString,
});

export const isDireccionUbicacionApi =
  createObjectGuard<DireccionUbicacionApi>({
    nId_PersRefUbi: isInteger,
    cNombre_PersRefUbi: isString,
  });
