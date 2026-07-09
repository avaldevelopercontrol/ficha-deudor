import React, { useMemo } from 'react';

import type { FichaGestionValidationErrors } from '../../types/fichaGestion.types';
import { getFichaGestionErrorMessages } from '../../validations/fichaGestionValidation';

interface Props {
  validationErrors?: FichaGestionValidationErrors;
}

const FichaGestionValidationSummary: React.FC<Props> = ({
  validationErrors = {},
}) => {
  const validationErrorMessages = useMemo(
    () => getFichaGestionErrorMessages(validationErrors),
    [validationErrors]
  );

  if (validationErrorMessages.length === 0) return null;

  return (
    <div className="form-error-summary form-error-summary--compact">
      <p>Por favor, corrija los siguientes errores:</p>

      <ul>
        {validationErrorMessages.map((error, index) => (
          <li key={`${error}-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default FichaGestionValidationSummary;