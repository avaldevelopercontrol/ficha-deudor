import { useCallback, useState } from 'react';
import { useAuth } from '@features/auth/contexts/authContextValue';
import type { DocumentoApi } from '../../../shared/types';
import { useFichaGestionActions } from './useFichaGestionActions';
import { useFichaGestionCatalogos } from './useFichaGestionCatalogos';
import { useFichaGestionForm } from './useFichaGestionForm';
import type {
  FichaGestionViewModel,
  GestionFeedback,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import { useFichaGestionDerivedValues } from './useFichaGestionDerivedValues';
import { useSyncTelefonoSeleccionado } from './useSyncTelefonoSeleccionado';
import { buildFichaGestionViewModelProps } from '../mappers/fichaGestionViewModel.mapper';
import { useSyncDefaultNP2Option } from './useSyncDefaultNP2Option';
import { useAutoClearFeedback } from './useAutoClearFeedback';
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
  const [feedback, setFeedback] = useState<GestionFeedback | null>(null);

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

      setFeedback({
        variant: 'success',
        title: 'Gestión registrada correctamente',
        message:
          'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
      });

      onSubmit?.(
        data,
        fechaFinGestion
      );
    },
    [onSubmit, resetForm]
  );
  
  const handleGestionError =
  useCallback((message: string) => {
    setFeedback({
      variant: 'error',
      title:
        'No se pudo registrar la gestión',
      message,
    });
  }, []);

  const {
    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,
    clearAgendaState,
    validationErrors,
    isSaving,
    handleAgendar,
    handleOpenWhatsApp,
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
    requiereCamposClaro:
      mostrarCamposClaro,
    onGestionGuardada,
    onSubmit:
      handleGestionRegistrada,
    onSaveError:
      handleGestionError,
  });

  const handleAgendarGestion =
    useCallback(async () => {
      setFeedback(null);
      await handleAgendar();
    }, [handleAgendar]);

  const handleGuardarGestion =
    useCallback(async () => {
      setFeedback(null);
      clearAgendaState();
      await handleGuardar();
    }, [
      clearAgendaState,
      handleGuardar,
    ]);

  const handleCloseFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  useAutoClearFeedback({
    feedback,
    onClear: handleCloseFeedback,
  });

  return buildFichaGestionViewModelProps({
    idCliente,
    form,
    setField,
    setFields,
    handleNP0Change,
    handleNP1Change,
    handleOpenWhatsApp,
    telefonoSearch,
    catalogos,
    usuarioActual,
    
    handleAgendar:
      handleAgendarGestion,

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