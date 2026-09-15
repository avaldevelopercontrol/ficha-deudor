import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { SisgesIcon } from '@shared/icons/sisges';

import {
  lockModalScroll,
  unlockModalScroll,
} from './modalScrollLock.utils';

interface SideDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  width?: 'sm' | 'md' | 'lg';
  contentClassName?: string;
}

export const SideDrawer = ({
  open,
  title,
  onClose,
  children,
  eyebrow,
  icon,
  ariaLabel,
  width = 'md',
  contentClassName = '',
}: SideDrawerProps) => {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    lockModalScroll();
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockModalScroll();
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="side-drawer-layer"
      role="presentation"
      onMouseDown={onClose}
    >
      <aside
        className={`side-drawer side-drawer--${width}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="side-drawer__header">
          <div className="side-drawer__title">
            {icon && (
              <span className="side-drawer__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              {eyebrow && <span className="side-drawer__eyebrow">{eyebrow}</span>}
              <h2 id={titleId}>{title}</h2>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="side-drawer__close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <SisgesIcon name="close" width={19} height={19} />
          </button>
        </header>

        <div className={`side-drawer__content ${contentClassName}`.trim()}>
          {children}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default SideDrawer;
