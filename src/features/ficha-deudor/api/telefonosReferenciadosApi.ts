import { apiClient } from '../../../shared/api/apiClient';
import { mockTelefonosReferenciados } from '../mocks/mocks/telefonosReferenciados';
import type { TelefonoReferenciado, TelefonoFormData, ApiResponse, 
              TelefonoReferenciadoApi, ApiResponseSimple, TelefonoList, 
              TelefonoResultadoApi, TelefonoOperadorApi,
              TelefonoUbicacionApi, TelefonoHorarioGestionApi,
              TelefonoFuenteBusquedaApi} from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';
const BASE_TELEFONO = '/v1/Telefono';

// ─── GET: Todos los registros (carga masiva para filtros client-side) ───
export async function fetchTelefonosReferenciados(
  id_cliente: string,
  id_deudor: string,
): Promise<TelefonoReferenciado[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '1000'
  });

  const result = await apiClient<ApiResponse<TelefonoReferenciadoApi[]>>(
    `${BASE_GESTION}/GetGestionTelefonos?${params.toString()}`,
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando teléfonos');
  }

  return result.response.map((item) => ({
    id: item.nroTelefono,
    prioridad: item.prioridad,
    numero: item.nroTelefono,                   // nroTelefono → numero
    horario: item.horario,
    refUbicacion: item.referenciaUbicacion,     // referenciaUbicacion → refUbicacion
    estado: item.estado,
    fechaEstado: item.fechaEstado,
    fechaBase: item.fechaBase,
    contactados: item.contactados,
    noContactados: item.noContactados,
    ivr: String(item.cantidadIvr),              // cantidadIvr (number) → ivr (string)
    fuente: item.fuente,
    ordenSearch: parseInt(item.ordenSearch, 10) || 0, // ordenSearch (string) → number
    // Campos que no vienen en el GET pero existen en el type del frontend
    anexo: '',
    operadorTelefonico: '',
    referencia: '',
    reclamoIndecopi: '',
  }));
}

// ─── POST: Crear nuevo teléfono ───
export async function createTelefono(
  id_cliente: string,
  id_deudor: string,
  data: TelefonoFormData
): Promise<TelefonoReferenciado> {
  return apiClient<TelefonoReferenciado>(
    `${BASE_GESTION}/CreateTelefono`,
    {
      method: 'POST',
      body: {
        nId_Cliente: id_cliente,
        nId_Persdeudor: id_deudor,
        ...data,
      },
      mock: () => {
        const nuevo: TelefonoReferenciado = {
          id: `TEL-${Date.now()}`,
          prioridad: parseInt(data.prioridad, 10) || 0,
          numero: data.numero,
          horario: data.horarioGestion,
          refUbicacion: data.ubicacion,
          estado: data.resultado,
          fechaEstado: new Date().toLocaleDateString('es-PE'),
          fechaBase: new Date().toLocaleDateString('es-PE'),
          contactados: '0%',
          noContactados: 0,
          ivr: '0',
          fuente: data.fuenteBusqueda,
          ordenSearch: 99,
          anexo: data.anexo,
          operadorTelefonico: data.operadorTelefonico,
          referencia: data.referencia,
          reclamoIndecopi: data.reclamoIndecopi,
        };

        if (!mockTelefonosReferenciados[id_deudor]) {
          mockTelefonosReferenciados[id_deudor] = [];
        }
        mockTelefonosReferenciados[id_deudor].push(nuevo);

        return nuevo;
      },
    }
  );
}

