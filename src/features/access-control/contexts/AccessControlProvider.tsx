import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  fetchAccessControlData,
} from '../api/accessControlApi';

import type {
  AccessControlContextValue,
  AccessControlProviderProps,
  AccessControlSnapshot,
  AccessControlStatus,
  AccessPermissionName,
} from '../types/accessControl.types';

import {
  buildAccessControlSnapshot,
  EMPTY_ACCESS_PERMISSIONS,
} from '../utils/accessControl.utils';

import {
  AccessControlContext,
} from './accessControlContextValue';

interface AccessControlState {
  status: AccessControlStatus;
  error: string | null;
  snapshot: AccessControlSnapshot | null;
}

interface AccessControlSessionProps
  extends AccessControlProviderProps {
  profileId: number;
}

const NOOP_REFRESH = async (): Promise<void> => {
  await Promise.resolve();
};

const buildUnavailableValue = (
  status: 'idle' | 'error',
  error: string | null
): AccessControlContextValue => ({
  status,
  error,
  menuTree: [],
  navigationTree: [],
  refresh: NOOP_REFRESH,
  hasOption: () => false,
  hasPermission: () => false,
  getPermissions: () =>
    EMPTY_ACCESS_PERMISSIONS,
});

const IDLE_CONTEXT_VALUE =
  buildUnavailableValue(
    'idle',
    null
  );

const INVALID_PROFILE_CONTEXT_VALUE =
  buildUnavailableValue(
    'error',
    'El usuario autenticado no tiene un perfil válido.'
  );

function AccessControlSession({
  profileId,
  children,
}: AccessControlSessionProps) {
  const [state, setState] =
    useState<AccessControlState>({
      status: 'loading',
      error: null,
      snapshot: null,
    });

  const requestSequenceRef =
    useRef(0);

  const abortControllerRef =
    useRef<AbortController | null>(
      null
    );

  const startRequest = useCallback(
    () => {
      abortControllerRef.current
        ?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;
      requestSequenceRef.current += 1;

      return {
        controller,
        sequence:
          requestSequenceRef.current,
      };
    },
    []
  );

  const isCurrentRequest = useCallback(
    (
      controller: AbortController,
      sequence: number
    ): boolean =>
      !controller.signal.aborted &&
      sequence ===
        requestSequenceRef.current,
    []
  );

  const fetchSnapshot = useCallback(
    async (
      signal: AbortSignal
    ): Promise<AccessControlSnapshot> => {
      const data =
        await fetchAccessControlData(
          profileId,
          signal
        );

      return buildAccessControlSnapshot(
        profileId,
        data.options,
        data.assignments
      );
    },
    [profileId]
  );

  useEffect(() => {
    const {
      controller,
      sequence,
    } = startRequest();

    const runInitialLoad = async () => {
      try {
        const snapshot =
          await fetchSnapshot(
            controller.signal
          );

        if (
          !isCurrentRequest(
            controller,
            sequence
          )
        ) {
          return;
        }

        setState({
          status: 'ready',
          error: null,
          snapshot,
        });
      } catch (error) {
        if (
          !isCurrentRequest(
            controller,
            sequence
          )
        ) {
          return;
        }

        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los accesos del usuario.',
          snapshot: null,
        });
      }
    };

    void runInitialLoad();

    return () => {
      controller.abort();
    };
  }, [
    fetchSnapshot,
    isCurrentRequest,
    startRequest,
  ]);

  const refresh = useCallback(
    async (): Promise<void> => {
      const {
        controller,
        sequence,
      } = startRequest();

      setState((currentState) => ({
        status: 'loading',
        error: null,
        snapshot:
          currentState.snapshot,
      }));

      try {
        const snapshot =
          await fetchSnapshot(
            controller.signal
          );

        if (
          !isCurrentRequest(
            controller,
            sequence
          )
        ) {
          return;
        }

        setState({
          status: 'ready',
          error: null,
          snapshot,
        });
      } catch (error) {
        if (
          !isCurrentRequest(
            controller,
            sequence
          )
        ) {
          return;
        }

        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los accesos del usuario.',
          snapshot: null,
        });
      }
    },
    [
      fetchSnapshot,
      isCurrentRequest,
      startRequest,
    ]
  );

  const hasOption = useCallback(
    (optionCode: string): boolean =>
      state.snapshot
        ?.optionsByCode.has(
          optionCode.trim()
        ) ?? false,
    [state.snapshot]
  );

  const getPermissions = useCallback(
    (optionCode: string) =>
      state.snapshot
        ?.optionsByCode.get(
          optionCode.trim()
        )?.permissions ??
      EMPTY_ACCESS_PERMISSIONS,
    [state.snapshot]
  );

  const hasPermission = useCallback(
    (
      optionCode: string,
      permission: AccessPermissionName
    ): boolean =>
      getPermissions(optionCode)[
        permission
      ],
    [getPermissions]
  );

  const value = useMemo(
    () => ({
      status: state.status,
      error: state.error,
      menuTree:
        state.snapshot
          ?.menuTree ?? [],
      navigationTree:
        state.snapshot
          ?.navigationTree ?? [],
      refresh,
      hasOption,
      hasPermission,
      getPermissions,
    }),
    [
      getPermissions,
      hasOption,
      hasPermission,
      refresh,
      state.error,
      state.snapshot,
      state.status,
    ]
  );

  return (
    <AccessControlContext.Provider
      value={value}
    >
      {children}
    </AccessControlContext.Provider>
  );
}

export function AccessControlProvider({
  children,
}: AccessControlProviderProps) {
  const {
    isAuthenticated,
    usuario,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <AccessControlContext.Provider
        value={IDLE_CONTEXT_VALUE}
      >
        {children}
      </AccessControlContext.Provider>
    );
  }

  const profileId =
    usuario?.perfilId ?? null;

  if (
    profileId === null ||
    !Number.isSafeInteger(
      profileId
    ) ||
    profileId <= 0
  ) {
    return (
      <AccessControlContext.Provider
        value={
          INVALID_PROFILE_CONTEXT_VALUE
        }
      >
        {children}
      </AccessControlContext.Provider>
    );
  }

  return (
    <AccessControlSession
      key={`${usuario?.id_usuario ?? 'usuario'}:${profileId}`}
      profileId={profileId}
    >
      {children}
    </AccessControlSession>
  );
}
