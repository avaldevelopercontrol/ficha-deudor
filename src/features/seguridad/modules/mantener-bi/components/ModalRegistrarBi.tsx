import type {
  ReactNode,
} from 'react';

import type {
  Modulo,
} from '../../../types/opcion.types';

import type {
  RegistrarModuloFormData,
} from '../../../domain/modulos/moduloForm.types';

import ModalRegistrarModulo from '../../mantener-modulos/components/ModalRegistrarModulo';

import {
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

import {
  getMantenerBiPermissionMessage,
} from '../utils/mantenerBiPermissions';

interface ModalRegistrarBiProps {
  isOpen: boolean;
  canInsert: boolean;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarModuloFormData,
    groupIds: readonly number[]
  ) => Promise<void> | void;
}

export const ModalRegistrarBi = ({
  isOpen,
  canInsert,
  modulosExistentes,
  onClose,
  onRegistrar,
}: ModalRegistrarBiProps): ReactNode => (
  <ModalRegistrarModulo
    isOpen={isOpen}
    canInsert={canInsert}
    powerBiOnly
    title={MANTENER_BI_TEXTS.registerTitle}
    submitLabel={MANTENER_BI_TEXTS.registerSubmitLabel}
    loadingLabel={MANTENER_BI_TEXTS.registerLoadingLabel}
    validationTitle={MANTENER_BI_TEXTS.registerValidationSummary}
    insertPermissionMessage={
      getMantenerBiPermissionMessage(
        'insertar'
      )
    }
    modulosExistentes={modulosExistentes}
    onClose={onClose}
    onRegistrar={onRegistrar}
  />
);

export default ModalRegistrarBi;
