import React from 'react';

import { FeedbackMessage } from '@shared/components/ui';
import type { FichaGestionResultadosLlamadaProps } from '../../types/fichaGestion.types';

type Props = Pick<
  FichaGestionResultadosLlamadaProps,
  'feedback' | 'onCloseFeedback' | 'handleGuardar' | 'isSaving'
>;

const FichaGestionSubmitSection: React.FC<Props> = ({
  feedback,
  onCloseFeedback,
  handleGuardar,
  isSaving = false,
}) => {
  return (
    <>
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
    </>
  );
};

export default FichaGestionSubmitSection;