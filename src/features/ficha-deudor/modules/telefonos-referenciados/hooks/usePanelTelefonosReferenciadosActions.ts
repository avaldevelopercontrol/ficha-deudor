import { useCallback, useState } from 'react';
import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';
import { PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES } from '../constants/panelTelefonosReferenciados.constants';

interface Params {
  create: (formData: TelefonoFormData) => Promise<void>;
  update: (id: number, formData: TelefonoFormData) => Promise<void>;
}

export const usePanelTelefonosReferenciadosActions = ({
  create,
  update,
}: Params) => {
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [telefonoEditarId, setTelefonoEditarId] = useState<number | null>(null);

  const handleOpenRegistrar = useCallback(() => {
    setShowRegistrar(true);
  }, []);

  const handleCloseRegistrar = useCallback(() => {
    setShowRegistrar(false);
  }, []);

  const handleEdit = useCallback((row: TelefonoReferenciado) => {
    setTelefonoEditarId(row.id);
    setShowEditar(true);
  }, []);

  const handleCloseEditar = useCallback(() => {
    setShowEditar(false);
    setTelefonoEditarId(null);
  }, []);

  const handleGuardarEdicion = useCallback(
    async (formData: TelefonoFormData) => {
      try {
        await update(formData.id, formData);
        handleCloseEditar();
      } catch {
        alert(PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES.UPDATE_ERROR);
      }
    },
    [update, handleCloseEditar]
  );

  const handleRegistrar = useCallback(
    async (formData: TelefonoFormData) => {
      try {
        await create(formData);
        handleCloseRegistrar();
      } catch {
        alert(PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES.CREATE_ERROR);
      }
    },
    [create, handleCloseRegistrar]
  );

  return {
    showRegistrar,
    showEditar,
    telefonoEditarId,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleEdit,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
  };
};