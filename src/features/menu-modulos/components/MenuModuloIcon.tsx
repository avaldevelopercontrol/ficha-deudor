import type React from 'react';

import {
  SisgesIcon,
} from '@shared/icons/sisges';

import type {
  MenuModuloIconName,
} from '../types';

interface MenuModuloIconProps {
  name: MenuModuloIconName;
}

export const MenuModuloIcon: React.FC<
  MenuModuloIconProps
> = ({ name }) => (
  <span className="menu-modulos-icon">
    <SisgesIcon
      name={name}
      width={24}
      height={24}
      aria-hidden="true"
    />
  </span>
);

export default MenuModuloIcon;
