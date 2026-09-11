import type {
  ReactNode,
} from 'react';

import type {
  AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import Modal from '@shared/components/modals/Modal';
import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import {
  MODAL_EDITAR_MODULO_TEXTS,
} from '../constants/modalEditarModulo.constants';
import {
  useEditarModuloModal,
} from '../hooks/useEditarModuloModal';
import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';
import {
  getMantenerModulosPermissionMessage,
} from '../utils/mantenerModulosPermissions';

import ModuloModalFormBody from './ModuloModalFormBody';
import ModuloModalSubmitFooter from './ModuloModalSubmitFooter';
import ModuloOrderControl from './ModuloOrderControl';
import PowerBiConfigurationSection from './PowerBiConfigurationSection';

interface ModalEditarModuloProps {
  isOpen: boolean;
  canEdit: boolean;
  moduloId: number;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onGuardar: (
    modulo: OpcionApi,
    data: EditarModuloFormData,
    groupIds: readonly number[],
    reportClientPublications:
      readonly AnalyticsReportClientPublicationInput[] | null
  ) => Promise<void> | void;
}

export const ModalEditarModulo = ({
  isOpen,
  canEdit,
  moduloId,
  modulosExistentes,
  onClose,
  onGuardar,
}: ModalEditarModuloProps): ReactNode => {
  const {
    moduloDetalle,
    isLoading,
    error,
    refetch,
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    powerBi,
    groupsDirty,
    reportClientPublicationsDirty,
    analyticsReportClientEmbedsBusy,
    analyticsReportClientEmbedsUnavailable,
    analyticsGroupsBusy,
    analyticsGroupsUnavailable,
    parentOptions,
    orderOptions,
    orderPreview,
    isRootModule,
    visibleDisabled,
    handleNombreChange,
    handleParentChange,
    onVisibleChange,
    onEstadoChange,
  } = useEditarModuloModal({
    isOpen,
    moduloId,
    modulosExistentes,
    onClose,
    onGuardar,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={MODAL_EDITAR_MODULO_TEXTS.title}
      onClose={handleCancel}
      size="md"
      closeOnEsc={!isSubmitting}
      disableClose={isSubmitting}
    >
      <div
        className={[
          'registrar-modulo-modal',
          isSubmitting
            ? 'registrar-modulo-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={
          isLoading ||
          isSubmitting ||
          analyticsGroupsBusy ||
          analyticsReportClientEmbedsBusy
        }
      >
        {isLoading && (
          <div
            className="editar-modulo-modal__resource-state"
            role="status"
            aria-live="polite"
          >
            <span
              className="editar-modulo-modal__spinner"
              aria-hidden="true"
            />
            <span>
              {MODAL_EDITAR_MODULO_TEXTS.loadingDetail}
            </span>
          </div>
        )}

        {!isLoading && error && (
          <div className="editar-modulo-modal__resource-error">
            <FeedbackMessage
              variant="error"
              title={
                MODAL_EDITAR_MODULO_TEXTS
                  .detailErrorTitle
              }
              message={error}
            />

            <div className="editar-modulo-modal__resource-actions">
              <ActionButton
                label="Reintentar"
                variant="secondary"
                size="sm"
                onClick={refetch}
              />
            </div>
          </div>
        )}

        {!isLoading &&
          !error &&
          moduloDetalle && (
            <>
              <ModuloModalFormBody
                formFieldsProps={{
                  form,
                  errors,
                  parentOptions,
                  codeDisabled: true,
                  parentDisabled:
                    isRootModule || form.esPowerBI,
                  showPowerBiTypeSelector: false,
                  onNombreChange: handleNombreChange,
                  onDescripcionChange: (value) => {
                    handleChange('descripcion', value);
                  },
                  onCodigoChange: (value) => {
                    handleChange('codigo', value);
                  },
                  onIconoChange: (value) => {
                    handleChange('icono', value);
                  },
                  onUrlBIChange: (value) => {
                    handleChange('urlBI', value);
                  },
                  onImagenOpcionChange: (value) => {
                    handleChange(
                      'imagenOpcion',
                      value
                    );
                  },
                  onEmailOpcionChange: (value) => {
                    handleChange(
                      'emailOpcion',
                      value
                    );
                  },
                  onPadreChange: handleParentChange,
                  visibleDisabled,
                  onVisibleChange,
                  onEstadoChange,
                  orderControl: (
                    <ModuloOrderControl
                      value={form.orden}
                      options={orderOptions}
                      previewItems={orderPreview}
                      error={errors.orden}
                      helpText={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderHelp
                      }
                      previewTitle={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderPreview
                      }
                      disabled={isRootModule}
                      onChange={(value) => {
                        handleChange('orden', value);
                      }}
                    />
                  ),
                }}
                validationTitle={
                  MODAL_EDITAR_MODULO_TEXTS
                    .validationSummary
                }
                submitError={submitError}
              >
                {form.esPowerBI && (
                  <PowerBiConfigurationSection
                    groups={powerBi.groups}
                    selectedGroupIds={
                      powerBi.selectedGroupIds
                    }
                    publications={
                      powerBi.reportClientPublications
                    }
                    hasReportClientConfiguration={
                      powerBi.hasReportClientConfiguration
                    }
                    isSubmitting={isSubmitting}
                    isLoading={powerBi.isLoading}
                    error={powerBi.error}
                    groupSelectionError={
                      powerBi.groupSelectionError
                    }
                    onRetry={powerBi.refetch}
                    onGroupSelectionChange={
                      powerBi.onGroupSelectionChange
                    }
                    onEmbedUrlChange={
                      powerBi.onEmbedUrlChange
                    }
                    onGroupIdsChange={
                      powerBi.onReportClientGroupIdsChange
                    }
                  />
                )}
              </ModuloModalFormBody>

              <ModuloModalSubmitFooter
                label={
                  MODAL_EDITAR_MODULO_TEXTS
                    .submitLabel
                }
                loadingLabel={
                  MODAL_EDITAR_MODULO_TEXTS
                    .loadingLabel
                }
                loading={isSubmitting}
                onSubmit={handleSubmit}
                disabled={
                  isSubmitting ||
                  (!isDirty &&
                    !groupsDirty &&
                    !reportClientPublicationsDirty) ||
                  !canEdit ||
                  analyticsGroupsBusy ||
                  analyticsGroupsUnavailable ||
                  analyticsReportClientEmbedsBusy ||
                  analyticsReportClientEmbedsUnavailable ||
                  powerBi.hasInvalidReportClientPublication ||
                  (form.esPowerBI &&
                    !powerBi.hasValidGroupSelection)
                }
                title={
                  !canEdit
                    ? getMantenerModulosPermissionMessage(
                        'editar'
                      )
                    : undefined
                }
              />
            </>
          )}
      </div>
    </Modal>
  );
};

export default ModalEditarModulo;
