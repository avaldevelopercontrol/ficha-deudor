import { useCallback, useState } from 'react';
import { useDireccionById } from './useDireccionesReferenciadas';
import type {
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
} from '../../../shared/types';

interface Params {
  create: (formData: DireccionFormData) => Promise<void>;
  update: (id: string, formData: DireccionEditFormData) => Promise<void>;
}

export const usePanelDireccionesReferenciadasActions = ({
  create,
  update,
}: Params) => {
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [direccionEditarId, setDireccionEditarId] = useState<string | null>(
    null
  );

  const { data: direccionByIdData } = useDireccionById(direccionEditarId);

  const handleOpenRegistrar = useCallback(() => {
    setShowRegistrar(true);
  }, []);

  const handleCloseRegistrar = useCallback(() => {
    setShowRegistrar(false);
  }, []);

  const handleEdit = useCallback((row: DireccionReferenciada) => {
    setDireccionEditarId(row.id);
    setShowEditar(true);
  }, []);

  const handleCloseEditar = useCallback(() => {
    setShowEditar(false);
    setDireccionEditarId(null);
  }, []);

  const handleGuardarEdicion = useCallback(
    async (formData: DireccionEditFormData) => {
      try {
        await update(formData.id, formData);
        handleCloseEditar();
      } catch {
        alert('No se pudo guardar la edición de la dirección.');
      }
    },
    [update, handleCloseEditar]
  );

  const handleRegistrar = useCallback(
    async (formData: DireccionFormData) => {
      try {
        await create(formData);
        handleCloseRegistrar();
      } catch {
        alert('No se pudo registrar la dirección.');
      }
    },
    [create, handleCloseRegistrar]
  );

  return {
    showRegistrar,
    showEditar,
    direccionEditarId,
    direccionByIdData,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleEdit,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
  };
};