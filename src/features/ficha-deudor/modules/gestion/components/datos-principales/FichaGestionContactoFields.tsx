import React from 'react';

import { ActionButton } from '@shared/components/ui';

interface Props {
  nombreContacto: string;
  cargo: string;
  telefono: string;
  isTelefonoSearchDisabled: boolean;
  onNombreContactoChange: (value: string) => void;
  onCargoChange: (value: string) => void;
  onClearTelefono: () => void;
  onOpenTelefonoSearch: () => void;
}

const FichaGestionContactoFields: React.FC<Props> = ({
  nombreContacto,
  cargo,
  telefono,
  isTelefonoSearchDisabled,
  onNombreContactoChange,
  onCargoChange,
  onClearTelefono,
  onOpenTelefonoSearch,
}) => (
  <div className="gestion-compact-grid gestion-compact-grid--datos-contacto">
    <div className="form-row-inline">
      <label className="form-label form-label--inline">
        Nombre Contacto:
      </label>

      <input
        type="text"
        className="form-input form-input--inline-field"
        placeholder="Ingresar nombre..."
        value={nombreContacto}
        onChange={(event) => onNombreContactoChange(event.target.value)}
      />
    </div>

    <div className="form-row-inline">
      <label className="form-label form-label--inline">
        Cargo:
      </label>

      <input
        type="text"
        className="form-input form-input--inline-field"
        placeholder="Ingresar cargo..."
        value={cargo}
        onChange={(event) => onCargoChange(event.target.value)}
      />
    </div>

    <div className="form-group">
      <label className="form-label">Teléfono</label>

      <div className="tel-input-group tel-input-group--compact">
        <input
          type="tel"
          className="form-input"
          placeholder="Seleccione o busque un teléfono..."
          value={telefono}
          readOnly
        />

        <ActionButton
          label="Limpiar"
          variant="secondary"
          size="xs"
          ariaLabel="Limpiar teléfono seleccionado"
          title="Limpiar teléfono seleccionado"
          disabled={!telefono}
          onClick={onClearTelefono}
        />

        <ActionButton
          label="Buscar"
          variant="info"
          size="xs"
          ariaLabel="Buscar teléfono del deudor"
          title="Buscar teléfono del deudor"
          disabled={isTelefonoSearchDisabled}
          onClick={onOpenTelefonoSearch}
        />
      </div>
    </div>
  </div>
);

export default FichaGestionContactoFields;
