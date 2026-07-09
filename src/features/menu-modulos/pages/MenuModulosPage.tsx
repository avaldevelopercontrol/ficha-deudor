import type React from 'react';

import MenuModuloCard from '../components/MenuModuloCard';
import MenuModuloChildrenModal from '../components/MenuModuloChildrenModal';
import { useMenuModulos } from '../hooks';

export const MenuModulosPage: React.FC = () => {
  const {
    modulos,
    selectedModulo,
    welcomeName,
    onSelectModulo,
    onSelectChildModulo,
    onCloseModal,
  } = useMenuModulos();

  return (
    <section className="menu-modulos-page">
      <div className="menu-modulos-hero">
        <div className="menu-modulos-hero__content">
          <span className="menu-modulos-hero__eyebrow">
            Panel de módulos
          </span>

          <h1 className="menu-modulos-hero__title">
            Bienvenido, {welcomeName}
          </h1>

          <p className="menu-modulos-hero__description">
            Selecciona el módulo con el que deseas trabajar. Solo se muestran
            como activos los apartados disponibles en esta versión.
          </p>
        </div>
      </div>

      <div className="menu-modulos-grid">
        {modulos.map((modulo) => (
          <MenuModuloCard
            key={modulo.key}
            modulo={modulo}
            onSelect={onSelectModulo}
          />
        ))}
      </div>

      <MenuModuloChildrenModal
        modulo={selectedModulo}
        onClose={onCloseModal}
        onSelect={onSelectChildModulo}
      />
    </section>
  );
};

export default MenuModulosPage;