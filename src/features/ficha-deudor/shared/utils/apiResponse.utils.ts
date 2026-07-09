interface ApiResponseStatus {
  statusCode: number;
  message?: string;
  messageUser?: string;
}

export const assertApiSuccess = (
  result: ApiResponseStatus,
  fallbackMessage: string
) => {
  if (result.statusCode !== 200) {
    throw new Error(result.messageUser || result.message || fallbackMessage);
  }
};

