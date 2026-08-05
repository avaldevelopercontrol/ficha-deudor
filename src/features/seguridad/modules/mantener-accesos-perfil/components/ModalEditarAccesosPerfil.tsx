import type {
  ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
  SelectField,
} from '@shared/components/ui';

import type {
  PerfilOpcionCount,
  PerfilOpcionDetalle,
} from '../../../types/perfilOpcion.types';

import {
  MODAL_EDITAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalEditarAccesosPerfil.constants';

import {
  useEditarAccesosPerfilModal,
} from '../hooks/useEditarAccesosPerfilModal';

import type {
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import AccesosPerfilPermissionsPanel from './AccesosPerfilPermissionsPanel';

import AccesosPerfilTree from './AccesosPerfilTree';

import AsignarAccesosPerfilErrorSummary from './AsignarAccesosPerfilErrorSummary';

interface ModalEditarAccesosPerfilProps {
  isOpen: boolean;
  perfil: PerfilOpcionCount;
  onClose: () => void;
  onGuardar: (
    asignacionesActuales:
      readonly PerfilOpcionDetalle[],
    data: RegistrarPerfilOpcionesData
  ) => Promise<void> | void;
}

export const ModalEditarAccesosPerfil = ({
  isOpen,
  perfil,
  onClose,
  onGuardar,
}: ModalEditarAccesosPerfilProps): ReactNode => {
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
    profileOptions,
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
  } = useEditarAccesosPerfilModal({
    isOpen,
    perfil,
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
        MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
                  MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
              <section className="asignar-accesos-perfil-form__profile">
                <SelectField<
                  number | ''
                >
                  label={
                    MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                      .profileLabel
                  }
                  options={profileOptions}
                  value={form.perfilId}
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
                        MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                          .optionsTitle
                      }
                    </strong>

                    <span>
                      {
                        form.selectedOptionIds
                          .length
                      }{' '}
                      {form.selectedOptionIds.length === 1
                        ? MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                            .selectedCountSingular
                        : MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
                    onToggle={
                      handleToggleOption
                    }
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
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                        .permissionsTitle
                    }
                    noSelectionMessage={
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                        .noSelectedOption
                    }
                    selectAllLabel={
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                        .selectAll
                    }
                    globalHint={
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                        .globalPermissionHint
                    }
                    containerHint={
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                        .containerPermissionHint
                    }
                    singleHint={
                      MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
                  MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
              MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
                .submit
            }
            loadingLabel={
              MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
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
              isSubmitting
            }
            className="asignar-accesos-perfil-modal__submit-button"
          />
        </footer>
      </div>
    </Modal>
  );
};

export default ModalEditarAccesosPerfil;
