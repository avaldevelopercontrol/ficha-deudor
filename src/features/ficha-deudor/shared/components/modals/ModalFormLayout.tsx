// src/components/modals/ModalFormLayout.tsx
import React from 'react';
import Modal from '@shared/components/modals/Modal';
import DeudorHeaderBlock from '../../../modules/deudor-header/components/DeudorHeaderBlock';
import { ActionButton } from '@shared/components/ui';
import { useDeudor } from '../../contexts/deudorContextValue';
import type { DeudorInfo } from '../../types';

interface ModalFormLayoutProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  minHeight?: string;
  showDeudorHeader?: boolean;
  deudorData?: DeudorInfo | null; 
}

export const ModalFormLayout: React.FC<ModalFormLayoutProps> = ({
  isOpen,
  title,
  onClose,
  children,
  submitLabel,
  onSubmit,
  size = 'lg',
  minHeight = '400px',
  showDeudorHeader = true,
  deudorData: deudorDataProp,
}) => {
  const deudorDataContext = useDeudor();

  const deudorData = deudorDataProp ?? deudorDataContext;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} size={size}>
      <div className="modal-form-layout" style={{ minHeight }}>
        {showDeudorHeader && deudorData && (
          <DeudorHeaderBlock data={deudorData} />
        )}
        
        <div className="modal-form-layout__body">
          {children}
        </div>
        
        <div className="modal-form-layout__footer">
          <ActionButton
            label={submitLabel}
            variant="primary"
            size="md"
            icon="✓"
            onClick={onSubmit}
          />
        </div>
      </div>
    </Modal>
  );
};