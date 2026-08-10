import type React from 'react';

import {
  AccessControlFeedback,
} from '@features/access-control';

import MenuModuloCard from '../components/MenuModuloCard';
import MenuModuloChildrenModal from '../components/MenuModuloChildrenModal';
import { useMenuModulos } from '../hooks';

export const MenuModulosPage: React.FC = () => {
  const {
    modulos,
    selectedModulo,
    welcomeName,
    status,
    error,
    onRetry,
    onSelectModulo,
    onSelectChildModulo,
    onCloseModal,
  } = useMenuModulos();

  const renderContent = () => {
    if (
      status === 'idle' ||
      status === 'loading'
    ) {
      return (
        <AccessControlFeedback
          message="Cargando módulos disponibles..."
        />
      );
    }

    if (status === 'error') {
      return (
        <AccessControlFeedback
          message={
            error ??
            'No se pudieron cargar sus módulos.'
          }
          actionLabel="Reintentar"
          onAction={() => {
            void onRetry();
          }}
        />
      );
    }

    if (modulos.length === 0) {
      return (
        <AccessControlFeedback
          message="Su perfil no tiene módulos habilitados."
        />
      );
    }

    return (
      <div className="menu-modulos-grid">
        {modulos.map((modulo) => (
          <MenuModuloCard
            key={modulo.key}
            modulo={modulo}
            onSelect={onSelectModulo}
          />
        ))}
      </div>
    );
  };

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
            Selecciona uno de los módulos habilitados para tu perfil.
          </p>
        </div>
      </div>

      {renderContent()}

      <MenuModuloChildrenModal
        modulo={selectedModulo}
        onClose={onCloseModal}
        onSelect={
          onSelectChildModulo
        }
      />
    </section>
  );
};

export default MenuModulosPage;
