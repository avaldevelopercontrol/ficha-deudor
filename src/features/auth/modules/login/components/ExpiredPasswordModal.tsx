import type React from 'react';

import Modal from '@shared/components/modals/Modal';
import { ActionButton } from '@shared/components/ui';

interface ExpiredPasswordModalProps {
  isOpen: boolean;
  message: string;
  onChangePassword: () => void;
  onClose: () => void;
  title?: string;
  heading?: string;
  actionLabel?: string;
  dismissLabel?: string;
  onDismiss?: () => void;
}

export const ExpiredPasswordModal: React.FC<ExpiredPasswordModalProps> = ({
  isOpen,
  message,
  onChangePassword,
  onClose,
  title = 'Clave expirada',
  heading = 'Debe actualizar su clave',
  actionLabel = 'Cambiar clave',
  dismissLabel = 'Más tarde',
  onDismiss,
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    onClose={onClose}
    size="sm"
    closeOnEsc
    showCloseButton
  >
    <div className="expired-password-modal">
      <div
        className="expired-password-modal__icon"
        aria-hidden="true"
      >
        !
      </div>

      <div className="expired-password-modal__content">
        <h2 className="expired-password-modal__title">
          {heading}
        </h2>

        <p className="expired-password-modal__message">
          {message}
        </p>
      </div>

      <div className="expired-password-modal__actions">
        {onDismiss && (
          <ActionButton
            label={dismissLabel}
            variant="secondary"
            size="sm"
            onClick={onDismiss}
          />
        )}

        <ActionButton
          label={actionLabel}
          variant="primary"
          size="sm"
          onClick={onChangePassword}
        />
      </div>
    </div>
  </Modal>
);

export default ExpiredPasswordModal;
