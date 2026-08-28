import type { ReactNode } from 'react';

import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';
import {
  MODAL_EDITAR_DIRECCION_LAYOUT,
  MODAL_EDITAR_DIRECCION_TEXTS,
} from '../constants/modalEditarDireccion.constants';

type ModalEditarDireccionStatusVariant = 'loading' | 'error';

interface ModalEditarDireccionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ModalEditarDireccionStatusVariant;
  children: ReactNode;
}

export const ModalEditarDireccionStatus = ({
  isOpen,
  onClose,
  variant,
  children,
}: ModalEditarDireccionStatusProps) => (
  <ModalAsyncStatusLayout
    isOpen={isOpen}
    title={MODAL_EDITAR_DIRECCION_TEXTS.title}
    onClose={onClose}
    submitLabel={MODAL_EDITAR_DIRECCION_TEXTS.submitLabel}
    minHeight={MODAL_EDITAR_DIRECCION_LAYOUT.minHeight}
    variant={variant}
  >
    {children}
  </ModalAsyncStatusLayout>
);
