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

import {
  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalAsignarAccesosPerfil.constants';
import {
  useAsignarAccesosPerfilModal,
} from '../hooks/useAsignarAccesosPerfilModal';
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
    <AccessAssignmentModalLayout
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      resourceError={catalogError}
      isReady={isReady}
      texts={MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS}
      identity={
        <section className="asignar-accesos-perfil-form__profile">
          <SelectField<number | ''>
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
            onChange={handlePerfilChange}
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
        !isReady || isSubmitting || !canInsert
      }
      submitTitle={
        !canInsert
          ? getMantenerAccesosPerfilPermissionMessage(
              'insertar'
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

export default ModalAsignarAccesosPerfil;
