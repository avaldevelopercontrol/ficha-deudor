import type React from 'react';

import Modal from '@shared/components/modals/Modal';

import type { MenuModulo } from '../types';
import MenuModuloCard from './MenuModuloCard';

interface MenuModuloChildrenModalProps {
  modulo: MenuModulo | null;
  onClose: () => void;
  onSelect: (modulo: MenuModulo) => void;
}

export const MenuModuloChildrenModal: React.FC<MenuModuloChildrenModalProps> = ({
  modulo,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      isOpen={!!modulo}
      title={modulo?.label ?? 'Opciones del módulo'}
      onClose={onClose}
      size="lg"
    >
      <div className="menu-modulos-modal">
        <p className="menu-modulos-modal__subtitle">
          Selecciona una opción para continuar.
        </p>

        <div className="menu-modulos-grid menu-modulos-grid--children">
          {modulo?.children?.map((child) => (
            <MenuModuloCard
              key={child.key}
              modulo={child}
              variant="child"
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MenuModuloChildrenModal;