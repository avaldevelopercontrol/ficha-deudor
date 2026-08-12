import {
  useCallback,
  useState,
} from 'react';
import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';


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
    const {
      feedback,
      clearFeedback,
      showSuccess,
    } = useOperationFeedback();

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
        clearFeedback();
        setShowRegistrar(true);
      }, [clearFeedback]);

    const handleCloseRegistrar =
      useCallback(() => {
        setShowRegistrar(false);
      }, []);

    const handleEdit = useCallback(
      (row: DireccionReferenciada) => {
        clearFeedback();
        setDireccionEditarId(row.id);
        setShowEditar(true);
      },
      [clearFeedback]
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
          clearFeedback();

          try {
            await update(
              formData.id,
              formData
            );

            showSuccess({
              entity: {
                label: 'Dirección',
                gender: 'feminine',
              },
              action: 'update',
            });
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_DIRECCIONES_REFERENCIADAS_ACTION_MESSAGES.UPDATE_ERROR
              )
            );
          }
        },
        [
          clearFeedback,
          showSuccess,
          update,
        ]
      );

    const handleRegistrar =
      useCallback(
        async (
          formData: DireccionFormData
        ): Promise<void> => {
          clearFeedback();

          try {
            await create(formData);

            showSuccess({
              entity: {
                label: 'Dirección',
                gender: 'feminine',
              },
              action: 'create',
            });
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_DIRECCIONES_REFERENCIADAS_ACTION_MESSAGES.CREATE_ERROR
              )
            );
          }
        },
        [
          clearFeedback,
          create,
          showSuccess,
        ]
      );

    return {
      feedback,
      clearFeedback,
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