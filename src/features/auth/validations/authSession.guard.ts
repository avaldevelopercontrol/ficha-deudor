import { toRequiredId } from '@shared/utils/number.utils';

import {
  AUTH_STORAGE_TIMING,
  AUTH_STORAGE_VERSION,
} from '../constants/authStorage.constants';
import type { AuthState, Cliente, Usuario } from '../types';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const hasOwn = (
  value: Record<string, unknown>,
  property: string
): boolean => Object.prototype.hasOwnProperty.call(value, property);

const normalizeRequiredText = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  return value.trim();
};

const normalizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  return value.trim();
};

const normalizeOptionalProfileId = (
  value: unknown
): number | null | undefined => {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    return undefined;
  }

  return value;
};

export const normalizeStoredUsuario = (
  value: unknown
): Usuario | null => {
  if (!isRecord(value)) {
    return null;
  }

  try {
    const nombre = normalizeOptionalText(value.nombre);
    const apellido = normalizeOptionalText(value.apellido);
    const username = normalizeRequiredText(value.username);
    const email = normalizeOptionalText(value.email);
    const perfil = normalizeRequiredText(value.perfil);
    const perfilId = normalizeOptionalProfileId(value.perfilId);

    if (
      nombre === null ||
      apellido === null ||
      !username ||
      email === null ||
      !perfil ||
      perfilId === undefined
    ) {
      return null;
    }

    return {
      id_usuario: String(toRequiredId(value.id_usuario, 'id_usuario')),
      nombre,
      apellido,
      username,
      email,
      perfil,
      perfilId,
    };
  } catch {
    return null;
  }
};

export const normalizeStoredCliente = (
  value: unknown
): Cliente | null => {
  if (!isRecord(value)) {
    return null;
  }

  try {
    const nombre = normalizeOptionalText(value.nombre);

    if (!nombre) {
      return null;
    }

    return {
      id_cliente: String(toRequiredId(value.id_cliente, 'id_cliente')),
      id_grupo: toRequiredId(value.id_grupo, 'id_grupo'),
      nombre,
    };
  } catch {
    return null;
  }
};

export interface ParsedStoredAuthSession {
  state: AuthState;
  format: 'versioned' | 'legacy';
}

const buildAuthState = (
  usuario: Usuario,
  clienteSeleccionada: Cliente | null
): AuthState => ({
  isAuthenticated: true,
  usuario,
  clienteSeleccionada,
  isLoading: false,
  error: null,
});

const normalizeSessionPayload = (
  value: Record<string, unknown>
): AuthState | null => {
  const usuario = normalizeStoredUsuario(value.usuario);

  if (!usuario) {
    return null;
  }

  const clienteValue = value.clienteSeleccionada;

  if (clienteValue === null || clienteValue === undefined) {
    return buildAuthState(usuario, null);
  }

  const clienteSeleccionada = normalizeStoredCliente(clienteValue);

  if (!clienteSeleccionada) {
    return null;
  }

  return buildAuthState(usuario, clienteSeleccionada);
};

export const parseStoredAuthSession = (
  rawState: string | null,
  now = Date.now()
): ParsedStoredAuthSession | null => {
  if (!rawState) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawState) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    if (hasOwn(parsed, 'version')) {
      if (
        parsed.version !== AUTH_STORAGE_VERSION ||
        typeof parsed.savedAt !== 'number' ||
        !Number.isSafeInteger(parsed.savedAt) ||
        parsed.savedAt <= 0 ||
        parsed.savedAt > now + AUTH_STORAGE_TIMING.MAX_FUTURE_SKEW_MS ||
        !hasOwn(parsed, 'usuario') ||
        !hasOwn(parsed, 'clienteSeleccionada')
      ) {
        return null;
      }

      const state = normalizeSessionPayload(parsed);

      return state
        ? {
            state,
            format: 'versioned',
          }
        : null;
    }

    const state = normalizeSessionPayload(parsed);

    return state
      ? {
          state,
          format: 'legacy',
        }
      : null;
  } catch {
    return null;
  }
};

export const buildStoredAuthSession = (
  state: AuthState,
  savedAt = Date.now()
): Record<string, unknown> | null => {
  if (!Number.isSafeInteger(savedAt) || savedAt <= 0) {
    return null;
  }

  const usuario = normalizeStoredUsuario(state.usuario);

  if (!usuario) {
    return null;
  }

  let clienteSeleccionada: Cliente | null = null;

  if (state.clienteSeleccionada !== null) {
    clienteSeleccionada = normalizeStoredCliente(state.clienteSeleccionada);

    if (!clienteSeleccionada) {
      return null;
    }
  }

  return {
    version: AUTH_STORAGE_VERSION,
    savedAt,
    usuario,
    clienteSeleccionada,
  };
};
