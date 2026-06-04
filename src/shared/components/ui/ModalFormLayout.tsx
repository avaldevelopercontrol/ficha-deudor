// src/components/modals/ModalFormLayout.tsx
import React from 'react';
import Modal from '../modals/Modal';
import DeudorHeaderBlock from '../../../features/ficha-deudor/components/ficha/DeudorHeaderBlock';
import { ActionButton } from '../ui';
import { useDeudor } from '../../../features/ficha-deudor/contexts/DeudorContext';

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
}) => {
  const deudorData = useDeudor();

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