import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import { buildCreateAgendaPayload } from '../mappers/fichaGestionAgenda.mapper';
import type {
  CreateAgendaPayload,
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import { validateFichaGestionAgenda } from '../validations/fichaGestionAgendaValidation';

interface BuildAgendaRequestParams {
  form: GestionFormClaro;
  params: FichaDeudorGestionFormParams;
  deudorNombre: string;
  carteraNombre: string;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
}

interface AgendaRequestValid {
  isValid: true;
  validationErrors:
    FichaGestionValidationErrors;
  payload: CreateAgendaPayload;
}

interface AgendaRequestInvalid {
  isValid: false;
  validationErrors:
    FichaGestionValidationErrors;
  payload?: never;
}

export type AgendaRequest =
  | AgendaRequestValid
  | AgendaRequestInvalid;

export const buildAgendaRequest = ({
  form,
  params,
  deudorNombre,
  carteraNombre,
  np1Options,
  np2Options,
}: BuildAgendaRequestParams): AgendaRequest => {
  const validationErrors =
    validateFichaGestionAgenda({
      form,
      np1Options,
      np2Options,
    });

  if (
    Object.keys(validationErrors).length > 0
  ) {
    return {
      isValid: false,
      validationErrors,
    };
  }

  if (
    !deudorNombre.trim() ||
    !carteraNombre.trim()
  ) {
    throw new Error(
      'No se pudo obtener el nombre del deudor o la cartera para registrar la agenda.'
    );
  }

  return {
    isValid: true,
    validationErrors,
    payload: buildCreateAgendaPayload({
      form,
      params,
      deudorNombre,
      carteraNombre,
      np1Options,
      np2Options,
    }),
  };
};