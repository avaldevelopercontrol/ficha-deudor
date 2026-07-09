import React from 'react';

import type { FichaGestionResultadosLlamadaProps } from '../types/fichaGestion.types';
import FichaGestionCamposClaro from './shared/FichaGestionCamposClaro';
import FichaGestionResultadoFields from './shared/FichaGestionResultadoFields';
import FichaGestionSubmitSection from './shared/FichaGestionSubmitSection';
import FichaGestionValidationSummary from './shared/FichaGestionValidationSummary';

const FichaGestionResultadosLlamada: React.FC<
  FichaGestionResultadosLlamadaProps
> = ({  form,
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

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">RESULTADOS DE LA LLAMADA</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <FichaGestionResultadoFields form={form} setField={setField} />

        {mostrarCamposClaro && (
          <FichaGestionCamposClaro
            form={form}
            setField={setField}
            estadoGestionClaroOptions={estadoGestionClaroOptions}
            isLoadingEstadoGestionClaro={isLoadingEstadoGestionClaro}
            errorEstadoGestionClaro={errorEstadoGestionClaro}
            motivoNoPagoOptions={motivoNoPagoOptions}
            isLoadingMotivoNoPago={isLoadingMotivoNoPago}
            errorMotivoNoPago={errorMotivoNoPago}
          />
        )}

        <FichaGestionValidationSummary validationErrors={validationErrors} />

        <FichaGestionSubmitSection
          feedback={feedback}
          onCloseFeedback={onCloseFeedback}
          handleGuardar={handleGuardar}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default FichaGestionResultadosLlamada;