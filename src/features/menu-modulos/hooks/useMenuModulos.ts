import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth/contexts/authContextValue';

import { MENU_MODULOS } from '../data';
import type { MenuModulo } from '../types';

const isModuloEnabled = (modulo: MenuModulo): boolean =>
  modulo.isEnabled !== false;

export const useMenuModulos = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [selectedModulo, setSelectedModulo] = useState<MenuModulo | null>(null);

  const welcomeName = useMemo(() => {
    return usuario?.perfil || usuario?.username || 'Usuario';
  }, [usuario]);

  const handleSelectModulo = useCallback(
    (modulo: MenuModulo) => {
      if (!isModuloEnabled(modulo)) {
        return;
      }

      if (modulo.children?.length) {
        setSelectedModulo(modulo);
        return;
      }

      if (modulo.path) {
        navigate(modulo.path);
      }
    },
    [navigate]
  );

  const handleSelectChildModulo = useCallback(
    (modulo: MenuModulo) => {
      if (!isModuloEnabled(modulo) || !modulo.path) {
        return;
      }

      setSelectedModulo(null);
      navigate(modulo.path);
    },
    [navigate]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedModulo(null);
  }, []);

  return {
    modulos: MENU_MODULOS,
    selectedModulo,
    welcomeName,
    onSelectModulo: handleSelectModulo,
    onSelectChildModulo: handleSelectChildModulo,
    onCloseModal: handleCloseModal,
  };
};