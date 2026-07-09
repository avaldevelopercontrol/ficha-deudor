import { useCallback } from 'react';
import type { ChangeEvent } from 'react';

import type { FichaGestionAccionesTomarProps } from '../types/fichaGestion.types';
import { buildTimeValue, hasValidDate } from '../../../shared/utils/date.utils';
import { sanitizeDecimalValue } from '../../../shared/utils/number.utils';

type TimePart = 'hour' | 'minute';

type UseFichaGestionAccionesTomarParams = Pick<
  FichaGestionAccionesTomarProps,
  'form' | 'setField' | 'setFields'
>;

export const useFichaGestionAccionesTomar = ({
  form,
  setField,
  setFields,
}: UseFichaGestionAccionesTomarParams) => {
  const puedeIngresarCompromiso = hasValidDate(form.fechaCompromisoPago);
  const puedeSeleccionarHoraNuevaGestion = hasValidDate(form.fechaNuevaGestion);
  const puedeSeleccionarHoraGestion = hasValidDate(form.fechaGestion);

  const handleFechaCompromisoChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFields({
        fechaCompromisoPago: value,
        compromisoSoles: value ? form.compromisoSoles : '',
        compromisoUSD: value ? form.compromisoUSD : '',
      });
    },
    [form.compromisoSoles, form.compromisoUSD, setFields]
  );

  const handleCompromisoSolesChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setField('compromisoSoles', sanitizeDecimalValue(event.target.value));
    },
    [setField]
  );

  const handleCompromisoUsdChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setField('compromisoUSD', sanitizeDecimalValue(event.target.value));
    },
    [setField]
  );

  const handleFechaNuevaGestionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFields({
        fechaNuevaGestion: value,
        horaNuevaGestion: value ? form.horaNuevaGestion : '',
      });
    },
    [form.horaNuevaGestion, setFields]
  );

  const handleHoraNuevaGestionChange = useCallback(
    (type: TimePart, value: string) => {
      setField(
        'horaNuevaGestion',
        buildTimeValue(form.horaNuevaGestion, type, value)
      );
    },
    [form.horaNuevaGestion, setField]
  );

  const handleFechaGestionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFields({
        fechaGestion: value,
        horaGestion: value ? form.horaGestion : '',
      });
    },
    [form.horaGestion, setFields]
  );

  const handleHoraGestionChange = useCallback(
    (type: TimePart, value: string) => {
      setField('horaGestion', buildTimeValue(form.horaGestion, type, value));
    },
    [form.horaGestion, setField]
  );

  return {
    puedeIngresarCompromiso,
    puedeSeleccionarHoraNuevaGestion,
    puedeSeleccionarHoraGestion,
    handleFechaCompromisoChange,
    handleCompromisoSolesChange,
    handleCompromisoUsdChange,
    handleFechaNuevaGestionChange,
    handleHoraNuevaGestionChange,
    handleFechaGestionChange,
    handleHoraGestionChange,
  };
};