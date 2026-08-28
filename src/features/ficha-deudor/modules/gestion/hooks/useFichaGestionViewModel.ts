import { useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import type { DocumentoApi } from '../../../shared/types';
import { useFichaGestionActions } from './useFichaGestionActions';
import { useFichaGestionCatalogos } from './useFichaGestionCatalogos';
import { useFichaGestionForm } from './useFichaGestionForm';
import type { FichaGestionViewModel } from '../types/fichaGestionViewModel.types';
import type { GestionFormClaro } from '../types/fichaGestionForm.types';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import { useFichaGestionDerivedValues } from './useFichaGestionDerivedValues';
import { useSyncTelefonoSeleccionado } from './useSyncTelefonoSeleccionado';
import { buildFichaGestionViewModelProps } from '../mappers/fichaGestionViewModel.mapper';
import { useSyncDefaultNP2Option } from './useSyncDefaultNP2Option';
import { useOperationFeedback } from '@shared/hooks/useOperationFeedback';
import type { TelefonoReferenciado } from '../../telefonos-referenciados/types/telefono.types';
import { useBuscarTelefonoDeudor } from './useBuscarTelefonoDeudor';

interface UseFichaGestionViewModelParams {
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  deudorNombre: string;
  carteraNombre: string;
  telefonoSeleccionado?: string;
  telefonosReferenciados: TelefonoReferenciado[];
  isLoadingTelefonosReferenciados: boolean;
  telefonosReferenciadosError: string | null;
  onSelectTelefono: (telefono: string) => void;
  onGestionGuardada?: (
    gestionTerminada: boolean
  ) => void;
  onSubmit?: (
    data: GestionFormClaro,
    fechaFinGestion: string
  ) => void;
}

export const useFichaGestionViewModel = ({
  params,
  documentosFiltrados,
  deudorNombre,
  carteraNombre,
  telefonoSeleccionado,
  telefonosReferenciados,
  isLoadingTelefonosReferenciados,
  telefonosReferenciadosError,
  onSelectTelefono,
  onGestionGuardada,
  onSubmit,
}: UseFichaGestionViewModelParams): FichaGestionViewModel => {
  const {
    id_cliente: idCliente,
    id_cartera: idCartera,
    id_contrato: idContrato,
    id_usuario: idUsuario,
  } = params;
  const { usuario } = useAuth();
  const {
    feedback,
    clearFeedback,
    showFeedback,
    showSuccess,
  } = useOperationFeedback();

  const {
    form,
    setField,
    setFields,
    handleNP0Change,
    handleNP1Change,
    resetForm,
  } = useFichaGestionForm();

  useSyncTelefonoSeleccionado({
    telefonoSeleccionado,
    telefonoActual: form.telefono,
    setField,
  });

  const telefonoSearch = useBuscarTelefonoDeudor({
    telefonosReferenciados,
    isLoadingTelefonosReferenciados,
    telefonosReferenciadosError,
    telefonoSeleccionado,
    onSelectTelefono,
  });

  const catalogos = useFichaGestionCatalogos(
    idCliente,
    idCartera,
    idContrato,
    form.np0,
    form.np1
  );

  const {
    np1Options,
    np2Options,
    isLoadingNP2,
  } = catalogos;

  useSyncDefaultNP2Option({
    np1: form.np1,
    np2: form.np2,
    np2Options,
    isLoadingNP2,
    setField,
  });

  const {
    usuarioActual,
    mostrarCamposClaro,
    np1TipoContacto,
  } = useFichaGestionDerivedValues({
    idCliente,
    idUsuario,
    usuarioNombre: usuario?.nombre,
    usuarioApellido: usuario?.apellido,
    np1: form.np1,
    np1Options,
  });

  const handleGestionRegistrada = useCallback(
    (
      data: GestionFormClaro,
      fechaFinGestion: string
    ) => {
      resetForm();

      showSuccess({
        entity: {
          label: 'Gestión',
          gender: 'feminine',
        },
        action: 'create',
        context: 'record',
        message:
          'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
      });

      onSubmit?.(
        data,
        fechaFinGestion
      );
    },
    [onSubmit, resetForm, showSuccess]
  );

  const handleGestionError = useCallback(
    (message: string) => {
      showFeedback({
        variant: 'error',
        title: 'No se pudo registrar la gestión',
        message,
      });
    },
    [showFeedback]
  );

  const {
    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,
    clearAgendaState,
    validationErrors,
    isSaving,
    handleAgendar,
    handleGuardar,
  } = useFichaGestionActions({
    form,
    setField,
    params,
    deudorNombre,
    carteraNombre,
    np1Options,
    np2Options,
    documentosFiltrados,
    np1TipoContacto,
    requiereCamposClaro: mostrarCamposClaro,
    onGestionGuardada,
    onSubmit: handleGestionRegistrada,
    onSaveError: handleGestionError,
  });

  const handleAgendarGestion =
    useCallback(async () => {
      clearFeedback();
      await handleAgendar();
    }, [clearFeedback, handleAgendar]);

  const handleGuardarGestion =
    useCallback(async () => {
      clearFeedback();
      clearAgendaState();
      await handleGuardar();
    }, [
      clearAgendaState,
      clearFeedback,
      handleGuardar,
    ]);

  const handleCloseFeedback = clearFeedback;

  return buildFichaGestionViewModelProps({
    idCliente,
    form,
    setField,
    setFields,
    handleNP0Change,
    handleNP1Change,
    telefonoSearch,
    catalogos,
    usuarioActual,

    handleAgendar: handleAgendarGestion,

    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,

    validationErrors,
    feedback,
    handleCloseFeedback,
    mostrarCamposClaro,
    handleGuardarGestion,
    isSaving,
  });
};