import type {
  ReactNode,
} from 'react';

import {
  SelectField,
} from '@shared/components/ui';

import AccessAssignmentModalLayout from '../../../components/access/AccessAssignmentModalLayout';
import type {
  RegistrarPerfilOpcionesData,
} from '../../../domain/accesos/perfilAccess.types';
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
import {
  getMantenerAccesosPerfilPermissionMessage,
} from '../utils/mantenerAccesosPerfilPermissions';

interface ModalEditarAccesosPerfilProps {
  isOpen: boolean;
  canEdit: boolean;
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
  canEdit,
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
    <AccessAssignmentModalLayout
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      resourceError={catalogError}
      isReady={isReady}
      texts={MODAL_EDITAR_ACCESOS_PERFIL_TEXTS}
      identity={
        <section className="asignar-accesos-perfil-form__profile">
          <SelectField<number | ''>
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
      }
      form={form}
      errors={errors}
      submitError={submitError}
      treeItems={treeItems}
      activeOption={activeOption}
      activePermissionStates={activePermissionStates}
      activeSelectAllState={activeSelectAllState}
      submitDisabled={
        !isReady ||
        !isDirty ||
        isSubmitting ||
        !canEdit
      }
      submitTitle={
        !canEdit
          ? getMantenerAccesosPerfilPermissionMessage(
              'editar'
            )
          : undefined
      }
      onClose={handleClose}
      onRetry={refetch}
      onActivateOption={handleActivateOption}
      onToggleOption={handleToggleOption}
      onPermissionChange={handlePermissionChange}
      onSelectAllPermissions={
        handleSelectAllPermissions
      }
      onSubmit={handleSubmit}
    />
  );
};

export default ModalEditarAccesosPerfil;
