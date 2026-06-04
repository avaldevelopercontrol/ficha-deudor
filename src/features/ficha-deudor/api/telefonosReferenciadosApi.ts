// src/services/modules/telefonosReferenciadosApi.ts
import { apiClient } from '../../../shared/api/apiClient';
import { mockTelefonosReferenciados } from '../mocks/mocks/telefonosReferenciados';
import type { TelefonoReferenciado, TelefonoFormData } from '../../../shared/types';

export async function fetchTelefonosReferenciados(
  id_deudor: string,
  id_cartera: string
): Promise<TelefonoReferenciado[]> {
  return apiClient<TelefonoReferenciado[]>(
    `/telefonos-referenciados?id_deudor=${id_deudor}&id_cartera=${id_cartera}`,
    {
      mock: () => mockTelefonosReferenciados[id_deudor] ?? [],
    }
  );
}

// ─── POST: Crear nuevo teléfono ───
export async function createTelefono(
  id_deudor: string,
  id_cartera: string,
  data: TelefonoFormData
): Promise<TelefonoReferenciado> {
  return apiClient<TelefonoReferenciado>(
    `/telefonos-referenciados`,
    {
      body: { id_deudor, id_cartera, ...data },
      mock: () => {
        const nuevo: TelefonoReferenciado = {
          id: `TEL-${Date.now()}`,
          prioridad: parseInt(data.prioridad) || 0,
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
  id_deudor: string,
  id_cartera: string,
  id_telefono: string,
  data: TelefonoFormData
): Promise<TelefonoReferenciado> {
  return apiClient<TelefonoReferenciado>(
    `/telefonos-referenciados/${id_telefono}`,
    {
      body: { id_deudor, id_cartera, ...data },
      mock: () => {
        const lista = mockTelefonosReferenciados[id_deudor] || [];
        const index = lista.findIndex(t => t.id === id_telefono);
        
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
          prioridad: parseInt(data.prioridad) || 0,
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