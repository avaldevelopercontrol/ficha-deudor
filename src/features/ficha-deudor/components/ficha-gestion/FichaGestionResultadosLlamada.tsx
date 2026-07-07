import React, { useMemo } from 'react';

import {
  SelectField,
  TextAreaField,
  CheckboxField,
  FeedbackMessage,
} from '../../../../shared/components/ui';
import type { SelectOption } from '../../../../shared/types';
import type {
  GestionFeedback,
  GestionFormClaro,
  SetGestionField,
} from '../../types/fichaGestion.types';
import {
  getFichaGestionErrorMessages,
  type FichaGestionValidationErrors,
} from '../../validations/fichaGestionValidation';

interface Props {
  form: GestionFormClaro;
  setField: SetGestionField;
  validationErrors?: FichaGestionValidationErrors;
  feedback?: GestionFeedback | null;
  onCloseFeedback?: () => void;
  mostrarCamposClaro: boolean;
  estadoGestionClaroOptions: SelectOption[];
  isLoadingEstadoGestionClaro: boolean;
  errorEstadoGestionClaro?: string | null;
  motivoNoPagoOptions: SelectOption[];
  isLoadingMotivoNoPago: boolean;
  errorMotivoNoPago?: string | null;
  handleGuardar: () => void;
  isSaving?: boolean;
}

const FichaGestionResultadosLlamada: React.FC<Props> = ({
  form,
  setField,
  validationErrors = {},
  feedback,
  onCloseFeedback,
  mostrarCamposClaro,
  estadoGestionClaroOptions,
  isLoadingEstadoGestionClaro,
  errorEstadoGestionClaro,
  motivoNoPagoOptions,
  isLoadingMotivoNoPago,
  errorMotivoNoPago,
  handleGuardar,
  isSaving = false,
}) => {
  const validationErrorMessages = useMemo(
    () => getFichaGestionErrorMessages(validationErrors),
    [validationErrors]
  );

  const estadoGestionClaroPlaceholder = isLoadingEstadoGestionClaro
    ? 'Cargando Estado Gestión Claro...'
    : 'Seleccionar Estado Gestión Claro...';

  const motivoNoPagoPlaceholder = isLoadingMotivoNoPago
    ? 'Cargando Motivo No Pago...'
    : 'Seleccionar Motivo No Pago...';

  const handleGestionTerminadaChange = (value: boolean) => {
    setField('gestionTerminada', value);
  };

  const handleObservacionesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setField('observaciones', event.target.value);
  };

  const handleEstadoGestionClaroChange = (value: string) => {
    setField('estadoGestionClaro', value);
  };

  const handleMotivoNoPagoChange = (value: string) => {
    setField('motivoNoPago', value);
  };

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">RESULTADOS DE LA LLAMADA</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <div className="resultados-compact-main">
          <CheckboxField
            label="Gestión Terminada"
            checked={form.gestionTerminada}
            onChange={handleGestionTerminadaChange}
          />

          <TextAreaField
            label="Observaciones"
            placeholder="Ingresar observaciones..."
            value={form.observaciones}
            onChange={handleObservacionesChange}
            rows={1}
          />
        </div>

        {mostrarCamposClaro && (
          <div className="gestion-compact-grid gestion-compact-grid--claro-resultados">
            <SelectField
              label="Estado Gestión Claro:"
              options={estadoGestionClaroOptions}
              value={form.estadoGestionClaro}
              onChange={handleEstadoGestionClaroChange}
              placeholder={estadoGestionClaroPlaceholder}
              disabled={isLoadingEstadoGestionClaro}
              error={errorEstadoGestionClaro || ''}
            />

            <SelectField
              label="Motivo No Pago:"
              options={motivoNoPagoOptions}
              value={form.motivoNoPago}
              onChange={handleMotivoNoPagoChange}
              placeholder={motivoNoPagoPlaceholder}
              disabled={isLoadingMotivoNoPago}
              error={errorMotivoNoPago || ''}
            />
          </div>
        )}

        {validationErrorMessages.length > 0 && (
          <div className="form-error-summary form-error-summary--compact">
            <p>Por favor, corrija los siguientes errores:</p>
            <ul>
              {validationErrorMessages.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback && (
          <FeedbackMessage
            variant={feedback.variant}
            title={feedback.title}
            message={feedback.message}
            onClose={onCloseFeedback}
          />
        )}

        <div className="ficha-submit ficha-submit--compact ficha-submit--compact-gestion">
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={handleGuardar}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Gestión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaGestionResultadosLlamada;