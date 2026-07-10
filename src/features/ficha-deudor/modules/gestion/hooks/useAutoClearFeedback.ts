import { useEffect } from 'react';

import type {
  GestionFeedback,
} from '../types/fichaGestion.types';

const DEFAULT_SUCCESS_DURATION_MS = 15_000;

interface UseAutoClearFeedbackParams {
  feedback: GestionFeedback | null;
  onClear: () => void;
  durationMs?: number;
}

export const useAutoClearFeedback = ({
  feedback,
  onClear,
  durationMs = DEFAULT_SUCCESS_DURATION_MS,
}: UseAutoClearFeedbackParams): void => {
  useEffect(() => {
    if (
      !feedback ||
      feedback.variant !== 'success'
    ) {
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
    feedback,
    onClear,
  ]);
};