import React, { type ReactNode } from 'react';

import type { DeudorInfo } from '../../../types';
import { ModalFormLayout } from '../ModalFormLayout';
import { ModalStatusMessage } from './ModalStatusMessage';

type ModalAsyncStatusLayoutVariant = 'loading' | 'error';

interface ModalAsyncStatusLayoutProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  submitLabel: string;
  minHeight: string;
  variant: ModalAsyncStatusLayoutVariant;
  children: ReactNode;
  deudorData?: DeudorInfo | null;
}

const noopSubmit = () => undefined;

export const ModalAsyncStatusLayout: React.FC<ModalAsyncStatusLayoutProps> = ({
  isOpen,
  title,
  onClose,
  submitLabel,
  minHeight,
  variant,
  children,
  deudorData,
}) => {
  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      submitLabel={submitLabel}
      onSubmit={noopSubmit}
      minHeight={minHeight}
      deudorData={deudorData}
    >
      <ModalStatusMessage variant={variant}>{children}</ModalStatusMessage>
    </ModalFormLayout>
  );
};