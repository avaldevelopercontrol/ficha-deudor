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
} from '@shared/components/ui';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import {
  getEditarUsuarioOriginalValues,
  mapUsuarioDetalleToEditarForm,
} from '../../../mappers/editarUsuario.mapper';

import {
  MODAL_EDITAR_USUARIO_INITIAL_FORM,
  MODAL_EDITAR_USUARIO_TEXTS,
} from '../constants/modalEditarUsuario.constants';

import {
  useEditarUsuarioCatalogos,
} from '../hooks/useEditarUsuarioCatalogos';

import {
  useEditarUsuarioData,
} from '../hooks/useEditarUsuarioData';

import type {
  EditarUsuarioFormData,
  EditarUsuarioPayload,
  UsuarioGrupoItem,
} from '../types/editarUsuario.types';

import {
  hasEditarUsuarioDataChanges,
  normalizeEditarUsuarioForm,
  validateEditarUsuarioForm,
} from '../validations/editarUsuario.validation';

import EditarUsuarioFormFields from './EditarUsuarioFormFields';
import UsuarioGroupsManager from './UsuarioGroupsManager';

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  idUsuario: number | null;
  onClose: () => void;
  onGuardar: (
    payload: EditarUsuarioPayload
  ) => Promise<void> | void;
}

const dedupeGroups = (
  groups: readonly UsuarioGrupoItem[]
): UsuarioGrupoItem[] => {
  const byId = new Map<
    number,
    UsuarioGrupoItem
  >();

  groups.forEach((group) => {
    const current = byId.get(
      group.idGrupo
    );

    if (
      !current ||
      (current.idUsuarioGrupo === null &&
        group.idUsuarioGrupo !== null)
    ) {
      byId.set(
        group.idGrupo,
        group
      );
    }
  });

  return Array.from(
    byId.values()
  ).sort((first, second) =>
    first.nombre.localeCompare(
      second.nombre,
      'es',
      { sensitivity: 'base' }
    )
  );
};

