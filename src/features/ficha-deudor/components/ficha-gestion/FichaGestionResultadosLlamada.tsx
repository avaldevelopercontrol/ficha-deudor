import React from 'react';

import {
  SelectField,
  TextAreaField,
  CheckboxField,
  FeedbackMessage,
  type FeedbackMessageVariant,
} from '../../../../shared/components/ui';
import type { SelectOption } from '../../../../shared/types';
import type { GestionFormClaro } from '../../hooks/useFichaGestionForm';
import {
  getFichaGestionErrorMessages,
  type FichaGestionValidationErrors,
} from '../../validations/fichaGestionValidation';

interface GestionFeedback {
  variant: FeedbackMessageVariant;
  title: string;
  message: string;
}

interface Props {
  form: GestionFormClaro;
  setField: <K extends keyof GestionFormClaro>(
    field: K,
    value: GestionFormClaro[K]
  ) => void;
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
  resetForm: () => void;
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
  const validationErrorMessages = getFichaGestionErrorMessages(validationErrors);

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
            onChange={(val) => setField('gestionTerminada', val)}
          />

          <TextAreaField
            label="Observaciones"
            placeholder="Ingresar observaciones..."
            value={form.observaciones}
            onChange={(e) => setField('observaciones', e.target.value)}
            rows={1}
          />
        </div>

        {mostrarCamposClaro && (
          <div className="gestion-compact-grid gestion-compact-grid--claro-resultados">
            <SelectField
              label="Estado Gestión Claro:"
              options={estadoGestionClaroOptions}
              value={form.estadoGestionClaro}
              onChange={(val) => setField('estadoGestionClaro', val)}
              placeholder={
                isLoadingEstadoGestionClaro
                  ? 'Cargando Estado Gestión Claro...'
                  : 'Seleccionar Estado Gestión Claro...'
              }
              disabled={isLoadingEstadoGestionClaro}
              error={errorEstadoGestionClaro || ''}
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