export const resolveOperationErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string =>
  error instanceof Error && error.message.trim()
    ? error.message.trim()
    : fallbackMessage;
