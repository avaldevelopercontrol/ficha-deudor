import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';

interface Props {
  isOpen: boolean;
  telefonoIngresado: string;
  onTelefonoChange: (value: string) => void;
  onClose: () => void;
  onValidate: () => void;
}

const ModalBuscarTelefonoDeudor: React.FC<Props> = ({
  isOpen,
  telefonoIngresado,
  onTelefonoChange,
  onClose,
  onValidate,
}) => {
  const handleTelefonoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onTelefonoChange(event.target.value);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onValidate();
  };

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title="BUSCAR TELÉFONO DEL DEUDOR"
      onClose={onClose}
      submitLabel="Validar teléfono"
      onSubmit={onValidate}
      size="sm"
      minHeight="150px"
      showDeudorHeader={false}
    >
      <div className="form-group">
        <label
          className="form-label"
          htmlFor="telefono-deudor-busqueda"
        >
          Teléfono del deudor
        </label>

        <input
          id="telefono-deudor-busqueda"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          className="form-input"
          placeholder="Ej.: 982228610 o +51 982 228 610"
          value={telefonoIngresado}
          onChange={handleTelefonoChange}
          onKeyDown={handleKeyDown}
        />

        <small className="telefono-search-modal__help">
          Puede ingresar el número con espacios, guiones o
          con el código +51.
        </small>
      </div>
    </ModalFormLayout>
  );
};

export default ModalBuscarTelefonoDeudor;