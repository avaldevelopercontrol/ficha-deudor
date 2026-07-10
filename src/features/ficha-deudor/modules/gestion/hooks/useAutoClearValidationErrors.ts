import { useEffect } from 'react';

import type {
  FichaGestionValidationErrors,
} from '../types/fichaGestion.types';

const DEFAULT_VALIDATION_DURATION_MS = 15_000;

interface UseAutoClearValidationErrorsParams {
  errors: FichaGestionValidationErrors;
  onClear: () => void;
  durationMs?: number;
}

export const useAutoClearValidationErrors = ({
  errors,
  onClear,
  durationMs = DEFAULT_VALIDATION_DURATION_MS,
}: UseAutoClearValidationErrorsParams): void => {
  const hasErrors = Object.values(errors).some(Boolean);

  useEffect(() => {
    if (!hasErrors) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClear();
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    durationMs,
    errors,
    hasErrors,
    onClear,
  ]);
};