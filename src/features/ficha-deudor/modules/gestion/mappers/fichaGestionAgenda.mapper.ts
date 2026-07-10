import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import { toNumber } from '../../../shared/utils/number.utils';
import { isSinDatoOption } from '../validations/fichaGestionAgendaValidation';
import type {
  CreateAgendaPayload,
  GestionFormClaro,
} from '../types/fichaGestion.types';

interface BuildCreateAgendaPayloadParams {
  form: GestionFormClaro;
  params: FichaDeudorGestionFormParams;
  deudorNombre: string;
  carteraNombre: string;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
  registrationDate?: Date;
}

const findSelectedOption = (
  value: string,
  options: PaletaRespuestaOption[]
): PaletaRespuestaOption | undefined => {
  return options.find(
    (option) =>
      String(option.id) === String(value)
  );
};

const extractLastNumericCode = (
  label: string
): number => {
  const matches = Array.from(
    label.matchAll(/\((\d+)\)/g)
  );

  const lastMatch = matches.at(-1);

  if (!lastMatch?.[1]) {
    throw new Error(
      `No se encontró un código numérico entre paréntesis en la opción "${label}".`
    );
  }

  return Number(lastMatch[1]);
};

const buildScheduledDateTime = (
  date: string,
  time: string
): string => {
  const [year, month, day] = date
    .split('-')
    .map(Number);

  const [hour, minute] = time
    .split(':')
    .map(Number);

  const scheduledDate = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );

  if (
    Number.isNaN(scheduledDate.getTime())
  ) {
    throw new Error(
      'La fecha y hora de nueva gestión no son válidas.'
    );
  }

  return scheduledDate.toISOString();
};

export const buildCreateAgendaPayload = ({
  form,
  params,
  deudorNombre,
  carteraNombre,
  np1Options,
  np2Options,
  registrationDate = new Date(),
}: BuildCreateAgendaPayloadParams): CreateAgendaPayload => {
  const selectedNP1 = findSelectedOption(
    form.np1,
    np1Options
  );

  const selectedNP2 = findSelectedOption(
    form.np2,
    np2Options
  );

  const useNP2 = Boolean(
    selectedNP2 &&
      !isSinDatoOption(selectedNP2)
  );

  const finalOption = useNP2
    ? selectedNP2
    : selectedNP1;

  if (!finalOption) {
    throw new Error(
      'No se pudo determinar la respuesta seleccionada para agendar.'
    );
  }

  return {
    nid_agenda: 0,

    dFechNuevaGestion:
      buildScheduledDateTime(
        form.fechaNuevaGestion,
        form.horaNuevaGestion
      ),

    nid_PersDeudor:
      toNumber(params.id_deudor),

    nombre: deudorNombre.trim(),
    cartera: carteraNombre.trim(),

    nid_Cartera:
      toNumber(params.id_cartera),

    nid_Cliente:
      toNumber(params.id_cliente),

    nid_UsuOpe:
      toNumber(params.id_usuario),

    dFecRegistro:
      registrationDate.toISOString(),

    cUsr_Login:
      String(params.id_usuario),

    nId_TipoOpeCodCliOut:
      useNP2 ? 2 : 1,

    cRespuestaOpe:
      finalOption.label.trim(),

    nId_OpeCodCliOut:
      extractLastNumericCode(
        finalOption.label
      ),
  };
};