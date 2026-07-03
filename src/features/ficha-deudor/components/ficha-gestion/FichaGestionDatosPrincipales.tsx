import React from 'react';
import { SelectField } from '../../../../shared/components/ui';
import type { SelectOption } from '../../../../shared/types';
import type { GestionFormClaro } from '../../hooks/useFichaGestionForm';
import type { FichaGestionValidationErrors } from '../../validations/fichaGestionValidation';

interface Props {
  form: GestionFormClaro;
  setField: <K extends keyof GestionFormClaro>(
    field: K,
    value: GestionFormClaro[K]
  ) => void;
  validationErrors?: FichaGestionValidationErrors;
  handleNP0Change: (value: string) => void;
  handleNP1Change: (value: string) => void;
  handleOpenWhatsApp: () => void;

  estadosOptions: SelectOption[];
  isLoadingEstados: boolean;
  errorEstados?: string | null;

  tiposOptions: SelectOption[];
  isLoadingTipos: boolean;
  errorTipos?: string | null;

  np0Options: SelectOption[];
  isLoadingNP0: boolean;
  errorNP0?: string | null;

  np1Options: SelectOption[];
  isLoadingNP1: boolean;
  errorNP1?: string | null;

  np2Options: SelectOption[];
  isLoadingNP2: boolean;
  errorNP2?: string | null;
}

const FichaGestionDatosPrincipales: React.FC<Props> = ({
  form,
  setField,
  validationErrors = {},
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
  return (
    <div className="ficha-block ficha-block--with-side-title" style={{ minHeight: 'auto' }}>
      <div className="block-side-title-wrapper">
        <div className="block-side-title">DATOS PRINCIPALES</div>
      </div>

      <div className="block-content">
        <div className="form-grid g2 form-grid--inline" style={{ marginBottom: '12px' }}>
          <div className="form-row-inline">
            <label className="form-label form-label--inline">Nombre Contacto:</label>
            <input
              type="text"
              className="form-input form-input--inline-field"
              placeholder="Ingresar nombre..."
              value={form.nombreContacto}
              onChange={(e) => setField('nombreContacto', e.target.value)}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">Cargo:</label>
            <input
              type="text"
              className="form-input form-input--inline-field"
              placeholder="Ingresar cargo..."
              value={form.cargo}
              onChange={(e) => setField('cargo', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid g3" style={{ marginBottom: '12px' }}>
          <SelectField
            label="NP0"
            options={np0Options}
            value={form.np0}
            onChange={handleNP0Change}
            placeholder={isLoadingNP0 ? 'Cargando NP0...' : 'Seleccionar NP0...'}
            disabled={isLoadingNP0}
            error={validationErrors.np0 || errorNP0 || ''}
          />

          <SelectField
            label="NP1"
            options={np1Options}
            value={form.np1}
            onChange={handleNP1Change}
            placeholder={
              !form.np0
                ? 'Primero seleccione NP0'
                : isLoadingNP1
                  ? 'Cargando NP1...'
                  : 'Seleccionar NP1...'
            }
            disabled={!form.np0 || isLoadingNP1}
            error={validationErrors.np1 || (form.np0 ? errorNP1 || '' : '')}
          />

          <SelectField
            label="NP2"
            options={np2Options}
            value={form.np2}
            onChange={(val) => setField('np2', val)}
            placeholder={
              !form.np1
                ? 'Primero seleccione NP1'
                : isLoadingNP2
                  ? 'Cargando NP2...'
                  : 'Seleccionar NP2...'
            }
            disabled={!form.np1 || isLoadingNP2}
            error={form.np1 ? errorNP2 || '' : ''}
          />
        </div>

        <div className="form-grid g3" style={{ marginBottom: '12px' }}>
          <SelectField
            label="Estado de Gestión"
            options={estadosOptions}
            value={form.estadoGestion}
            onChange={(val) => setField('estadoGestion', val)}
            placeholder={isLoadingEstados ? 'Cargando...' : 'Seleccionar estado...'}
            disabled={isLoadingEstados}
            error={validationErrors.estadoGestion || errorEstados || ''}
          />

          <SelectField
            label="Tipo de Gestión"
            options={tiposOptions}
            value={form.tipoGestion}
            onChange={(val) => setField('tipoGestion', val)}
            placeholder={isLoadingTipos ? 'Cargando...' : 'Seleccionar tipo...'}
            disabled={isLoadingTipos}
            error={validationErrors.tipoGestion || errorTipos || ''}
          />

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <div className="tel-input-group">
              <input
                type="tel"
                className="form-input"
                placeholder="Seleccione un teléfono..."
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

            {validationErrors.telefono && (
              <span className="form-error">
                {validationErrors.telefono}
              </span>
            )}
          </div>
        </div>

        <div className="gestor-row gestor-row--compact">
          <button className="btn btn-info btn-xs" type="button">
            🔍 Buscar Gestor
          </button>

          <input
            type="text"
            className="form-input form-input--xs"
            placeholder="ID Gestor"
            value={form.gestorId}
            onChange={(e) => setField('gestorId', e.target.value)}
            readOnly
            style={{ width: '70px' }}
          />

          <input
            type="text"
            className="form-input form-input--xs"
            placeholder="Nombre del gestor"
            value={form.gestorNombre}
            onChange={(e) => setField('gestorNombre', e.target.value)}
            readOnly
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default FichaGestionDatosPrincipales;