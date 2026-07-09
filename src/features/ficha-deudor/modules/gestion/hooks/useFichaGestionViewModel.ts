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

interface UseFichaGestionViewModelParams {
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  telefonoSeleccionado?: string;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

export const useFichaGestionViewModel = ({
  params,
  documentosFiltrados,
  telefonoSeleccionado,
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

  const catalogos = useFichaGestionCatalogos(
    idCliente,
    idCartera,
    idContrato,
    form.np0,
    form.np1
  );

  const { np1Options } = catalogos;

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
    (data: GestionFormClaro) => {
      resetForm();

      setFeedback({
        variant: 'success',
        title: 'Gestión registrada correctamente',
        message:
          'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
      });

      onSubmit?.(data);
    },
    [onSubmit, resetForm]
  );

  const {
    validationErrors,
    isSaving,
    handleAgendar,
    handleOpenWhatsApp,
    handleGuardar,
  } = useFichaGestionActions({
    form,
    setField,
    usuarioActual,
    params,
    documentosFiltrados,
    np1TipoContacto,
    requiereCamposClaro: mostrarCamposClaro,
    onGestionGuardada,
    onSubmit: handleGestionRegistrada,
  });

  const handleCloseFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleGuardarGestion = useCallback(async () => {
    setFeedback(null);
    await handleGuardar();
  }, [handleGuardar]);

  return buildFichaGestionViewModelProps({
    idCliente,
    form,
    setField,
    setFields,
    handleNP0Change,
    handleNP1Change,
    handleOpenWhatsApp,
    catalogos,
    usuarioActual,
    handleAgendar,
    validationErrors,
    feedback,
    handleCloseFeedback,
    mostrarCamposClaro,
    handleGuardarGestion,
    isSaving,
  });
};