import { apiClient } from '../../../shared/api/apiClient';
import { mockDireccionesReferenciadas } from '../mocks/mocks/direccionesReferenciadas';
import type { DireccionReferenciada, DireccionFormData, DireccionEditFormData } from '../../../shared/types';

// ─── GET (ya lo tienes) ───
export async function fetchDireccionesReferenciadas(
  id_deudor: string,
  id_cartera: string
): Promise<DireccionReferenciada[]> {
  return apiClient<DireccionReferenciada[]>(
    `/direcciones-referenciadas?id_deudor=${id_deudor}&id_cartera=${id_cartera}`,
    {
      mock: () => mockDireccionesReferenciadas[id_deudor] ?? [],
    }
  );
}

// ─── POST: Crear nueva dirección (ya lo tienes) ───
export async function createDireccion(
  id_deudor: string,
  id_cartera: string,
  data: DireccionFormData
): Promise<DireccionReferenciada> {
  return apiClient<DireccionReferenciada>(
    `/direcciones-referenciadas`,
    {
      body: { id_deudor, id_cartera, ...data },
      mock: () => {
        const nuevo: DireccionReferenciada = {
          id: `DIR-${Date.now()}`,
          direccion: `${data.direccion}, ${data.distrito}`,
          refUbicacion: data.refUbicacion,
          tipoDeudor: data.tipoDeudor,
          nombre: data.tipoDeudor === 'Titular' 
            ? 'S.A.A. INVERSIONES CENTENARIO' 
            : data.tipoDeudor,
          estado: 'OPERATIVO',
          departamento: data.departamento,
          provincia: data.provincia,
          distrito: data.distrito,
          comentario: data.comentario,
          llegoDeBase: data.llegoDeBase,
          nombreAval: data.tipoDeudor === 'Titular' ? '—' : data.tipoDeudor,
        };
        
        if (!mockDireccionesReferenciadas[id_deudor]) {
          mockDireccionesReferenciadas[id_deudor] = [];
        }
        mockDireccionesReferenciadas[id_deudor].push(nuevo);
        
        return nuevo;
      },
    }
  );
}

// ─── PUT: Actualizar dirección existente ───
export async function updateDireccion(
  id_deudor: string,
  id_cartera: string,
  id_direccion: string,
  data: DireccionEditFormData
): Promise<DireccionReferenciada> {
  return apiClient<DireccionReferenciada>(
    `/direcciones-referenciadas/${id_direccion}`,
    {
      body: { id_deudor, id_cartera, ...data },
      mock: () => {
        const lista = mockDireccionesReferenciadas[id_deudor] || [];
        const index = lista.findIndex(d => d.id === id_direccion);
        
        if (index === -1) {
          throw new Error(`Dirección ${id_direccion} no encontrada`);
        }
        
        const actualizado: DireccionReferenciada = {
          ...lista[index],
          direccion: `${data.direccion}, ${data.distrito}`,
          departamento: data.departamento,
          provincia: data.provincia,
          distrito: data.distrito,
          refUbicacion: data.refUbicacion,
          comentario: data.comentario,
          llegoDeBase: data.llegoDeBase,
          tipoDeudor: data.tipoDeudor,
          nombreAval: data.nombreAval,
          estado: data.estado,
          nombre: data.tipoDeudor === 'Titular' 
            ? 'S.A.A. INVERSIONES CENTENARIO' 
            : data.nombreAval || data.tipoDeudor,
        };
        
        lista[index] = actualizado;
        
        return actualizado;
      },
    }
  );
}