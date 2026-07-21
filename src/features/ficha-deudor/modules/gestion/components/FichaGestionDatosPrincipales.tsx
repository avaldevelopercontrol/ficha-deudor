import React, { useMemo } from 'react';

import {
  ActionButton,
  SelectField,
} from '@shared/components/ui';

import { useGestorSelectorPopup } from '../hooks/useGestorSelectorPopup';
import type { FichaGestionDatosPrincipalesProps } from '../types/fichaGestion.types';

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
  // handleOpenWhatsApp,
  telefonoSearch,
  catalogos,
}) => {
  const {
    estados,
    tipos,
    np0,
    np1,
    np2,
  } = catalogos;

  const {
    options: estadosOptions,
    isLoading: isLoadingEstados,
    error: errorEstados,
  } = estados;

  const {
    options: tiposOptions,
    isLoading: isLoadingTipos,
    error: errorTipos,
  } = tipos;

  const {
    options: np0Options,
    isLoading: isLoadingNP0,
    error: errorNP0,
  } = np0;

  const {
    options: np1Options,
    isLoading: isLoadingNP1,
    error: errorNP1,
  } = np1;

  const {
    options: np2Options,
    isLoading: isLoadingNP2,
    error: errorNP2,
  } = np2;
  const np1Placeholder = useMemo(() => {
    if (!form.np0) {
      return 'Primero seleccione NP0';
    }

    if (isLoadingNP1) {
      return 'Cargando NP1...';
    }

    return 'Seleccionar NP1...';
  }, [form.np0, isLoadingNP1]);

  const np2Placeholder = useMemo(() => {
    if (!form.np1) {
      return 'Primero seleccione NP1';
    }

    if (isLoadingNP2) {
      return 'Cargando NP2...';
    }

    if (np2Options.length === 0) {
      return 'Sin opciones disponibles';
    }

    return '';
  }, [
    form.np1,
    isLoadingNP2,
    np2Options.length,
  ]);

  const { handleOpenListaGestores } =
    useGestorSelectorPopup({
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

  const handleNombreContactoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setField(
      'nombreContacto',
      event.target.value
    );
  };

  const handleCargoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setField('cargo', event.target.value);
  };

  const handleNP2Change = (value: string) => {
    setField('np2', value);
  };

  const handleEstadoGestionChange = (
    value: string
  ) => {
    setField('estadoGestion', value);
  };

  const handleTipoGestionChange = (
    value: string
  ) => {
    setField('tipoGestion', value);
  };

  const handleClearTelefono = () => {
    /*
     * Limpia el valor del formulario y también el teléfono
     * seleccionado que se mantiene en el componente padre.
     */
    setField('telefono', '');
    handleClearTelefonoSearch();
  };

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">
          DATOS PRINCIPALES
        </div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <div className="gestion-compact-grid gestion-compact-grid--datos-contacto">
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Nombre Contacto:
            </label>

            <input
              type="text"
              className="form-input form-input--inline-field"
              placeholder="Ingresar nombre..."
              value={form.nombreContacto}
              onChange={
                handleNombreContactoChange
              }
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
              value={form.cargo}
              onChange={handleCargoChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Teléfono
            </label>

            <div className="tel-input-group tel-input-group--compact">
              <input
                type="tel"
                className="form-input"
                placeholder="Seleccione o busque un teléfono..."
                value={form.telefono}
                readOnly
              />

              <ActionButton
                label="Limpiar"
                variant="secondary"
                size="xs"
                ariaLabel="Limpiar teléfono seleccionado"
                title="Limpiar teléfono seleccionado"
                disabled={!form.telefono}
                onClick={handleClearTelefono}
              />

              <ActionButton
                label="Buscar"
                variant="info"
                size="xs"
                ariaLabel="Buscar teléfono del deudor"
                title="Buscar teléfono del deudor"
                disabled={
                  isTelefonoSearchDisabled
                }
                onClick={
                  handleOpenTelefonoSearch
                }
              />
            </div>
          </div>
        </div>

        <FichaGestionValidationSummary
          validationErrors={
            telefonoValidationErrors
          }
        />

        <div className="gestion-compact-grid gestion-compact-grid--np">
          <SelectField
            label="NP0"
            options={np0Options}
            value={form.np0}
            onChange={handleNP0Change}
            placeholder={
              isLoadingNP0
                ? 'Cargando NP0...'
                : 'Seleccionar NP0...'
            }
            disabled={isLoadingNP0}
            error={errorNP0 || ''}
          />

          <SelectField
            label="NP1"
            options={np1Options}
            value={form.np1}
            onChange={handleNP1Change}
            placeholder={np1Placeholder}
            disabled={
              !form.np0 || isLoadingNP1
            }
            error={
              form.np0
                ? errorNP1 || ''
                : ''
            }
          />

          <SelectField
            label="NP2"
            options={np2Options}
            value={form.np2}
            onChange={handleNP2Change}
            placeholder={np2Placeholder}
            hidePlaceholder={
              Boolean(form.np1) &&
              !isLoadingNP2 &&
              np2Options.length > 0
            }
            disabled={
              !form.np1 || isLoadingNP2
            }
            error={
              form.np1
                ? errorNP2 || ''
                : ''
            }
          />
        </div>

        <div className="gestion-compact-grid gestion-compact-grid--resultado-gestor">
          <SelectField
            label="Estado de Gestión"
            options={estadosOptions}
            value={form.estadoGestion}
            onChange={
              handleEstadoGestionChange
            }
            placeholder={
              isLoadingEstados
                ? 'Cargando...'
                : 'Seleccionar estado...'
            }
            disabled={isLoadingEstados}
            error={errorEstados || ''}
          />

          <SelectField
            label="Tipo de Gestión"
            options={tiposOptions}
            value={form.tipoGestion}
            onChange={handleTipoGestionChange}
            placeholder={
              isLoadingTipos
                ? 'Cargando...'
                : 'Seleccionar tipo...'
            }
            disabled={isLoadingTipos}
            error={errorTipos || ''}
          />

          <div className="form-group gestor-field">
            <label className="form-label">
              Gestor
            </label>

            <div className="gestor-row gestor-row--compact gestor-row--inline">
              <button
                className="btn btn-info btn-xs"
                type="button"
                onClick={
                  handleOpenListaGestores
                }
                disabled={!idCliente}
              >
                Buscar Gestor
              </button>

              <input
                type="text"
                className="form-input form-input--xs gestor-row__id"
                placeholder="ID"
                value={form.gestorId}
                readOnly
              />

              <input
                type="text"
                className="form-input form-input--xs gestor-row__name"
                placeholder="Nombre del gestor"
                value={form.gestorNombre}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <ModalBuscarTelefonoDeudor
        isOpen={isTelefonoSearchOpen}
        telefonoIngresado={
          telefonoIngresado
        }
        onTelefonoChange={
          handleTelefonoChange
        }
        onClose={
          handleCloseTelefonoSearch
        }
        onValidate={
          handleValidateTelefono
        }
      />
    </div>
  );
};

export default FichaGestionDatosPrincipales;