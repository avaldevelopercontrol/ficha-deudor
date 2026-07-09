import type { CreateGestionOpeGesContratosPayload } from '../types/fichaGestion.types';
import {
  buildCreateGestionPayload,
  buildDocxCobrars,
} from '../mappers/fichaGestion.mapper';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import {
  hasFichaGestionErrors,
  validateFichaGestion,
} from '../validations/fichaGestionValidation';
import type { DocumentoApi } from '../../../shared/types';

interface BuildGestionSaveRequestParams {
  form: GestionFormClaro;
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  requiereCamposClaro: boolean;
}

interface GestionSaveRequestValid {
  isValid: true;
  validationErrors: FichaGestionValidationErrors;
  payload: CreateGestionOpeGesContratosPayload;
}

interface GestionSaveRequestInvalid {
  isValid: false;
  validationErrors: FichaGestionValidationErrors;
  payload?: never;
}

export type GestionSaveRequest =
  | GestionSaveRequestValid
  | GestionSaveRequestInvalid;

export const buildGestionSaveRequest = ({
  form,
  params,
  documentosFiltrados,
  np1TipoContacto,
  requiereCamposClaro,
}: BuildGestionSaveRequestParams): GestionSaveRequest => {
  const nIdDocxCobrars = buildDocxCobrars(documentosFiltrados);

  const validationErrors = validateFichaGestion({
    form,
    np1TipoContacto,
    tieneDocumentos: Boolean(nIdDocxCobrars),
    requiereCamposClaro,
  });

  if (hasFichaGestionErrors(validationErrors)) {
    return {
      isValid: false,
      validationErrors,
    };
  }

  const {
    id_cliente: idCliente,
    id_cartera: idCartera,
    id_contrato: idContrato,
    id_deudor: idDeudor,
    id_usuario: idUsuario,
    fecha_inicio_gestion: fechaInicioGestion,
  } = params;

  const payload = buildCreateGestionPayload({
    form,
    idCliente,
    idCartera,
    idContrato,
    idDeudor,
    idUsuario,
    fechaInicioGestion,
    nIdDocxCobrars,
    incluyeCamposClaro: requiereCamposClaro,
  });

  return {
    isValid: true,
    validationErrors,
    payload,
  };
};