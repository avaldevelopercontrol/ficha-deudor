import type {
  ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
  SelectField,
} from '@shared/components/ui';

import {
  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalAsignarAccesosPerfil.constants';

import {
  useAsignarAccesosPerfilModal,
} from '../hooks/useAsignarAccesosPerfilModal';

import type {
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import AccesosPerfilPermissionsPanel from './AccesosPerfilPermissionsPanel';

import AccesosPerfilTree from './AccesosPerfilTree';

import AsignarAccesosPerfilErrorSummary from './AsignarAccesosPerfilErrorSummary';

import {
  getMantenerAccesosPerfilPermissionMessage,
} from '../utils/mantenerAccesosPerfilPermissions';

interface ModalAsignarAccesosPerfilProps {
  isOpen: boolean;
  canInsert: boolean;
  assignedPerfilIds: readonly number[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarPerfilOpcionesData
  ) => Promise<void> | void;
}

export const ModalAsignarAccesosPerfil = ({
  isOpen,
  canInsert,
  assignedPerfilIds,
  onClose,
  onRegistrar,
}: ModalAsignarAccesosPerfilProps): ReactNode => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    isLoading,
    catalogError,
    isReady,
    refetch,
    profileOptions,
    treeItems,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    handlePerfilChange,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose,
  } = useAsignarAccesosPerfilModal({
    isOpen,
    assignedPerfilIds,
    onClose,
    onRegistrar,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
                  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
                    MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                      .profileLabel
                  }
                  options={profileOptions}
                  value={form.perfilId}
                  placeholder={
                    MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                      .profilePlaceholder
                  }
                  required
                  layout="inline"
                  disabled={isSubmitting}
                  error={errors.perfilId}
                  onChange={
                    handlePerfilChange
                  }
                />
              </section>

              <section className="asignar-accesos-perfil-form__access-grid">
                <div className="asignar-accesos-perfil-form__panel">
                  <div className="asignar-accesos-perfil-form__panel-header">
                    <strong>
                      {
                        MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                          .optionsTitle
                      }
                    </strong>

                    <span>
                      {
                        form.selectedOptionIds
                          .length
                      }{' '}
                      {form.selectedOptionIds.length === 1
                        ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                            .selectedCountSingular
                        : MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                        .permissionsTitle
                    }
                    noSelectionMessage={
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                        .noSelectedOption
                    }
                    selectAllLabel={
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                        .selectAll
                    }
                    globalHint={
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                        .globalPermissionHint
                    }
                    containerHint={
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                        .containerPermissionHint
                    }
                    singleHint={
                      MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
                  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
              MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                .submit
            }
            loadingLabel={
              MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
              isSubmitting ||
              !canInsert
            }
            title={
              !canInsert
                ? getMantenerAccesosPerfilPermissionMessage(
                    'insertar'
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

export default ModalAsignarAccesosPerfil;
