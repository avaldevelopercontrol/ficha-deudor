import type {
  ClienteActivo,
  ClienteActivoApi,
} from '../types/clienteActivo.types';

const toNumberValue = (
  value: unknown
): number => {
  const numericValue = Number(value);

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : 0;
};

const toTrimmedString = (
  value: unknown
): string =>
  typeof value === 'string'
    ? value.trim()
    : '';

export const mapClienteActivo = (
  cliente: ClienteActivoApi
): ClienteActivo => ({
  idCliente: toNumberValue(
    cliente.nId_Cliente
  ),

  nombreCliente:
    toTrimmedString(
      cliente.cCli_Nombre
    ),
});

export const mapClientesActivosResponse = (
  response:
    | ClienteActivoApi[]
    | ClienteActivoApi
    | null
): ClienteActivo[] => {
  const clientes = Array.isArray(
    response
  )
    ? response
    : response
      ? [response]
      : [];

  return clientes
    .map(mapClienteActivo)
    .filter(
      (cliente) =>
        cliente.idCliente > 0 &&
        Boolean(
          cliente.nombreCliente
        )
    );
};
