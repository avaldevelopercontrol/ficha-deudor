import {
  useCallback,
  useState,
} from 'react';

import type {
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
} from '../types/direccion.types';

import { PANEL_DIRECCIONES_REFERENCIADAS_ACTION_MESSAGES } from '../constants/panelDireccionesReferenciadas.constants';

import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

interface Params {
  create: (
    formData: DireccionFormData
  ) => Promise<void>;

  update: (
    id: string,
    formData: DireccionEditFormData
  ) => Promise<void>;
}

export const usePanelDireccionesReferenciadasActions =
  ({
    create,
    update,
  }: Params) => {
    const [
      showRegistrar,
      setShowRegistrar,
    ] = useState(false);

    const [
      showEditar,
      setShowEditar,
    ] = useState(false);

    const [
      direccionEditarId,
      setDireccionEditarId,
    ] = useState<string | null>(null);

    const handleOpenRegistrar =
      useCallback(() => {
        setShowRegistrar(true);
      }, []);

    const handleCloseRegistrar =
      useCallback(() => {
        setShowRegistrar(false);
      }, []);

    const handleEdit = useCallback(
      (row: DireccionReferenciada) => {
        setDireccionEditarId(row.id);
        setShowEditar(true);
      },
      []
    );

    const handleCloseEditar =
      useCallback(() => {
        setShowEditar(false);
        setDireccionEditarId(null);
      }, []);

    const handleGuardarEdicion =
      useCallback(
        async (
          formData: DireccionEditFormData
        ): Promise<void> => {
          try {
            await update(
              formData.id,
              formData
            );
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_DIRECCIONES_REFERENCIADAS_ACTION_MESSAGES.UPDATE_ERROR
              )
            );
          }
        },
        [update]
      );

    const handleRegistrar =
      useCallback(
        async (
          formData: DireccionFormData
        ): Promise<void> => {
          try {
            await create(formData);
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_DIRECCIONES_REFERENCIADAS_ACTION_MESSAGES.CREATE_ERROR
              )
            );
          }
        },
        [create]
      );

    return {
      showRegistrar,
      showEditar,
      direccionEditarId,
      handleOpenRegistrar,
      handleCloseRegistrar,
      handleEdit,
      handleCloseEditar,
      handleGuardarEdicion,
      handleRegistrar,
    };
  };