const EditarUsuarioErrorSummary: FC<{
  errors: Record<string, string>;
}> = ({ errors }) => {
  const entries =
    Object.entries(errors);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      className="error-summary"
      role="alert"
    >
      <strong>
        {
          MODAL_EDITAR_USUARIO_TEXTS
            .validationSummary
        }
      </strong>

      <ul>
        {entries.map(
          ([field, message]) => (
            <li key={field}>
              {message}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export const ModalEditarUsuario:
  FC<ModalEditarUsuarioProps> = ({
    isOpen,
    idUsuario,
    onClose,
    onGuardar,
  }) => {
    const data = useEditarUsuarioData({
      enabled: isOpen,
      idUsuario,
    });

    const {
      catalogos,
      loading: catalogLoading,
      errors: catalogErrors,
    } = useEditarUsuarioCatalogos({
      enabled: isOpen,
      idUsuario,
    });

    const [gruposEditados, setGruposEditados] =
      useState<UsuarioGrupoItem[] | null>(null);

    const gruposIniciales = useMemo(
      () =>
        dedupeGroups(
          data.grupos ?? []
        ),
      [data.grupos]
    );

    const gruposActuales =
      gruposEditados ?? gruposIniciales;

    const todosLosGrupos = useMemo(
      () =>
        dedupeGroups([
          ...(data.grupos ?? []),
          ...(data.gruposFaltantes ?? []),
        ]),
      [
        data.grupos,
        data.gruposFaltantes,
      ]
    );

    const gruposDisponibles = useMemo(() => {
      const currentIds = new Set(
        gruposActuales.map(
          (group) => group.idGrupo
        )
      );

      return todosLosGrupos.filter(
        (group) =>
          !currentIds.has(
            group.idGrupo
          )
      );
    }, [
      gruposActuales,
      todosLosGrupos,
    ]);

    const validate = useCallback(
      (form: EditarUsuarioFormData) =>
        validateEditarUsuarioForm(
          form,
          {
            catalogos,
            gruposActuales,
          }
        ),
      [catalogos, gruposActuales]
    );

    const {
      form,
      errors,
      setErrors,
      isSubmitting,
      submitError,
      handleChange,
      handleSubmit,
      handleCancel,
    } = useModalForm({
      initialForm:
        MODAL_EDITAR_USUARIO_INITIAL_FORM,
      entity: data.usuario,
      mapEntityToForm:
        mapUsuarioDetalleToEditarForm,
      onClose,
      validate,
      resetOnClose: true,
      onSubmit: async (currentForm) => {
        if (!data.usuario) {
          throw new Error(
            'No se pudo identificar al usuario a actualizar.'
          );
        }

        const normalizedForm =
          normalizeEditarUsuarioForm(
            currentForm
          );

        const initialForm =
          normalizeEditarUsuarioForm(
            mapUsuarioDetalleToEditarForm(
              data.usuario
            )
          );

        await onGuardar({
          form: normalizedForm,
          usuarioModificado:
            hasEditarUsuarioDataChanges(
              normalizedForm,
              initialForm
            ),
          original:
            getEditarUsuarioOriginalValues(
              data.usuario
            ),
          gruposIniciales,
          gruposActuales,
        });
      },
    });

    const handleAgregarGrupo =
      useCallback(
        (group: UsuarioGrupoItem) => {
          setGruposEditados(
            (current) =>
              dedupeGroups([
                ...(current ??
                  gruposIniciales),
                group,
              ])
          );

          setErrors((current) => {
            if (!current.grupos) {
              return current;
            }

            const next = {
              ...current,
            };

            delete next.grupos;

            return next;
          });
        },
        [
          gruposIniciales,
          setErrors,
        ]
      );

    const handleQuitarGrupo =
      useCallback(
        (group: UsuarioGrupoItem) => {
          setGruposEditados(
            (current) =>
              (current ??
                gruposIniciales).filter(
                (item) =>
                  item.idGrupo !==
                  group.idGrupo
              )
          );
        },
        [gruposIniciales]
      );

    const isRequiredCatalogLoading =
      catalogLoading.perfiles ||
      catalogLoading.departamentosLabor;

    const hasRequiredCatalogError =
      Boolean(
        catalogErrors.perfiles ||
          catalogErrors
            .departamentosLabor
      );

    if (!isOpen) {
      return null;
    }

    return (
      <Modal
        isOpen={isOpen}
        title={
          MODAL_EDITAR_USUARIO_TEXTS
            .title
        }
        onClose={handleCancel}
        size="xl"
        closeOnEsc={!isSubmitting}
        disableClose={isSubmitting}
      >
        <TableResourceState
          isLoading={data.isLoading}
          error={data.error}
          onRetry={data.refetch}
          loadingMessage="Cargando información del usuario..."
          errorTitle="No se pudo cargar el usuario"
        >
          <div
            className={[
              'registrar-usuario-modal',
              'editar-usuario-modal',
              isSubmitting
                ? 'registrar-usuario-modal--submitting'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-busy={isSubmitting}
          >
            <div className="registrar-usuario-modal__body">
              <EditarUsuarioFormFields
                form={form}
                errors={errors}
                catalogos={catalogos}
                catalogLoading={
                  catalogLoading
                }
                catalogErrors={
                  catalogErrors
                }
                onChange={handleChange}
              />

              <section className="registrar-usuario-form__section editar-usuario-groups-section">
                <h2 className="registrar-usuario-form__section-title">
                  {
                    MODAL_EDITAR_USUARIO_TEXTS
                      .groupsSection
                  }
                </h2>

                <p className="editar-usuario-groups-section__help">
                  Los cambios de grupos se guardarán junto con la edición del usuario. Puede cerrar el modal para descartar cambios no guardados.
                </p>

                <UsuarioGroupsManager
                  gruposActuales={
                    gruposActuales
                  }
                  gruposDisponibles={
                    gruposDisponibles
                  }
                  error={errors.grupos}
                  disabled={isSubmitting}
                  onAgregar={
                    handleAgregarGrupo
                  }
                  onQuitar={
                    handleQuitarGrupo
                  }
                />
              </section>

              <EditarUsuarioErrorSummary
                errors={errors}
              />

              {submitError && (
                <div
                  className="error-summary"
                  role="alert"
                >
                  <strong>
                    {submitError}
                  </strong>
                </div>
              )}
            </div>

            <footer className="registrar-usuario-modal__footer">
              <ActionButton
                label={
                  MODAL_EDITAR_USUARIO_TEXTS
                    .submitLabel
                }
                loadingLabel={
                  MODAL_EDITAR_USUARIO_TEXTS
                    .loadingLabel
                }
                loading={isSubmitting}
                variant="primary"
                size="md"
                icon="✓"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  isRequiredCatalogLoading ||
                  hasRequiredCatalogError
                }
                title={
                  hasRequiredCatalogError
                    ? 'No se puede guardar hasta cargar los catálogos obligatorios.'
                    : undefined
                }
                className="registrar-usuario-modal__submit-button"
              />
            </footer>
          </div>
        </TableResourceState>
      </Modal>
    );
  };

export default ModalEditarUsuario;
