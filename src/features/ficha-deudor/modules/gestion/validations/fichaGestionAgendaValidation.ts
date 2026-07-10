import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';

interface ValidateFichaGestionAgendaParams {
  form: GestionFormClaro;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
  now?: Date;
}

const isEmpty = (
  value: string | null | undefined
): boolean => {
  return !String(value ?? '').trim();
};

const isCompleteTime = (
  value: string
): boolean => {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
};

const buildLocalDateTime = (
  date: string,
  time: string
): Date | null => {
  const [year, month, day] = date
    .split('-')
    .map(Number);

  const [hour, minute] = time
    .split(':')
    .map(Number);

  if (
    [year, month, day, hour, minute].some(
      Number.isNaN
    )
  ) {
    return null;
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );

  return Number.isNaN(result.getTime())
    ? null
    : result;
};

export const normalizePaletaLabel = (
  label: string
): string => {
  return label
    .replace(/\(\s*\d+\s*\)\s*$/, '')
    .trim()
    .toLocaleUpperCase('es-PE');
};

export const isSinDatoOption = (
  option: PaletaRespuestaOption | undefined
): boolean => {
  return Boolean(
    option &&
      normalizePaletaLabel(option.label) ===
        'SIN DATO'
  );
};

const findSelectedOption = (
  value: string,
  options: PaletaRespuestaOption[]
): PaletaRespuestaOption | undefined => {
  return options.find(
    (option) =>
      String(option.id) === String(value)
  );
};

export const validateFichaGestionAgenda = ({
  form,
  np1Options,
  np2Options,
  now = new Date(),
}: ValidateFichaGestionAgendaParams): FichaGestionValidationErrors => {
  const errors: FichaGestionValidationErrors = {};

  if (isEmpty(form.fechaNuevaGestion)) {
    errors.fechaNuevaGestion =
      'Seleccione la fecha de nueva gestión.';
  }

  if (isEmpty(form.horaNuevaGestion)) {
    errors.horaNuevaGestion =
      'Seleccione la hora de nueva gestión.';
  } else if (
    !isCompleteTime(form.horaNuevaGestion)
  ) {
    errors.horaNuevaGestion =
      'Seleccione una hora completa para la nueva gestión.';
  }

  if (
    !isEmpty(form.fechaNuevaGestion) &&
    isCompleteTime(form.horaNuevaGestion)
  ) {
    const scheduledDate = buildLocalDateTime(
      form.fechaNuevaGestion,
      form.horaNuevaGestion
    );

    if (!scheduledDate) {
      errors.fechaNuevaGestion =
        'La fecha y hora de nueva gestión no son válidas.';
    } else if (
      scheduledDate.getTime() <= now.getTime()
    ) {
      errors.fechaNuevaGestion =
        'La fecha y hora de nueva gestión debe ser posterior a la actual.';
    }
  }

  if (
    isEmpty(form.np0) ||
    Number(form.np0) === 0
  ) {
    errors.np0 =
      'Seleccione una opción en NP0.';
  }

  const selectedNP1 = findSelectedOption(
    form.np1,
    np1Options
  );

  if (!selectedNP1) {
    errors.np1 =
      'Seleccione una opción en NP1.';
  }

  const selectedNP2 = findSelectedOption(
    form.np2,
    np2Options
  );

  const hasRealNP2Options = np2Options.some(
    (option) => !isSinDatoOption(option)
  );

  /*
   * Cuando NP2 solamente contiene SIN DATO,
   * se permite continuar usando la selección de NP1.
   *
   * Cuando existen respuestas reales en NP2,
   * debe seleccionarse una de ellas.
   */
  if (
    hasRealNP2Options &&
    (
      !selectedNP2 ||
      isSinDatoOption(selectedNP2)
    )
  ) {
    errors.np2 =
      'Seleccione una opción válida en NP2.';
  }
  
  return errors;
};