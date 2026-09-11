import type {
  ReactNode,
} from 'react';

import {
  SelectField,
} from '@shared/components/ui';

import AccessAssignmentModalLayout from '../../../components/access/AccessAssignmentModalLayout';
import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

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
    <AccessAssignmentModalLayout
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      resourceError={catalogError}
      isReady={isReady}
      texts={MODAL_EDITAR_ACCESOS_USUARIO_TEXTS}
      identity={
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
          ? getMantenerAccesosUsuarioPermissionMessage(
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

export default ModalEditarAccesosUsuario;
