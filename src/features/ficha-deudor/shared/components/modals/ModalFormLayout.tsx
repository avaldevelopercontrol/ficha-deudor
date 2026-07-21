import React from 'react';

import Modal from '@shared/components/modals/Modal';
import { ActionButton } from '@shared/components/ui';

import DeudorHeaderBlock from '../../../modules/deudor-header/components/DeudorHeaderBlock';

import { useDeudor } from '../../contexts/deudorContextValue';
import type { DeudorInfo } from '../../types';

interface ModalFormLayoutProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  submitLabel: string;
  onSubmit: () => Promise<void> | void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  minHeight?: string;
  showDeudorHeader?: boolean;
  deudorData?: DeudorInfo | null;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const ModalFormLayout: React.FC<
  ModalFormLayoutProps
> = ({
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
  isSubmitting = false,
  submitError = null,
}) => {
  const deudorDataContext = useDeudor();

  const deudorData =
    deudorDataProp ?? deudorDataContext;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size={size}
    >
      <div
        className="modal-form-layout"
        style={{ minHeight }}
        aria-busy={isSubmitting}
      >
        {showDeudorHeader && deudorData && (
          <DeudorHeaderBlock data={deudorData} />
        )}

        <div className="modal-form-layout__body">
          {children}

          {submitError && (
            <div
              className="error-summary"
              role="alert"
            >
              <strong>{submitError}</strong>
            </div>
          )}
        </div>

        <div className="modal-form-layout__footer">
          <ActionButton
            label={submitLabel}
            variant="primary"
            size="md"
            icon="✓"
            onClick={onSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
};