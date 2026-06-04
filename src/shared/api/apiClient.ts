import { env } from "../../app/config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type MockFn<T> = () => T | Promise<T>;

interface ApiRequestOptions<T = unknown> {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  mock?: MockFn<T>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

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
  } = options;

  // =====================
  // MODO MOCK
  // =====================
  if (env.useMocks && mock) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return await mock();
  }

  // =====================
  // FETCH REAL
  // =====================
  const response = await fetch(`${env.apiBaseUrl}${endpoint}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => undefined);

    throw new ApiError(
      "Ocurrió un error al procesar la solicitud.",
      response.status,
      errorData,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}