// ─── PUT: Actualizar teléfono existente ───
export async function updateTelefono(
    id_cliente: string,
    id_deudor: string,
    id_telefono: string,
    data: TelefonoFormData
  ): Promise<TelefonoReferenciado> {
    return apiClient<TelefonoReferenciado>(
      `${BASE_GESTION}/UpdateTelefono/${id_telefono}`,
      {
        method: 'PUT',
        body: {
          nId_Cliente: id_cliente,
          nId_Persdeudor: id_deudor,
          idTelefono: id_telefono,
          ...data,
        },
        mock: () => {
          const lista = mockTelefonosReferenciados[id_deudor] || [];
          const index = lista.findIndex((t) => t.id === id_telefono);

          if (index === -1) {
            throw new Error(`Teléfono ${id_telefono} no encontrado`);
          }

          const actualizado: TelefonoReferenciado = {
            ...lista[index],
            numero: data.numero,
            anexo: data.anexo,
            estado: data.resultado,
            operadorTelefonico: data.operadorTelefonico,
            refUbicacion: data.ubicacion,
            prioridad: parseInt(data.prioridad, 10) || 0,
            horario: data.horarioGestion,
            fuente: data.fuenteBusqueda,
            referencia: data.referencia,
            reclamoIndecopi: data.reclamoIndecopi,
          };

          lista[index] = actualizado;
          return actualizado;
        },
      }
    );
  }

  export async function fetchTelefonoResultados(signal?: AbortSignal): Promise<TelefonoList[]> {
    const result = await apiClient<ApiResponseSimple<TelefonoResultadoApi[]>>(
      `${BASE_TELEFONO}/GetTelefonoResultados`,
      { signal }
    );

    if (result.statusCode !== 200) {
      throw new Error(result.message || 'Error cargando resultados telefónicos');
    }

    return result.response.map(item => ({
      id: String(item.nId_PersTelefOpe),
      nombre: item.cNombre_PersTelefOpe,
    }));
  };

  export async function fetchTelefonoOperadores(signal?: AbortSignal): Promise<TelefonoList[]> {
    const result = await apiClient<ApiResponseSimple<TelefonoOperadorApi[]>>(
      `${BASE_TELEFONO}/GetTelefonoOperadores`,
      { signal }
    );

    if (result.statusCode !== 200) {
      throw new Error(result.message || 'Error cargando operadores telefónicos');
    }

    return result.response.map(item => ({
      id: String(item.nId_OperadorTelefonico),
      nombre: item.cAbrevOperadorTelef,
    }));
  }

  export async function fetchTelefonoUbicaciones(signal?: AbortSignal): Promise<TelefonoList[]> {
    const result = await apiClient<ApiResponseSimple<TelefonoUbicacionApi[]>>(
      `${BASE_TELEFONO}/GetTelefonoUbicaciones`,
      { signal }
    );

    if (result.statusCode !== 200) {
      throw new Error(result.message || 'Error cargando ubicaciones telefónicas');
    }

    return result.response.map(item => ({
      id: String(item.nId_PersRefUbi),
      nombre: item.cNombre_PersRefUbi,
    }));
  }

  export async function fetchTelefonoHorarioGestion(signal?: AbortSignal): Promise<TelefonoList[]> {
    const result = await apiClient<ApiResponseSimple<TelefonoHorarioGestionApi[]>>(
      `${BASE_TELEFONO}/GetTelefonoHorarioGestion`,
      { signal }
    );

    if (result.statusCode !== 200) {
      throw new Error(result.message || 'Error cargando horarios de gestión');
    }

    return result.response.map(item => ({
      id: String(item.nId_PersDeudorGestionHrs),
      nombre: item.cNombren_PersDeudorGestionHrs,
    }));
  }

  export async function fetchTelefonoFuenteBusqueda(signal?: AbortSignal): Promise<TelefonoList[]> {
    const result = await apiClient<ApiResponseSimple<TelefonoFuenteBusquedaApi[]>>(
      `${BASE_TELEFONO}/GetTelefonoFuenteBusqueda`,
      { signal }
    );

    if (result.statusCode !== 200) {
      throw new Error(result.message || 'Error cargando fuentes de búsqueda');
    }

    return result.response.map(item => ({
      id: String(item.nId_Fuente),
      nombre: item.cDescripcion,
    }));
  }