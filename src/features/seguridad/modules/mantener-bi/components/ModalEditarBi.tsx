import type {
  ReactNode,
} from 'react';

import type {
  AnalyticsReportClientPublicationInput,
} from '@features/gestion-analitica/acceso/administracion';

import type {
  EditarModuloFormData,
} from '../../../domain/modulos/moduloForm.types';
import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import ModalEditarModulo from '../../mantener-modulos/components/ModalEditarModulo';

import {
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';
import {
  getMantenerBiPermissionMessage,
} from '../utils/mantenerBiPermissions';

interface ModalEditarBiProps {
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

/**
 * Adaptador de presentación para Mantener BI. Reutiliza el editor Power BI
 * de Mantener módulo y fija el modo Power BI para que esta pantalla no pueda
 * degradar accidentalmente el registro a un módulo convencional.
 *
 * La configuración por cartera (incluido el caso de la opción 27) permanece
 * en el flujo compartido de PowerBiConfigurationSection.
 */
export const ModalEditarBi = ({
  isOpen,
  canEdit,
  moduloId,
  modulosExistentes,
  onClose,
  onGuardar,
}: ModalEditarBiProps): ReactNode => (
  <ModalEditarModulo
    isOpen={isOpen}
    canEdit={canEdit}
    moduloId={moduloId}
    powerBiOnly
    title={MANTENER_BI_TEXTS.editTitle}
    submitLabel={MANTENER_BI_TEXTS.editSubmitLabel}
    loadingLabel={MANTENER_BI_TEXTS.editLoadingLabel}
    validationTitle={MANTENER_BI_TEXTS.editValidationSummary}
    editPermissionMessage={
      getMantenerBiPermissionMessage(
        'editar'
      )
    }
    modulosExistentes={modulosExistentes}
    onClose={onClose}
    onGuardar={onGuardar}
  />
);

export default ModalEditarBi;
