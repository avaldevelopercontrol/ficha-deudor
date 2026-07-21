interface ApiResponseStatus {
  statusCode: number;
  message?: string;
  messageUser?: string;
}

const isSuccessfulStatusCode = (
  statusCode: number
): boolean => {
  return statusCode >= 200 && statusCode < 300;
};

export const assertApiSuccess = (
  result: ApiResponseStatus,
  fallbackMessage: string
): void => {
  if (
    isSuccessfulStatusCode(
      result.statusCode
    )
  ) {
    return;
  }

  throw new Error(
    result.messageUser?.trim() ||
      result.message?.trim() ||
      fallbackMessage
  );
};