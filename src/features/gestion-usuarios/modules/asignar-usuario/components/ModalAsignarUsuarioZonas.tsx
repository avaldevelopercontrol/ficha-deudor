import {
  useCallback,
  useMemo,
  useState,
  type FC,
} from 'react';

import Modal from '@shared/components/modals/Modal';
import TableResourceState from '@shared/components/table/TableResourceState';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import {
  useAsyncMutation,
} from '@shared/hooks/useAsyncMutation';

import {
  dedupeUsuarioZonas,
  getUsuarioZonaDiff,
} from '../../../mappers/usuarioZonas.mapper';

import {
  useUsuarioZonasData,
} from '../hooks/useUsuarioZonasData';

import type {
  UsuarioAsignable,
} from '../types/asignarUsuario.types';

import type {
  GuardarUsuarioZonasPayload,
  UsuarioZonaItem,
} from '../types/usuarioZonas.types';

import UsuarioZonasManager from './UsuarioZonasManager';

interface ModalAsignarUsuarioZonasProps {
  isOpen: boolean;
  usuario: UsuarioAsignable;
  idCliente: number | null;
  clienteNombre?: string;
  canInsert: boolean;
  canEdit: boolean;
  onClose: () => void;
  onGuardar: (
    payload: GuardarUsuarioZonasPayload
  ) => Promise<void> | void;
}

const getErrorMessage = (
  error: unknown
): string =>
  error instanceof Error &&
  error.message.trim()
    ? error.message.trim()
    : 'No se pudieron guardar las zonas del usuario.';

