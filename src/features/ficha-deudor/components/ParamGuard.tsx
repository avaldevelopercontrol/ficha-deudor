import React from 'react';
import { useUrlParams } from '../hooks/useFichaDeudorParams';

interface ParamGuardProps {
  children: (params: { id_cliente: string; id_cartera: string; id_deudor: string; id_contrato: string; id_usuario: string }) => React.ReactNode;
}

export const ParamGuard: React.FC<ParamGuardProps> = ({ children }) => {
  const { id_cliente, id_cartera, id_deudor, id_contrato, id_usuario } = useUrlParams();

  const faltantes: string[] = [];
  if (!id_cliente) faltantes.push('id_cliente');
  if (!id_cartera) faltantes.push('id_cartera');
  if (!id_deudor) faltantes.push('id_deudor');
  if (!id_contrato) faltantes.push('id_contrato');
  if (!id_usuario) faltantes.push('id_usuario');

  if (faltantes.length > 0) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#c00' }}>
        <h2>Error: Parámetros faltantes</h2>
        <p>La URL debe incluir: <code>{faltantes.join(', ')}</code></p>
        <p>Ejemplo: <code>?id_cliente=178&id_cartera=45&id_deudor=999&id_contrato=30&id_usuario=carlos.r</code></p>
      </div>
    );
  }

  return <>{children({ id_cliente: id_cliente!, id_cartera: id_cartera!, id_deudor: id_deudor!, id_contrato: id_contrato!, id_usuario: id_usuario! })}</>;
};