import React, { type ReactNode } from 'react';

type ModalStatusMessageVariant = 'loading' | 'error';

interface ModalStatusMessageProps {
  variant: ModalStatusMessageVariant;
  children: ReactNode;
}

const MODAL_STATUS_MESSAGE_CLASS_NAMES: Record<
  ModalStatusMessageVariant,
  string
> = {
  loading: 'loading-message',
  error: 'error-message',
};

export const ModalStatusMessage: React.FC<ModalStatusMessageProps> = ({
  variant,
  children,
}) => {
  return (
    <div className={MODAL_STATUS_MESSAGE_CLASS_NAMES[variant]}>{children}</div>
  );
};