export const ModalAsignarUsuarioZonas:
  FC<ModalAsignarUsuarioZonasProps> = ({
    isOpen,
    usuario,
    idCliente,
    clienteNombre,
    canInsert,
    canEdit,
    onClose,
    onGuardar,
  }) => {
    const data = useUsuarioZonasData({
      enabled:
        isOpen && idCliente !== null,
      idCliente,
      idUsuario: usuario.id,
    });

    const [
      zonasEditadas,
      setZonasEditadas,
    ] = useState<UsuarioZonaItem[] | null>(
      null
    );

    const [
      submitError,
      setSubmitError,
    ] = useState<string | null>(null);

    const {
      isPending,
      execute,
    } = useAsyncMutation();

    const zonasIniciales = useMemo(
      () =>
        dedupeUsuarioZonas(
          data.zonasAsignadas ?? []
        ),
      [data.zonasAsignadas]
    );

    const zonasActuales =
      zonasEditadas ?? zonasIniciales;

    const todasLasZonas = useMemo(
      () =>
        dedupeUsuarioZonas([
          ...(data.zonasAsignadas ?? []),
          ...(data.zonasFaltantes ?? []),
        ]),
      [
        data.zonasAsignadas,
        data.zonasFaltantes,
      ]
    );

    const zonasDisponibles = useMemo(() => {
      const assignedKeys = new Set(
        zonasActuales.map(
          (zona) => zona.zona
        )
      );

      return todasLasZonas.filter(
        (zona) =>
          !assignedKeys.has(zona.zona)
      );
    }, [
      todasLasZonas,
      zonasActuales,
    ]);

    const hasChanges = useMemo(() => {
      const diff = getUsuarioZonaDiff(
        zonasIniciales,
        zonasActuales
      );

      return (
        diff.agregar.length > 0 ||
        diff.quitar.length > 0
      );
    }, [
      zonasActuales,
      zonasIniciales,
    ]);

    const handleAgregarZona =
      useCallback(
        (zona: UsuarioZonaItem) => {
          setSubmitError(null);

          setZonasEditadas(
            (current) =>
              dedupeUsuarioZonas([
                ...(current ??
                  zonasIniciales),
                zona,
              ])
          );
        },
        [zonasIniciales]
      );

    const handleQuitarZona =
      useCallback(
        (zona: UsuarioZonaItem) => {
          setSubmitError(null);

          setZonasEditadas(
            (current) =>
              (current ??
                zonasIniciales).filter(
                (item) =>
                  item.zona !==
                  zona.zona
              )
          );
        },
        [zonasIniciales]
      );

    const handleClose =
      useCallback(() => {
        if (isPending) {
          return;
        }

        setSubmitError(null);
        setZonasEditadas(null);
        onClose();
      }, [
        isPending,
        onClose,
      ]);

    const handleGuardar =
      useCallback(async () => {
        if (
          idCliente === null ||
          !hasChanges
        ) {
          return;
        }

        setSubmitError(null);

        const result = await execute(
          async () => {
            await onGuardar({
              idUsuario: usuario.id,
              idCliente,
              zonasIniciales,
              zonasActuales,
            });
          }
        );

        if (result.status === 'success') {
          setZonasEditadas(null);
          onClose();
          return;
        }

        if (result.status === 'error') {
          setSubmitError(
            getErrorMessage(result.error)
          );
        }
      }, [
        execute,
        hasChanges,
        idCliente,
        onClose,
        onGuardar,
        usuario.id,
        zonasActuales,
        zonasIniciales,
      ]);

    if (!isOpen) {
      return null;
    }

    const missingClient =
      idCliente === null;

    return (
      <Modal
        isOpen={isOpen}
        title="Asignar zonas"
        onClose={handleClose}
        size="xl"
        closeOnEsc={!isPending}
        disableClose={isPending}
      >
        <div
          className={[
            'asignar-zonas-modal',
            isPending
              ? 'asignar-zonas-modal--submitting'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-busy={isPending}
        >
          <div className="asignar-zonas-modal__body">
            <div className="asignar-zonas-modal__user-summary">
              <div>
                <span className="asignar-zonas-modal__eyebrow">
                  Usuario seleccionado
                </span>
                <strong>
                  {usuario.nombre ||
                    usuario.login ||
                    `Usuario ${usuario.id}`}
                </strong>
              </div>

              <div className="asignar-zonas-modal__user-meta">
                <span>
                  ID: {usuario.id}
                </span>
                <span>
                  Login: {usuario.login || '—'}
                </span>
                <span>
                  Cliente: {clienteNombre || 'Activo'}
                </span>
              </div>
            </div>

            {missingClient ? (
              <FeedbackMessage
                variant="error"
                title="No se pudo identificar el cliente activo"
                message="Seleccione un cliente activo antes de administrar las zonas del usuario."
              />
            ) : (
              <TableResourceState
                isLoading={data.isLoading}
                error={data.error}
                onRetry={data.refetch}
                loadingMessage="Cargando zonas del usuario..."
                errorTitle="No se pudieron cargar las zonas"
              >
                <section className="asignar-zonas-modal__section">
                  <h2 className="asignar-zonas-modal__section-title">
                    Zonas del usuario
                  </h2>

                  <p className="asignar-zonas-modal__help">
                    Mueva las zonas entre asignadas y disponibles. Los cambios se enviarán al guardar; las relaciones nuevas usan POST y las existentes se actualizan mediante PUT.
                  </p>

                  <UsuarioZonasManager
                    zonasAsignadas={
                      zonasActuales
                    }
                    zonasDisponibles={
                      zonasDisponibles
                    }
                    canInsert={canInsert}
                    canEdit={canEdit}
                    disabled={isPending}
                    onAgregar={
                      handleAgregarZona
                    }
                    onQuitar={
                      handleQuitarZona
                    }
                  />
                </section>
              </TableResourceState>
            )}

            {submitError && (
              <FeedbackMessage
                variant="error"
                title="No se pudieron guardar las zonas"
                message={submitError}
              />
            )}
          </div>

          <footer className="asignar-zonas-modal__footer">
            <ActionButton
              label="Guardar cambios"
              loadingLabel="Guardando..."
              loading={isPending}
              variant="primary"
              size="md"
              icon="✓"
              onClick={handleGuardar}
              disabled={
                missingClient ||
                data.isLoading ||
                Boolean(data.error) ||
                !hasChanges ||
                (!canInsert && !canEdit)
              }
              title={
                !hasChanges
                  ? 'No hay cambios por guardar.'
                  : undefined
              }
              className="asignar-zonas-modal__submit-button"
            />
          </footer>
        </div>
      </Modal>
    );
  };

export default ModalAsignarUsuarioZonas;
