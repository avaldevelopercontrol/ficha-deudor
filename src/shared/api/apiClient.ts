import { env } from "../../app/config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type MockFn<T> = () => T | Promise<T>;

interface ApiRequestOptions<T = unknown> {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  mock?: MockFn<T>;
  useMock?: boolean;
}

interface ApiFileRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface ApiFileResult {
  blob: Blob;
  fileName: string | null;
  contentType: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(errorData: unknown): string {
  if (isRecord(errorData)) {
    const message = errorData.message;
    const messageUser = errorData.messageUser;
    const title = errorData.title;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof messageUser === "string" && messageUser.trim()) {
      return messageUser;
    }

    if (typeof title === "string" && title.trim()) {
      return title;
    }
  }

  if (typeof errorData === "string" && errorData.trim()) {
    return errorData;
  }

  return "Ocurrió un error al procesar la solicitud.";
}

async function parseResponseData(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function normalizeApiError(response: Response): Promise<ApiError> {
  const errorData = await parseResponseData(response);
  const message = getErrorMessage(errorData);

  return new ApiError(message, response.status, errorData);
}

const getFileNameFromContentDisposition = (
  contentDisposition: string | null
): string | null => {
  if (!contentDisposition) {
    return null;
  }

  const encodedFileNameMatch = contentDisposition.match(
    /filename\*\s*=\s*UTF-8''([^;]+)/i
  );

  if (encodedFileNameMatch?.[1]) {
    const encodedFileName = encodedFileNameMatch[1]
      .trim()
      .replace(/^"(.*)"$/, '$1');

    try {
      return decodeURIComponent(encodedFileName);
    } catch {
      return encodedFileName;
    }
  }

  const regularFileNameMatch = contentDisposition.match(
    /filename\s*=\s*"?([^";]+)"?/i
  );

  return regularFileNameMatch?.[1]?.trim() ?? null;
};

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions<T> = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    headers = {},
    mock,
    useMock = env.useMocks,
  } = options;

  if (useMock && mock) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return await mock();
  }

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    method,
    signal,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw await normalizeApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponseData(response);
  return data as T;
}

export async function apiFileClient(
  endpoint: string,
  options: ApiFileRequestOptions = {}
): Promise<ApiFileResult> {
  const {
    signal,
    headers = {},
  } = options;

  const response = await fetch(
    `${env.apiBaseUrl}${endpoint}`,
    {
      method: 'GET',
      signal,
      headers: {
        Accept: 'application/octet-stream',
        ...headers,
      },
    }
  );

  if (!response.ok) {
    throw await normalizeApiError(response);
  }

  const contentType =
    response.headers.get('content-type') ?? '';

  /*
   * Algunos servicios pueden responder JSON aun cuando
   * la petición haya terminado con HTTP 200.
   */
  if (contentType.includes('application/json')) {
    const responseData = await response.json();

    throw new ApiError(
      getErrorMessage(responseData),
      response.status,
      responseData
    );
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error(
      'El servidor generó un archivo vacío.'
    );
  }

  return {
    blob,
    fileName: getFileNameFromContentDisposition(
      response.headers.get('content-disposition')
    ),
    contentType,
  };
}