import { apiClient } from '../../../shared/api/apiClient';
import type {
  ApiResponse,
  DireccionReferenciada,
  DireccionReferenciadaApi,
  DireccionFormData,
  DireccionEditFormData,
  Departamento,
  ApiResponseSimple,
  DepartamentoApi,
  Provincia,
  ProvinciaApi,
  Distrito,
  DistritoApi,
  DireccionUbicacion,
  DireccionUbicacionApi,
  CreateDireccionResponse,
  CreateDireccionRequest,
  DireccionByIdApi,
  UpdateDireccionResponse,
  UpdateDireccionRequest,
} from '../../../shared/types/indexApi';

const BASE_DIRECCION = '/v1/Direccion';

// ─── GET: Todos los registros (carga masiva para filtros client-side) ───
export async function fetchDireccionesReferenciadas(
  id_cliente: string,
  id_deudor: string,
): Promise<DireccionReferenciada[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<ApiResponse<DireccionReferenciadaApi[]>>(
    `${BASE_DIRECCION}/GetDirecciones?${params.toString()}`,
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando direcciones');
  }
  
  return result.response.map((item) => ({
    id: String(item.nId_PersDirecc),
    direccion: item.direccion,
    refUbicacion: item.referenciaUbicacion,
    tipoDeudor: item.tipoDeudor,
    nombre: item.nombre,
    estado: item.estado,
    // Campos que no vienen en el GET pero existen en el type del frontend
    departamento: '',
    provincia: '',
    distrito: '',
    comentario: '',
    llegoDeBase: false,
    nombreAval: '',
  }));
}

// ─── POST: Crear nueva dirección ───
export async function createDireccion(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,        // ← AGREGAR
  data: DireccionFormData
): Promise<CreateDireccionResponse> {
  const body: CreateDireccionRequest = {
    nId_PersDeudor: Number(id_deudor) || 0,
    cDirecc_Nomb: data.direccion,
    nId_PersRefUbi: Number(data.refUbicacion) || 0,
    cDirecc_Coment: data.comentario,
    bEstado: true,                                    // activo por defecto
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: data.tipoDeudor,
    dFec_Actualizacion: new Date().toISOString(),
    nId_Cliente: Number(id_cliente) || 0,
    nid_CalifDirecc: null,                               // TODO: verificar si necesita valor real
    nid_usuarioUpd: Number(id_usuario) || 0,          // ← ID del gestor logueado
    nId_Departamento: Number(data.departamento) || 0,
    nId_Provincia: Number(data.provincia) || 0,
    nId_Distrito: Number(data.distrito) || 0,
  };

  const result = await apiClient<ApiResponse<CreateDireccionResponse>>(
    `${BASE_DIRECCION}`,      // ← /v1/Direccion
    {
      method: 'POST',
      body,
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error al crear dirección');
  }

  return result.response;
}

// ─── GET: Obtener dirección por ID ───
export async function fetchDireccionById(
  idDireccion: string,
  signal?: AbortSignal
): Promise<DireccionByIdApi> {
  const result = await apiClient<ApiResponse<DireccionByIdApi>>(
    `${BASE_DIRECCION}/${idDireccion}`,  // ← /v1/Direccion/10561756
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando dirección para editar');
  }

  return result.response;
}

// ─── PUT: Actualizar dirección existente ───
export async function updateDireccion(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_direccion: string,
  data: DireccionEditFormData
): Promise<UpdateDireccionResponse> {
  
  // ← DEBUG: Loguea todo lo que recibe
  console.log('🔍 updateDireccion recibe:', {
    id_cliente,
    id_deudor,
    id_usuario,
    id_direccion,
    data,
  });

  const body: UpdateDireccionRequest = {
    nId_PersDirecc: Number(id_direccion),
    nId_PersDeudor: Number(id_deudor) || 0,
    cDirecc_Nomb: data.direccion,
    nId_PersRefUbi: Number(data.refUbicacion) || 0,
    cDirecc_Coment: data.comentario,
    bEstado: data.estado,
    bOrigen_Base: data.llegoDeBase,
    cTipoCoDeudor: data.tipoDeudor,
    dFec_Actualizacion: new Date().toISOString(),
    nId_Cliente: Number(id_cliente) || 0,
    nid_CalifDirecc: null,
    nid_usuarioUpd: Number(id_usuario) || 0,
    nId_Departamento: Number(data.departamento) || 0,
    nId_Provincia: Number(data.provincia) || 0,
    nId_Distrito: Number(data.distrito) || 0,
  };

  // ← DEBUG: Loguea el body antes de enviar
  console.log('🚀 PUT body:', JSON.stringify(body, null, 2));

  const result = await apiClient<ApiResponse<UpdateDireccionResponse>>(
    `${BASE_DIRECCION}`,
    { method: 'PUT', body }
  );

  // ← DEBUG: Loguea la respuesta
  console.log('📥 Response:', result);

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error al actualizar dirección');
  }

  return result.response;
}

export async function fetchDepartamentos(signal?: AbortSignal): Promise<Departamento[]> {
  const result = await apiClient<ApiResponseSimple<DepartamentoApi[]>>(
    `${BASE_DIRECCION}/GetDireccionDepartamentos`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando departamentos');
  }

  return result.response.map(item => ({
    id: String(item.nId_Departamento),
    nombre: item.cNombre_Departamento,
  }));
}

export async function fetchProvincias(
  idDepartamento: string,
  signal?: AbortSignal
): Promise<Provincia[]> {
  const result = await apiClient<ApiResponseSimple<ProvinciaApi[]>>(
    `${BASE_DIRECCION}/GetDireccionProvincias`,
    {
      signal,
      headers: {
        'nId_Departamento': idDepartamento,  // ← header, no query param
      },
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando provincias');
  }

  return result.response.map(item => ({
    id: String(item.nId_Provincia),
    nombre: item.cNombre_Provincia,
  }));
}

export async function fetchDistritos(
  idDepartamento: string,
  idProvincia: string,
  signal?: AbortSignal
): Promise<Distrito[]> {
  const params = new URLSearchParams({
    nId_Provincia: idProvincia,
  });

  const result = await apiClient<ApiResponseSimple<DistritoApi[]>>(
    `${BASE_DIRECCION}/GetDireccionDistritos?${params.toString()}`,
    {
      signal,
      headers: {
        'nId_Departamento': idDepartamento,
      },
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando distritos');
  }

  return result.response.map(item => ({
    id: String(item.nId_Distrito),
    nombre: item.cNombre_Distrito,
  }));
}

export async function fetchDireccionUbicaciones(signal?: AbortSignal): Promise<DireccionUbicacion[]> {
  const result = await apiClient<ApiResponseSimple<DireccionUbicacionApi[]>>(
    `${BASE_DIRECCION}/GetDireccionUbicaciones`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando ubicaciones');
  }

  return result.response.map(item => ({
    id: String(item.nId_PersRefUbi),
    nombre: item.cNombre_PersRefUbi,
  }));
}