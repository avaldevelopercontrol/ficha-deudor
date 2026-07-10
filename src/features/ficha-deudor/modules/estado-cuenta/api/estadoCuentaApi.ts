import {
  apiFileClient,
  type ApiFileResult,
} from '@shared/api/apiClient';

import {
  ESTADO_CUENTA_EXPORT_CONFIG,
} from '../constants/estadoCuentaPopup.constants';

const BASE_GESTION = '/v1/Gestion';

interface ExportEstadoCuentaParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export const exportGestionEstadoCuenta = async ({
  idCliente,
  idCartera,
  idDeudor,
}: ExportEstadoCuentaParams): Promise<ApiFileResult> => {
  const searchParams = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: String(
      ESTADO_CUENTA_EXPORT_CONFIG.pageNumber
    ),
    PageSize: String(
      ESTADO_CUENTA_EXPORT_CONFIG.pageSize
    ),
  });

  return apiFileClient(
    `${BASE_GESTION}/ExportGestionEstadoCuenta?${searchParams.toString()}`,
    {
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    }
  );
};