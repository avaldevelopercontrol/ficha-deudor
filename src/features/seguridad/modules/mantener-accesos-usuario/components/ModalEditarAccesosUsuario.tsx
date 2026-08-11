import type {
  ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';
import {
  ActionButton,
  SelectField,
} from '@shared/components/ui';

import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import AccesosPerfilPermissionsPanel from '../../mantener-accesos-perfil/components/AccesosPerfilPermissionsPanel';
import AccesosPerfilTree from '../../mantener-accesos-perfil/components/AccesosPerfilTree';
import AsignarAccesosPerfilErrorSummary from '../../mantener-accesos-perfil/components/AsignarAccesosPerfilErrorSummary';

import {
  MODAL_EDITAR_ACCESOS_USUARIO_TEXTS,
} from '../constants/modalEditarAccesosUsuario.constants';
import {
  useEditarAccesosUsuarioModal,
} from '../hooks/useEditarAccesosUsuarioModal';
import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';
import {
  getMantenerAccesosUsuarioPermissionMessage,
} from '../utils/mantenerAccesosUsuarioPermissions';

interface ModalEditarAccesosUsuarioProps {
  isOpen: boolean;
  canEdit: boolean;
  acceso: UsuarioGrupoOpcionListado;
  onClose: () => void;
  onGuardar: (
    asignacionesActuales:
      readonly UsuarioGrupoOpcionDetalle[],
    data: RegistrarUsuarioGrupoOpcionesData
  ) => Promise<void> | void;
}

export const ModalEditarAccesosUsuario = ({
  isOpen,
  canEdit,
  acceso,
  onClose,
  onGuardar,
}: ModalEditarAccesosUsuarioProps): ReactNode => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    isDirty,
    isLoading,
    catalogError,
    isReady,
    refetch,
    userOptions,
    groupOptions,
    treeItems,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose,
  } = useEditarAccesosUsuarioModal({
    isOpen,
    acceso,
    onClose,
    onGuardar,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
          .title
      }
      onClose={handleClose}
      size="xl"
      closeOnEsc={!isSubmitting}
      disableClose={isSubmitting}
    >
      <div
        className={[
          'asignar-accesos-perfil-modal',
          isSubmitting
            ? 'asignar-accesos-perfil-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={isSubmitting}
      >
        <div className="asignar-accesos-perfil-modal__body">
          {isLoading && (
            <div
              className="asignar-accesos-perfil-modal__resource-state"
              role="status"
              aria-live="polite"
            >
              <span
                className="asignar-accesos-perfil-modal__spinner"
                aria-hidden="true"
              />
              <span>
                {
                  MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                    .loading
                }
              </span>
            </div>
          )}

          {!isLoading &&
            catalogError && (
              <div className="asignar-accesos-perfil-modal__resource-error">
                <div
                  className="error-summary"
                  role="alert"
                >
                  <strong>
                    {catalogError}
                  </strong>
                </div>

                <div className="asignar-accesos-perfil-modal__resource-actions">
                  <ActionButton
                    label={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .retry
                    }
                    variant="secondary"
                    size="sm"
                    onClick={refetch}
                  />
                </div>
              </div>
            )}

          {isReady && (
            <div className="asignar-accesos-perfil-form">
              <section className="asignar-accesos-perfil-form__profile mantener-accesos-usuario-form__identity">
                <SelectField<number | ''>
                  label={
                    MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                      .userLabel
                  }
                  options={userOptions}
                  value={form.usuarioId}
                  layout="inline"
                  disabled
                  onChange={() => undefined}
                />

                <SelectField<number | ''>
                  label={
                    MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                      .groupLabel
                  }
                  options={groupOptions}
                  value={form.grupoId}
                  layout="inline"
                  disabled
                  onChange={() => undefined}
                />
              </section>

              <section className="asignar-accesos-perfil-form__access-grid">
                <div className="asignar-accesos-perfil-form__panel">
                  <div className="asignar-accesos-perfil-form__panel-header">
                    <strong>
                      {
                        MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                          .optionsTitle
                      }
                    </strong>

                    <span>
                      {
                        form.selectedOptionIds
                          .length
                      }{' '}
                      {form.selectedOptionIds.length === 1
                        ? MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                            .selectedCountSingular
                        : MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                            .selectedCountPlural}
                    </span>
                  </div>

                  <AccesosPerfilTree
                    items={treeItems}
                    form={form}
                    disabled={isSubmitting}
                    onActivate={
                      handleActivateOption
                    }
                    onToggle={handleToggleOption}
                  />
                </div>

                <div className="asignar-accesos-perfil-form__panel">
                  <AccesosPerfilPermissionsPanel
                    activeOption={activeOption}
                    permissionStates={
                      activePermissionStates
                    }
                    selectAllState={
                      activeSelectAllState
                    }
                    disabled={isSubmitting}
                    titleLabel={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .permissionsTitle
                    }
                    noSelectionMessage={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .noSelectedOption
                    }
                    selectAllLabel={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .selectAll
                    }
                    globalHint={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .globalPermissionHint
                    }
                    containerHint={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .containerPermissionHint
                    }
                    singleHint={
                      MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                        .singlePermissionHint
                    }
                    onPermissionChange={
                      handlePermissionChange
                    }
                    onSelectAll={
                      handleSelectAllPermissions
                    }
                  />
                </div>
              </section>

              <AsignarAccesosPerfilErrorSummary
                errors={errors}
                title={
                  MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                    .validationTitle
                }
              />

              {submitError && (
                <div
                  className="error-summary asignar-accesos-perfil-modal__submit-error"
                  role="alert"
                >
                  <strong>
                    {submitError}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="asignar-accesos-perfil-modal__footer">
          <ActionButton
            label={
              MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                .submit
            }
            loadingLabel={
              MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
                .submitting
            }
            loading={isSubmitting}
            variant="primary"
            size="md"
            icon="✓"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={
              !isReady ||
              !isDirty ||
              isSubmitting ||
              !canEdit
            }
            title={
              !canEdit
                ? getMantenerAccesosUsuarioPermissionMessage(
                    'editar'
                  )
                : undefined
            }
            className="asignar-accesos-perfil-modal__submit-button"
          />
        </footer>
      </div>
    </Modal>
  );
};

export default ModalEditarAccesosUsuario;
