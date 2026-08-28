import React from 'react';

import { useGestorSelectorPopup } from '../hooks/useGestorSelectorPopup';
import type { FichaGestionDatosPrincipalesProps } from '../types/fichaGestionViewModel.types';

import FichaGestionContactoFields from './datos-principales/FichaGestionContactoFields';
import FichaGestionEstadoGestorFields from './datos-principales/FichaGestionEstadoGestorFields';
import FichaGestionPaletaFields from './datos-principales/FichaGestionPaletaFields';
import FichaGestionValidationSummary from './shared/FichaGestionValidationSummary';
import ModalBuscarTelefonoDeudor from './ModalBuscarTelefonoDeudor';

const FichaGestionDatosPrincipales: React.FC<
  FichaGestionDatosPrincipalesProps
> = ({
  idCliente,
  form,
  setField,
  handleNP0Change,
  handleNP1Change,
  telefonoSearch,
  catalogos,
}) => {
  const { handleOpenListaGestores } = useGestorSelectorPopup({
    idCliente,
    setField,
  });

  const {
    isOpen: isTelefonoSearchOpen,
    telefonoIngresado,
    validationErrors: telefonoValidationErrors,
    isSearchDisabled: isTelefonoSearchDisabled,
    handleOpen: handleOpenTelefonoSearch,
    handleClose: handleCloseTelefonoSearch,
    handleTelefonoChange,
    handleValidate: handleValidateTelefono,
    handleClear: handleClearTelefonoSearch,
  } = telefonoSearch;

  const handleClearTelefono = () => {
    setField('telefono', '');
    handleClearTelefonoSearch();
  };

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">DATOS PRINCIPALES</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <FichaGestionContactoFields
          nombreContacto={form.nombreContacto}
          cargo={form.cargo}
          telefono={form.telefono}
          isTelefonoSearchDisabled={isTelefonoSearchDisabled}
          onNombreContactoChange={(value) => setField('nombreContacto', value)}
          onCargoChange={(value) => setField('cargo', value)}
          onClearTelefono={handleClearTelefono}
          onOpenTelefonoSearch={handleOpenTelefonoSearch}
        />

        <FichaGestionValidationSummary
          validationErrors={telefonoValidationErrors}
        />

        <FichaGestionPaletaFields
          np0={form.np0}
          np1={form.np1}
          np2={form.np2}
          catalogos={catalogos}
          onNP0Change={handleNP0Change}
          onNP1Change={handleNP1Change}
          onNP2Change={(value) => setField('np2', value)}
        />

        <FichaGestionEstadoGestorFields
          idCliente={idCliente}
          estadoGestion={form.estadoGestion}
          tipoGestion={form.tipoGestion}
          gestorId={form.gestorId}
          gestorNombre={form.gestorNombre}
          catalogos={catalogos}
          onEstadoGestionChange={(value) => setField('estadoGestion', value)}
          onTipoGestionChange={(value) => setField('tipoGestion', value)}
          onOpenListaGestores={handleOpenListaGestores}
        />
      </div>

      <ModalBuscarTelefonoDeudor
        isOpen={isTelefonoSearchOpen}
        telefonoIngresado={telefonoIngresado}
        onTelefonoChange={handleTelefonoChange}
        onClose={handleCloseTelefonoSearch}
        onValidate={handleValidateTelefono}
      />
    </div>
  );
};

export default FichaGestionDatosPrincipales;
