import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  buildOperationSuccessFeedback,
  type BuildOperationSuccessFeedbackParams,
  type OperationFeedback,
} from '../feedback/operationFeedback';

export const DEFAULT_OPERATION_SUCCESS_DURATION_MS = 5_000;

interface UseOperationFeedbackOptions {
  successDurationMs?: number;
}

export const useOperationFeedback = ({
  successDurationMs = DEFAULT_OPERATION_SUCCESS_DURATION_MS,
}: UseOperationFeedbackOptions = {}) => {
  const [feedback, setFeedback] =
    useState<OperationFeedback | null>(null);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const showSuccess = useCallback(
    (params: BuildOperationSuccessFeedbackParams) => {
      setFeedback(
        buildOperationSuccessFeedback(params)
      );
    },
    []
  );

  const showFeedback = useCallback(
    (nextFeedback: OperationFeedback) => {
      setFeedback(nextFeedback);
    },
    []
  );

  useEffect(() => {
    if (
      !feedback ||
      feedback.variant !== 'success'
    ) {
      return;
    }

    const timeoutId = window.setTimeout(
      clearFeedback,
      successDurationMs
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    clearFeedback,
    feedback,
    successDurationMs,
  ]);

  return {
    feedback,
    clearFeedback,
    showSuccess,
    showFeedback,
  };
};
