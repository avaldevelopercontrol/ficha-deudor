import React from 'react';
import type { GestionFormClaro } from '../../hooks/useFichaGestionForm';

interface Props {
  form: GestionFormClaro;
  setField: <K extends keyof GestionFormClaro>(
    field: K,
    value: GestionFormClaro[K]
  ) => void;
  usuarioActual: string;
  handleAgendar: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0')
);

const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0')
);

const sanitizeDecimalValue = (value: string) => {
  const cleanedValue = value.replace(/[^0-9.]/g, '');
  const [integerPart, ...decimalParts] = cleanedValue.split('.');

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
};

const getTimeHour = (time: string) => {
  return time?.split(':')[0] ?? '';
};

const getTimeMinute = (time: string) => {
  return time?.split(':')[1] ?? '';
};

const buildTimeValue = (
  currentTime: string,
  type: 'hour' | 'minute',
  value: string
) => {
  const currentHour = getTimeHour(currentTime) || '00';
  const currentMinute = getTimeMinute(currentTime) || '00';

  if (type === 'hour') {
    return `${value}:${currentMinute}`;
  }

  return `${currentHour}:${value}`;
};

const FichaGestionAccionesTomar: React.FC<Props> = ({
  form,
  setField,
  usuarioActual,
  handleAgendar,
}) => {
  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion ficha-block--acciones-tomar">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">ACCIONES A TOMAR</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <div className="form-grid g3 form-grid--inline" style={{ marginBottom: '6px' }}>
          <div className="form-row-inline">
            <label className="form-label form-label--inline">Fecha Compromiso:</label>
            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaCompromisoPago}
              onChange={(e) => setField('fechaCompromisoPago', e.target.value)}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">Compromiso S/.:</label>
            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoSoles}
              onChange={(e) =>
                setField('compromisoSoles', sanitizeDecimalValue(e.target.value))
              }
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">Compromiso $US:</label>
            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoUSD}
              onChange={(e) =>
                setField('compromisoUSD', sanitizeDecimalValue(e.target.value))
              }
            />
          </div>
        </div>

        <div
          className="agendar-gestion-row agendar-gestion-row--compact agendar-gestion-row--inline"
          style={{ marginBottom: '6px' }}
        >
          <div className="form-row-inline">
            <label className="form-label form-label--inline">Fecha Nueva Gestión:</label>
            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaNuevaGestion}
              onChange={(e) => setField('fechaNuevaGestion', e.target.value)}
            />
          </div>

          <div className="form-row-inline form-row-inline--time">
            <label className="form-label form-label--inline">Hora:</label>
            <select
              className="form-input form-input--inline-field"
              value={getTimeHour(form.horaNuevaGestion)}
              onChange={(e) =>
                setField(
                  'horaNuevaGestion',
                  buildTimeValue(form.horaNuevaGestion, 'hour', e.target.value)
                )
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
              onChange={(e) =>
                setField(
                  'horaNuevaGestion',
                  buildTimeValue(form.horaNuevaGestion, 'minute', e.target.value)
                )
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
            <label className="form-label form-label--inline">Fecha de Gestión:</label>
            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaGestion}
              onChange={(e) => setField('fechaGestion', e.target.value)}
            />
          </div>

          <div className="form-row-inline form-row-inline--time">
            <label className="form-label form-label--inline">Hora:</label>
            <select
              className="form-input form-input--inline-field"
              value={getTimeHour(form.horaGestion)}
              onChange={(e) =>
                setField(
                  'horaGestion',
                  buildTimeValue(form.horaGestion, 'hour', e.target.value)
                )
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
              onChange={(e) =>
                setField(
                  'horaGestion',
                  buildTimeValue(form.horaGestion, 'minute', e.target.value)
                )
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