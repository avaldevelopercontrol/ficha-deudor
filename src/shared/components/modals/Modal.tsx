import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  size?: ModalSize;
  closeOnEsc?: boolean;
}

const sizeMap: Record<ModalSize, React.CSSProperties> = {
  sm: { maxWidth: '400px', width: '100%' },
  md: { maxWidth: '560px', width: '100%' },
  lg: { maxWidth: '800px', width: '100%' },
  xl: { maxWidth: '1100px', width: '100%' },
  '2xl': { maxWidth: '1280px', width: '100%' },
  '3xl': { maxWidth: '1440px', width: '100%' },
  '4xl': { maxWidth: '1600px', width: '100%' },
  '5xl': { maxWidth: '1760px', width: '100%' },
  '6xl': { maxWidth: '1920px', width: '100%' },
  '7xl': { maxWidth: '2080px', width: '100%' },
  full: { maxWidth: '95vw', width: '100%' },
};

const modalStack: number[] = [];
let modalIdCounter = 0;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
  closeOnEsc = true,
}) => {
  const modalIdRef = useRef<number>(0);
  const [zIndex, setZIndex] = React.useState(1000);
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      modalIdRef.current = ++modalIdCounter;
      modalStack.push(modalIdRef.current);
      const newZIndex = 1000 + (modalStack.length - 1) * 10;
      setZIndex(newZIndex);

      // Guardar scroll actual y bloquear body
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';

      return () => {
        const index = modalStack.indexOf(modalIdRef.current);
        if (index > -1) modalStack.splice(index, 1);
        if (modalStack.length === 0) {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.overflow = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollYRef.current);
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const lastModalId = modalStack[modalStack.length - 1];
        if (lastModalId === modalIdRef.current) {
          e.stopPropagation();
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  // Renderizar el modal en un portal hacia document.body
  return createPortal(
    <div
      className="modal-overlay open"
      style={{ zIndex: 9999 + (modalStack.length - 1) * 10 }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{ ...sizeMap[size], zIndex: 10000 + (modalStack.length - 1) * 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children ?? (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '30px' }}>📋</span>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>Módulo en construcción</p>
              <small style={{ fontSize: '11px', color: '#64748b' }}>
                Esta sección estará disponible próximamente
              </small>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;