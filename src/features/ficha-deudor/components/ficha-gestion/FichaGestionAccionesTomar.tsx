import React from 'react';
import type {
  GestionFormClaro,
  SetGestionField,
  SetGestionFields,
} from '../../types/fichaGestion.types';
import {
  buildTimeValue,
  getTimeHour,
  getTimeMinute,
  hasValidDate,
} from '../../utils/date.utils';
import { sanitizeDecimalValue } from '../../utils/number.utils';

interface Props {
  form: GestionFormClaro;
  setField: SetGestionField;
  setFields: SetGestionFields;
  usuarioActual: string;
  handleAgendar: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0')
);

const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0')
);

const FichaGestionAccionesTomar: React.FC<Props> = ({
  form,
  setField,
  setFields,
  usuarioActual,
  handleAgendar,
}) => {
  const puedeIngresarCompromiso = hasValidDate(form.fechaCompromisoPago);
  const puedeSeleccionarHoraNuevaGestion = hasValidDate(form.fechaNuevaGestion);
  const puedeSeleccionarHoraGestion = hasValidDate(form.fechaGestion);

  const handleFechaCompromisoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFields({
      fechaCompromisoPago: value,
      compromisoSoles: value ? form.compromisoSoles : '',
      compromisoUSD: value ? form.compromisoUSD : '',
    });
  };

  const handleCompromisoSolesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setField('compromisoSoles', sanitizeDecimalValue(event.target.value));
  };

  const handleCompromisoUsdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setField('compromisoUSD', sanitizeDecimalValue(event.target.value));
  };

  const handleFechaNuevaGestionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFields({
      fechaNuevaGestion: value,
      horaNuevaGestion: value ? form.horaNuevaGestion : '',
    });
  };

  const handleHoraNuevaGestionChange = (
    type: 'hour' | 'minute',
    value: string
  ) => {
    setField(
      'horaNuevaGestion',
      buildTimeValue(form.horaNuevaGestion, type, value)
    );
  };

  const handleFechaGestionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setFields({
      fechaGestion: value,
      horaGestion: value ? form.horaGestion : '',
    });
  };

  const handleHoraGestionChange = (
    type: 'hour' | 'minute',
    value: string
  ) => {
    setField('horaGestion', buildTimeValue(form.horaGestion, type, value));
  };

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion ficha-block--acciones-tomar">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">ACCIONES A TOMAR</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <div
          className="form-grid g3 form-grid--inline"
          style={{ marginBottom: '6px' }}
        >
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Fecha Compromiso:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaCompromisoPago}
              onChange={handleFechaCompromisoChange}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Compromiso S/.:
            </label>

            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoSoles}
              disabled={!puedeIngresarCompromiso}
              onChange={handleCompromisoSolesChange}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Compromiso $US:
            </label>

            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoUSD}
              disabled={!puedeIngresarCompromiso}
              onChange={handleCompromisoUsdChange}
            />
          </div>
        </div>

        <div
          className="agendar-gestion-row agendar-gestion-row--compact agendar-gestion-row--inline"
          style={{ marginBottom: '6px' }}
        >
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Fecha Nueva Gestión:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaNuevaGestion}
              onChange={handleFechaNuevaGestionChange}
            />
          </div>

          <div className="form-row-inline form-row-inline--time">
            <label className="form-label form-label--inline">Hora:</label>

            <select
              className="form-input form-input--inline-field"
              value={getTimeHour(form.horaNuevaGestion)}
              disabled={!puedeSeleccionarHoraNuevaGestion}
              onChange={(event) =>
                handleHoraNuevaGestionChange('hour', event.target.value)
              }
            >
              <option value="">HH</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>

            <select
              className="form-input form-input--inline-field"
              value={getTimeMinute(form.horaNuevaGestion)}
              disabled={!puedeSeleccionarHoraNuevaGestion}
              onChange={(event) =>
                handleHoraNuevaGestionChange('minute', event.target.value)
              }
            >
              <option value="">MM</option>
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">Usuario:</label>

            <input
              type="text"
              className="form-input form-input--inline-field"
              value={usuarioActual}
              readOnly
              disabled
            />
          </div>

          <button
            className="btn btn-primary btn-xs agendar-btn"
            type="button"
            onClick={handleAgendar}
          >
            Agendar
          </button>
        </div>

        <div className="fecha-gestion-row fecha-gestion-row--compact fecha-gestion-row--inline">
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Fecha de Gestión:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaGestion}
              onChange={handleFechaGestionChange}
            />
          </div>

          <div className="form-row-inline form-row-inline--time">
            <label className="form-label form-label--inline">Hora:</label>

            <select
              className="form-input form-input--inline-field"
              value={getTimeHour(form.horaGestion)}
              disabled={!puedeSeleccionarHoraGestion}
              onChange={(event) =>
                handleHoraGestionChange('hour', event.target.value)
              }
            >
              <option value="">HH</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>

            <select
              className="form-input form-input--inline-field"
              value={getTimeMinute(form.horaGestion)}
              disabled={!puedeSeleccionarHoraGestion}
              onChange={(event) =>
                handleHoraGestionChange('minute', event.target.value)
              }
            >
              <option value="">MM</option>
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaGestionAccionesTomar;