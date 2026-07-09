import React, { useMemo } from 'react';
import { SelectField } from '@shared/components/ui';
import type { FichaGestionDatosPrincipalesProps } from '../types/fichaGestion.types';
import { useGestorSelectorPopup } from '../hooks/useGestorSelectorPopup';

const FichaGestionDatosPrincipales: React.FC<
  FichaGestionDatosPrincipalesProps
> = ({  idCliente,
  form,
  setField,
  handleNP0Change,
  handleNP1Change,
  handleOpenWhatsApp,
  estadosOptions,
  isLoadingEstados,
  errorEstados,
  tiposOptions,
  isLoadingTipos,
  errorTipos,
  np0Options,
  isLoadingNP0,
  errorNP0,
  np1Options,
  isLoadingNP1,
  errorNP1,
  np2Options,
  isLoadingNP2,
  errorNP2,
}) => {
  const np1Placeholder = useMemo(() => {
    if (!form.np0) return 'Primero seleccione NP0';
    if (isLoadingNP1) return 'Cargando NP1...';

    return 'Seleccionar NP1...';
  }, [form.np0, isLoadingNP1]);

  const np2Placeholder = useMemo(() => {
    if (!form.np1) return 'Primero seleccione NP1';
    if (isLoadingNP2) return 'Cargando NP2...';

    return 'Seleccionar NP2...';
  }, [form.np1, isLoadingNP2]);

  const { handleOpenListaGestores } = useGestorSelectorPopup({
    idCliente,
    setField,
  });

  const handleNombreContactoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setField('nombreContacto', event.target.value);
  };

  const handleCargoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setField('cargo', event.target.value);
  };

  const handleNP2Change = (value: string) => {
    setField('np2', value);
  };

  const handleEstadoGestionChange = (value: string) => {
    setField('estadoGestion', value);
  };

  const handleTipoGestionChange = (value: string) => {
    setField('tipoGestion', value);
  };

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">DATOS PRINCIPALES</div>
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
              onChange={handleNombreContactoChange}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">Cargo:</label>
            <input
              type="text"
              className="form-input form-input--inline-field"
              placeholder="Ingresar cargo..."
              value={form.cargo}
              onChange={handleCargoChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <div className="tel-input-group tel-input-group--compact">
              <input
                type="tel"
                className="form-input"
                placeholder="Ingresar teléfono..."
                value={form.telefono}
                readOnly
              />

              <button
                type="button"
                className="btn btn-whatsapp btn-whatsapp--compact"
                onClick={handleOpenWhatsApp}
                disabled={!form.telefono}
                title="Abrir WhatsApp"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="gestion-compact-grid gestion-compact-grid--np">
          <SelectField
            label="NP0"
            options={np0Options}
            value={form.np0}
            onChange={handleNP0Change}
            placeholder={isLoadingNP0 ? 'Cargando NP0...' : 'Seleccionar NP0...'}
            disabled={isLoadingNP0}
            error={errorNP0 || ''}
          />

          <SelectField
            label="NP1"
            options={np1Options}
            value={form.np1}
            onChange={handleNP1Change}
            placeholder={np1Placeholder}
            disabled={!form.np0 || isLoadingNP1}
            error={form.np0 ? errorNP1 || '' : ''}
          />

          <SelectField
            label="NP2"
            options={np2Options}
            value={form.np2}
            onChange={handleNP2Change}
            placeholder={np2Placeholder}
            disabled={!form.np1 || isLoadingNP2}
            error={form.np1 ? errorNP2 || '' : ''}
          />
        </div>

        <div className="gestion-compact-grid gestion-compact-grid--resultado-gestor">
          <SelectField
            label="Estado de Gestión"
            options={estadosOptions}
            value={form.estadoGestion}
            onChange={handleEstadoGestionChange}
            placeholder={
              isLoadingEstados ? 'Cargando...' : 'Seleccionar estado...'
            }
            disabled={isLoadingEstados}
            error={errorEstados || ''}
          />

          <SelectField
            label="Tipo de Gestión"
            options={tiposOptions}
            value={form.tipoGestion}
            onChange={handleTipoGestionChange}
            placeholder={isLoadingTipos ? 'Cargando...' : 'Seleccionar tipo...'}
            disabled={isLoadingTipos}
            error={errorTipos || ''}
          />

          <div className="form-group gestor-field">
            <label className="form-label">Gestor</label>
            <div className="gestor-row gestor-row--compact gestor-row--inline">
              <button
                className="btn btn-info btn-xs"
                type="button"
                onClick={handleOpenListaGestores}
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
    </div>
  );
};

export default FichaGestionDatosPrincipales;