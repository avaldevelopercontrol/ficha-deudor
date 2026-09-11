import type {
  ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  MODAL_REGISTRAR_MODULO_TEXTS,
} from '../constants/modalRegistrarModulo.constants';
import {
  useRegistrarModuloModal,
} from '../hooks/useRegistrarModuloModal';
import type {
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';
import {
  getMantenerModulosPermissionMessage,
} from '../utils/mantenerModulosPermissions';

import ModuloModalFormBody from './ModuloModalFormBody';
import ModuloModalSubmitFooter from './ModuloModalSubmitFooter';
import PowerBiGroupSelector from './PowerBiGroupSelector';

import './PowerBiGroupSelector.css';

interface ModalRegistrarModuloProps {
  isOpen: boolean;
  canInsert: boolean;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarModuloFormData,
    groupIds: readonly number[]
  ) => Promise<void> | void;
}

export const ModalRegistrarModulo = ({
  isOpen,
  canInsert,
  modulosExistentes,
  onClose,
  onRegistrar,
}: ModalRegistrarModuloProps): ReactNode => {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    parentOptions,
    powerBiParentAvailable,
    selectedGroupIds,
    hasValidGroupSelection,
    groupSelectionError,
    powerBiGroups,
    isLoadingActiveGroups,
    activeGroupsError,
    visibleDisabled,
    handleNombreChange,
    handleCodigoChange,
    handlePowerBIChange,
    handleGroupSelectionChange,
    onVisibleChange,
    onEstadoChange,
  } = useRegistrarModuloModal({
    isOpen,
    modulosExistentes,
    onClose,
    onRegistrar,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={MODAL_REGISTRAR_MODULO_TEXTS.title}
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
        aria-busy={isSubmitting}
      >
        <ModuloModalFormBody
          formFieldsProps={{
            form,
            errors,
            parentOptions,
            powerBiDisabled:
              !powerBiParentAvailable,
            powerBiDisabledMessage:
              !powerBiParentAvailable
                ? 'Primero registre el módulo Reportería para poder crear tableros Power BI.'
                : undefined,
            onNombreChange: handleNombreChange,
            onDescripcionChange: (value) => {
              handleChange('descripcion', value);
            },
            onCodigoChange: handleCodigoChange,
            onIconoChange: (value) => {
              handleChange('icono', value);
            },
            onEsPowerBIChange: handlePowerBIChange,
            onUrlBIChange: (value) => {
              handleChange('urlBI', value);
            },
            onImagenOpcionChange: (value) => {
              handleChange('imagenOpcion', value);
            },
            onEmailOpcionChange: (value) => {
              handleChange('emailOpcion', value);
            },
            parentDisabled: form.esPowerBI,
            onPadreChange: (value) => {
              handleChange('padreId', value);
            },
            visibleDisabled,
            onVisibleChange,
            onEstadoChange,
          }}
          validationTitle={
            MODAL_REGISTRAR_MODULO_TEXTS
              .validationSummary
          }
          submitError={submitError}
        >
          {form.esPowerBI && (
            <div className="power-bi-group-selector-spacing">
              <PowerBiGroupSelector
                groups={powerBiGroups}
                value={selectedGroupIds}
                disabled={
                  isSubmitting ||
                  isLoadingActiveGroups ||
                  Boolean(activeGroupsError)
                }
                error={
                  activeGroupsError
                    ? 'No se pudieron cargar los grupos activos.'
                    : groupSelectionError
                }
                onChange={
                  handleGroupSelectionChange
                }
              />
            </div>
          )}
        </ModuloModalFormBody>

        <ModuloModalSubmitFooter
          label={
            MODAL_REGISTRAR_MODULO_TEXTS
              .submitLabel
          }
          loadingLabel={
            MODAL_REGISTRAR_MODULO_TEXTS
              .loadingLabel
          }
          loading={isSubmitting}
          onSubmit={handleSubmit}
          disabled={
            isSubmitting ||
            !canInsert ||
            (form.esPowerBI &&
              !hasValidGroupSelection)
          }
          title={
            !canInsert
              ? getMantenerModulosPermissionMessage(
                  'insertar'
                )
              : undefined
          }
        />
      </div>
    </Modal>
  );
};

export default ModalRegistrarModulo;
