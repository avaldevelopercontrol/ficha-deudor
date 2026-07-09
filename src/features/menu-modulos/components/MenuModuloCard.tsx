import type React from 'react';

import type { MenuModulo } from '../types';
import MenuModuloIcon from './MenuModuloIcon';

interface MenuModuloCardProps {
  modulo: MenuModulo;
  onSelect: (modulo: MenuModulo) => void;
  variant?: 'main' | 'child';
}

const isModuloEnabled = (modulo: MenuModulo): boolean =>
  modulo.isEnabled !== false;

export const MenuModuloCard: React.FC<MenuModuloCardProps> = ({
  modulo,
  onSelect,
  variant = 'main',
}) => {
  const enabled = isModuloEnabled(modulo);
  const hasChildren = !!modulo.children?.length;

  return (
    <button
      type="button"
      className={[
        'menu-modulos-card',
        `menu-modulos-card--${variant}`,
        enabled ? '' : 'menu-modulos-card--disabled',
      ].join(' ')}
      onClick={() => onSelect(modulo)}
      disabled={!enabled}
      aria-disabled={!enabled}
    >
      <div className="menu-modulos-card__top">
        <div className="menu-modulos-card__icon">
          <MenuModuloIcon name={modulo.icon} />
        </div>

        {modulo.badge && (
          <span
            className={[
              'menu-modulos-card__badge',
              enabled
                ? 'menu-modulos-card__badge--active'
                : 'menu-modulos-card__badge--pending',
            ].join(' ')}
          >
            {modulo.badge}
          </span>
        )}
      </div>

      <div className="menu-modulos-card__body">
        <span className="menu-modulos-card__label">{modulo.label}</span>
        <span className="menu-modulos-card__description">
          {modulo.descripcion}
        </span>
      </div>

      {enabled && (
        <div className="menu-modulos-card__footer">
          <span>{hasChildren ? 'Ver opciones' : 'Ingresar'}</span>
          <span className="menu-modulos-card__arrow">→</span>
        </div>
      )}
    </button>
  );
};

export default MenuModuloCard;