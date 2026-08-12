import {
  useCallback,
  useState,
} from 'react';
import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';


import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';

import { PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES } from '../constants/panelTelefonosReferenciados.constants';

import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

interface Params {
  create: (
    formData: TelefonoFormData
  ) => Promise<void>;

  update: (
    id: number,
    formData: TelefonoFormData
  ) => Promise<void>;
}

export const usePanelTelefonosReferenciadosActions =
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
      telefonoEditarId,
      setTelefonoEditarId,
    ] = useState<number | null>(null);

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
      (row: TelefonoReferenciado) => {
        clearFeedback();
        setTelefonoEditarId(row.id);
        setShowEditar(true);
      },
      [clearFeedback]
    );

    const handleCloseEditar =
      useCallback(() => {
        setShowEditar(false);
        setTelefonoEditarId(null);
      }, []);

    const handleGuardarEdicion =
      useCallback(
        async (
          formData: TelefonoFormData
        ): Promise<void> => {
          clearFeedback();

          try {
            await update(
              formData.id,
              formData
            );

            showSuccess({
              entity: {
                label: 'Teléfono',
                gender: 'masculine',
              },
              action: 'update',
            });
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES.UPDATE_ERROR
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
          formData: TelefonoFormData
        ): Promise<void> => {
          clearFeedback();

          try {
            await create(formData);

            showSuccess({
              entity: {
                label: 'Teléfono',
                gender: 'masculine',
              },
              action: 'create',
            });
          } catch (error) {
            throw new Error(
              getErrorMessage(
                error,
                PANEL_TELEFONOS_REFERENCIADOS_ACTION_MESSAGES.CREATE_ERROR
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
      telefonoEditarId,
      handleOpenRegistrar,
      handleCloseRegistrar,
      handleEdit,
      handleCloseEditar,
      handleGuardarEdicion,
      handleRegistrar,
    };
  };