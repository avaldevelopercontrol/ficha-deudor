import type React from 'react';
import type { ReactNode } from 'react';

import Modal from '@shared/components/modals/Modal';
import TableResourceState from '@shared/components/table/TableResourceState';
import {
  SisgesIcon,
  type SisgesIconName,
} from '@shared/icons/sisges';

interface PortfolioPromiseDetailModalFrameProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  rootClassName: string;
  introIcon: SisgesIconName;
  eyebrow: string;
  heading: string;
  description: string;
  isInitialLoading: boolean;
  error: string | null;
  onRetry: () => void;
  loadingMessage: string;
  children: ReactNode;
}

export const PortfolioPromiseDetailModalFrame: React.FC<
  PortfolioPromiseDetailModalFrameProps
> = ({
  isOpen,
  title,
  onClose,
  rootClassName,
  introIcon,
  eyebrow,
  heading,
  description,
  isInitialLoading,
  error,
  onRetry,
  loadingMessage,
  children,
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    onClose={onClose}
    size="3xl"
  >
    <div className={rootClassName}>
      <section className={`${rootClassName}__intro`}>
        <span
          className={`${rootClassName}__intro-icon`}
          aria-hidden="true"
        >
          <SisgesIcon name={introIcon} />
        </span>
        <div>
          <span className={`${rootClassName}__eyebrow`}>
            {eyebrow}
          </span>
          <h3>{heading}</h3>
          <p>{description}</p>
        </div>
      </section>

      <TableResourceState
        isLoading={isInitialLoading}
        error={error}
        onRetry={onRetry}
        loadingMessage={loadingMessage}
      >
        {children}
      </TableResourceState>
    </div>
  </Modal>
);

export default PortfolioPromiseDetailModalFrame;
