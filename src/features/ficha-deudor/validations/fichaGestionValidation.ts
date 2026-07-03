import type { GestionFormClaro } from '../hooks/useFichaGestionForm';

export type FichaGestionValidationErrors = Partial<
  Record<keyof GestionFormClaro | 'montoCompromiso' | 'documentos', string>
>;

interface ValidateFichaGestionParams {
  form: GestionFormClaro;
  np1TipoContacto: number;
  tieneDocumentos: boolean;
}

const TIPO_CONTACTO_COMPROMISO = 2;
const TIPO_GESTION_EMAIL = 5;

const toNumber = (value: string | number | null | undefined) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const toDecimalNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 0;

  const parsedValue = Number(String(value).replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

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

  if (isEmptyOrZero(form.estadoGestionClaro)) {
    errors.estadoGestionClaro = 'Selecciona: Estado de Gestión Claro';
  }

  if (isEmptyOrZero(form.motivoNoPago)) {
    errors.motivoNoPago = 'Selecciona: Motivo No Pago';
  }

  if (np1TipoContacto === TIPO_CONTACTO_COMPROMISO) {
    if (isEmptyValue(form.fechaCompromisoPago)) {
      errors.fechaCompromisoPago = 'Ingrese Fecha de Compromiso es Obligatorio';
    }

    const montoSoles = toDecimalNumber(form.compromisoSoles);
    const montoDolares = toDecimalNumber(form.compromisoUSD);

    if (montoSoles <= 0 && montoDolares <= 0) {
      errors.montoCompromiso = 'Ingrese Monto de Compromiso';
    }
  }

  const tipoGestion = toNumber(form.tipoGestion);
  const telefono = form.telefono.trim();

  if (tipoGestion !== TIPO_GESTION_EMAIL && telefono.length > 10) {
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
  return Array.from(
    new Set(Object.values(errors).filter(Boolean))
  );
};