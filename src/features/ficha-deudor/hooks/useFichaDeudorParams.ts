import { useMemo } from 'react';

interface UrlParams {
  id_cliente: string | null;
  id_cartera: string | null;
  id_deudor: string | null;
  id_contrato: string | null;
  id_usuario: string | null;
}

export function useUrlParams(): UrlParams {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    
    return {
      id_cliente: params.get('id_cliente'),
      id_cartera: params.get('id_cartera'),
      id_deudor: params.get('id_deudor'),
      id_contrato: params.get('id_contrato'),
      id_usuario: params.get('id_usuario'),
    };
  }, []); // Solo lee una vez al montar
}