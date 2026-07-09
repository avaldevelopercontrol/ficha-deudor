import React from 'react';

import { getTimeHour, getTimeMinute } from '../../../../shared/utils/date.utils';

type TimePart = 'hour' | 'minute';

interface GestionTimePickerProps {
  value: string;
  disabled?: boolean;
  onChange: (type: TimePart, value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0')
);

const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, '0')
);

const GestionTimePicker: React.FC<GestionTimePickerProps> = ({
  value,
  disabled = false,
  onChange,
}) => {
  return (
    <div className="form-row-inline form-row-inline--time">
      <label className="form-label form-label--inline">Hora:</label>

      <select
        className="form-input form-input--inline-field"
        value={getTimeHour(value)}
        disabled={disabled}
        onChange={(event) => onChange('hour', event.target.value)}
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
        value={getTimeMinute(value)}
        disabled={disabled}
        onChange={(event) => onChange('minute', event.target.value)}
      >
        <option value="">MM</option>
        {MINUTES.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GestionTimePicker;