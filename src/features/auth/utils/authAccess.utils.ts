import type { AuthState } from '../types';

export type AuthAccessStatus =
  | 'anonymous'
  | 'pending-client'
  | 'authenticated';

type AuthIdentity = Pick<
  AuthState,
  'usuario' | 'clienteSeleccionada'
>;

export const resolveAuthAccessStatus = (
  identity: AuthIdentity
): AuthAccessStatus => {
  if (!identity.usuario) {
    return 'anonymous';
  }

  return identity.clienteSeleccionada
    ? 'authenticated'
    : 'pending-client';
};

export const hasAuthenticatedIdentity = (
  identity: AuthIdentity
): boolean => resolveAuthAccessStatus(identity) !== 'anonymous';

export const hasPrivateRouteAccess = (
  identity: AuthIdentity
): boolean => resolveAuthAccessStatus(identity) === 'authenticated';
