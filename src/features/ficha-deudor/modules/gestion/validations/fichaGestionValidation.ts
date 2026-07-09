import { TIPO_CONTACTO, TIPO_GESTION } from '../constants/fichaGestion.constants';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import { toDecimalNumber, toNumber } from '../../../shared/utils/number.utils';

interface ValidateFichaGestionParams {
  form: GestionFormClaro;
  np1TipoContacto: number;
  tieneDocumentos: boolean;
  requiereCamposClaro?: boolean;
}

const isEmptyValue = (value: string | number | null | undefined) => {
  return value === null || value === undefined || String(value).trim() === '';
};

const isEmptyOrZero = (value: string | number | null | undefined) => {
  return isEmptyValue(value) || toNumber(value) === 0;
};

export const validateFichaGestion = ({
  form,
  np1TipoContacto,
  tieneDocumentos,
  requiereCamposClaro = false,
}: ValidateFichaGestionParams): FichaGestionValidationErrors => {
  const errors: FichaGestionValidationErrors = {};

  if (!tieneDocumentos) {
    errors.documentos = 'No hay documentos para gestionar.';
  }

  if (isEmptyOrZero(form.np0)) {
    errors.np0 = 'Selecciona: (NP0) Clasificación';
  }

  if (isEmptyOrZero(form.np1)) {
    errors.np1 = 'Selecciona: (NP1) Respuesta de Operación';
  }

  if (isEmptyOrZero(form.estadoGestion)) {
    errors.estadoGestion = 'Ingrese Estado de Gestión';
  }

  if (isEmptyOrZero(form.tipoGestion)) {
    errors.tipoGestion = 'Selecciona: Tipo de Gestión';
  }

  if (isEmptyValue(form.observaciones)) {
    errors.observaciones = 'Ingrese Observaciones';
  }

  if (requiereCamposClaro) {
    if (isEmptyOrZero(form.estadoGestionClaro)) {
      errors.estadoGestionClaro = 'Selecciona: Estado de Gestión Claro';
    }

    if (isEmptyOrZero(form.motivoNoPago)) {
      errors.motivoNoPago = 'Selecciona: Motivo No Pago';
    }
  }

  const tieneFechaCompromiso = !isEmptyValue(form.fechaCompromisoPago);
  const montoSoles = toDecimalNumber(form.compromisoSoles);
  const montoDolares = toDecimalNumber(form.compromisoUSD);
  const tieneMontoCompromiso = montoSoles > 0 || montoDolares > 0;

  if (tieneFechaCompromiso && !tieneMontoCompromiso) {
    errors.montoCompromiso =
      'Ingrese Compromiso S/. o Compromiso $US cuando registre Fecha Compromiso';
  }

  if (np1TipoContacto === TIPO_CONTACTO.COMPROMISO) {
    if (isEmptyValue(form.fechaCompromisoPago)) {
      errors.fechaCompromisoPago = 'Ingrese Fecha de Compromiso es Obligatorio';
    }

    if (!tieneMontoCompromiso) {
      errors.montoCompromiso = 'Ingrese Monto de Compromiso';
    }
  }

  if (
    !isEmptyValue(form.fechaNuevaGestion) &&
    isEmptyValue(form.horaNuevaGestion)
  ) {
    errors.horaNuevaGestion = 'Ingrese Hora de Nueva Gestión';
  }

  if (!isEmptyValue(form.fechaGestion) && isEmptyValue(form.horaGestion)) {
    errors.horaGestion = 'Ingrese Hora de Gestión';
  }

  const tipoGestion = toNumber(form.tipoGestion);
  const telefono = form.telefono.trim();

  if (tipoGestion !== TIPO_GESTION.EMAIL && telefono.length > 10) {
    errors.telefono = 'Sólo se puede ingresar un Nro de Teléfono';
  }

  return errors;
};

export const hasFichaGestionErrors = (
  errors: FichaGestionValidationErrors
) => Object.keys(errors).length > 0;

export const getFichaGestionErrorMessages = (
  errors: FichaGestionValidationErrors
) => {
  return Array.from(new Set(Object.values(errors).filter(Boolean)));
};