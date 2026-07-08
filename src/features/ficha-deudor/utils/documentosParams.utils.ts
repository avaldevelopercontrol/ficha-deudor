interface GestionDocumentosParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  pageNumber: number;
  pageSize: number;
}

export const buildGestionDocumentosParams = ({
  idCliente,
  idCartera,
  idDeudor,
  pageNumber,
  pageSize,
}: GestionDocumentosParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
};

export const buildDocumentosBotonesParams = (idCliente: string) => {
  return new URLSearchParams({
    id_cliente: idCliente,
  });
};

export const buildDocumentosCabeceraParams = ({
  idCliente,
  idContrato,
}: {
  idCliente: string;
  idContrato: string;
}) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Contrato: idContrato,
  });
};