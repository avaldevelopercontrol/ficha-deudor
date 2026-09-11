import type {
  ReactNode,
} from 'react';

import {
  SelectField,
} from '@shared/components/ui';

import AccessAssignmentModalLayout from '../../../components/access/AccessAssignmentModalLayout';
import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS,
} from '../constants/modalAsignarAccesosUsuario.constants';
import type {
  AsignarAccesosUsuarioCatalogResource,
} from '../hooks/useAsignarAccesosUsuarioCatalog';
import {
  useAsignarAccesosUsuarioModal,
} from '../hooks/useAsignarAccesosUsuarioModal';
import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';
import {
  getMantenerAccesosUsuarioPermissionMessage,
} from '../utils/mantenerAccesosUsuarioPermissions';

import UsuarioSearchCombobox from './UsuarioSearchCombobox';

interface ModalAsignarAccesosUsuarioProps {
  isOpen: boolean;
  catalogResource: AsignarAccesosUsuarioCatalogResource;
  existingAccesses: readonly UsuarioGrupoOpcionListado[];
  canInsert: boolean;
  onClose: () => void;
  onRegistrar: (
    data: RegistrarUsuarioGrupoOpcionesData
  ) => Promise<void> | void;
}

export const ModalAsignarAccesosUsuario = ({
  isOpen,
  catalogResource,
  existingAccesses,
  canInsert,
  onClose,
  onRegistrar,
}: ModalAsignarAccesosUsuarioProps): ReactNode => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    isLoading,
    catalogError,
    isReady,
    refetch,
    userOptions,
    groupOptions,
    hasSelectedGroup,
    hasAvailableUsersForSelectedGroup,
    treeItems,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    handleUsuarioChange,
    handleGrupoChange,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose,
  } = useAsignarAccesosUsuarioModal({
    catalogResource,
    existingAccesses,
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
      texts={MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS}
      identity={
        <section className="asignar-accesos-perfil-form__profile mantener-accesos-usuario-form__identity">
          <SelectField<number | ''>
            label={
              MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                .groupLabel
            }
            options={groupOptions}
            value={form.grupoId}
            placeholder={
              MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                .groupPlaceholder
            }
            required
            layout="inline"
            disabled={isSubmitting}
            error={errors.grupoId}
            onChange={handleGrupoChange}
          />

          <UsuarioSearchCombobox
            label={
              MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                .userLabel
            }
            options={userOptions}
            value={form.usuarioId}
            placeholder={
              hasSelectedGroup
                ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                    .userPlaceholder
                : MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                    .userRequiresGroupPlaceholder
            }
            emptyMessage={
              hasSelectedGroup &&
              !hasAvailableUsersForSelectedGroup
                ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                    .allUsersAssignedToGroup
                : undefined
            }
            required
            disabled={
              isSubmitting || !hasSelectedGroup
            }
            error={errors.usuarioId}
            onChange={handleUsuarioChange}
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
          ? getMantenerAccesosUsuarioPermissionMessage(
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

export default ModalAsignarAccesosUsuario;
