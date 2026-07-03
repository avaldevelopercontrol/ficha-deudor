import React from 'react';
import {
  SelectField,
  TextAreaField,
  CheckboxField,
} from '../../../../shared/components/ui';
import type { SelectOption } from '../../../../shared/types';
import type { GestionFormClaro } from '../../hooks/useFichaGestionForm';
import {
  getFichaGestionErrorMessages,
  type FichaGestionValidationErrors,
} from '../../validations/fichaGestionValidation';

interface Props {
  form: GestionFormClaro;
  setField: <K extends keyof GestionFormClaro>(
    field: K,
    value: GestionFormClaro[K]
  ) => void;
  validationErrors?: FichaGestionValidationErrors;
  mostrarCamposClaro: boolean;

  estadoGestionClaroOptions: SelectOption[];
  isLoadingEstadoGestionClaro: boolean;
  errorEstadoGestionClaro?: string | null;

  motivoNoPagoOptions: SelectOption[];
  isLoadingMotivoNoPago: boolean;
  errorMotivoNoPago?: string | null;

  resetForm: () => void;
  handleGuardar: () => void;
}

const FichaGestionResultadosLlamada: React.FC<Props> = ({
  form,
  setField,
  validationErrors = {},
  mostrarCamposClaro,

  estadoGestionClaroOptions,
  isLoadingEstadoGestionClaro,
  errorEstadoGestionClaro,

  motivoNoPagoOptions,
  isLoadingMotivoNoPago,
  errorMotivoNoPago,

  resetForm,
  handleGuardar,
}) => {
  const validationErrorMessages = getFichaGestionErrorMessages(validationErrors);

  return (
    <div className="ficha-block ficha-block--with-side-title">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">RESULTADOS DE LA LLAMADA</div>
      </div>

      <div className="block-content">
        {mostrarCamposClaro ? (
          <>
            <div className="resultados-row">
              <CheckboxField
                label="Gestión Terminada"
                checked={form.gestionTerminada}
                onChange={(val) => setField('gestionTerminada', val)}
              />

              <TextAreaField
                label="Observaciones"
                placeholder="Ingresar observaciones..."
                value={form.observaciones}
                onChange={(e) => setField('observaciones', e.target.value)}
                rows={2}
                error={validationErrors.observaciones || ''}
              />
            </div>

            <div className="form-grid g2" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <SelectField
                label="Estado Gestion Claro:"
                options={estadoGestionClaroOptions}
                value={form.estadoGestionClaro}
                onChange={(val) => setField('estadoGestionClaro', val)}
                placeholder={
                  isLoadingEstadoGestionClaro
                    ? 'Cargando Estado Gestion Claro...'
                    : 'Seleccionar Estado Gestion Claro...'
                }
                disabled={isLoadingEstadoGestionClaro}
                error={
                  validationErrors.estadoGestionClaro ||
                  errorEstadoGestionClaro ||
                  ''
                }
              />

              <SelectField
                label="Motivo No Pago:"
                options={motivoNoPagoOptions}
                value={form.motivoNoPago}
                onChange={(val) => setField('motivoNoPago', val)}
                placeholder={
                  isLoadingMotivoNoPago
                    ? 'Cargando Motivo No Pago...'
                    : 'Seleccionar Motivo No Pago...'
                }
                disabled={isLoadingMotivoNoPago}
                error={
                  validationErrors.motivoNoPago ||
                  errorMotivoNoPago ||
                  ''
                }
              />
            </div>
          </>
        ) : (
          <div className="resultados-row">
            <CheckboxField
              label="Gestión Terminada"
              checked={form.gestionTerminada}
              onChange={(val) => setField('gestionTerminada', val)}
            />

            <TextAreaField
              label="Observaciones"
              placeholder="Ingresar observaciones..."
              value={form.observaciones}
              onChange={(e) => setField('observaciones', e.target.value)}
              rows={2}
              error={validationErrors.observaciones || ''}
            />
          </div>
        )}

        {validationErrorMessages.length > 0 && (
          <div className="form-error-summary">
            <p>Por favor, corrija los siguientes errores:</p>

            <ul>
              {validationErrorMessages.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="ficha-submit ficha-submit--compact">
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={resetForm}
          >
            Limpiar
          </button>

          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={handleGuardar}
          >
            Guardar Gestión
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaGestionResultadosLlamada;