import type { ReactNode } from 'react';

import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';
import {
  MODAL_EDITAR_TELEFONO_LAYOUT,
  MODAL_EDITAR_TELEFONO_TEXTS,
} from '../constants/modalEditarTelefono.constants';

type ModalEditarTelefonoStatusVariant = 'loading' | 'error';

interface ModalEditarTelefonoStatusProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ModalEditarTelefonoStatusVariant;
  children: ReactNode;
}

export const ModalEditarTelefonoStatus = ({
  isOpen,
  onClose,
  variant,
  children,
}: ModalEditarTelefonoStatusProps) => (
  <ModalAsyncStatusLayout
    isOpen={isOpen}
    title={MODAL_EDITAR_TELEFONO_TEXTS.title}
    onClose={onClose}
    submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
    minHeight={MODAL_EDITAR_TELEFONO_LAYOUT.minHeight}
    variant={variant}
  >
    {children}
  </ModalAsyncStatusLayout>
);
