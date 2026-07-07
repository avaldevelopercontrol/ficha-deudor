import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../auth/contexts/authContextValue';
import type { DocumentoApi } from '../../../shared/types/indexApi';
import { CLIENTE_CLARO_ID } from '../constants/fichaGestion.constants';
import { useFichaGestionActions } from './useFichaGestionActions';
import { useFichaGestionCatalogos } from './useFichaGestionCatalogos';
import { useFichaGestionForm } from './useFichaGestionForm';
import type {
  GestionFeedback,
  GestionFormClaro,
} from '../types/fichaGestion.types';

interface UseFichaGestionViewModelParams {
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
  documentosFiltrados: DocumentoApi[];
  telefonoSeleccionado?: string;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

export const useFichaGestionViewModel = ({
  idCliente,
  idCartera,
  idContrato,
  idDeudor,
  idUsuario,
  fechaInicioGestion,
  documentosFiltrados,
  telefonoSeleccionado,
  onGestionGuardada,
  onSubmit,
}: UseFichaGestionViewModelParams) => {
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

  const usuarioActual = useMemo(() => {
    const nombreCompleto = [usuario?.nombre, usuario?.apellido]
      .filter(Boolean)
      .join(' ')
      .trim();

    return nombreCompleto || idUsuario || 'Usuario';
  }, [usuario?.nombre, usuario?.apellido, idUsuario]);

  useEffect(() => {
    const telefono = telefonoSeleccionado?.trim();

    if (telefono && telefono !== form.telefono) {
      setField('telefono', telefono);
    }
  }, [telefonoSeleccionado, form.telefono, setField]);

  const {
    estadosOptions,
    isLoadingEstados,
    errorEstados,
    tiposOptions,
    isLoadingTipos,
    errorTipos,
    np0Options,
    isLoadingNP0,
    errorNP0,
    np1Options,
    isLoadingNP1,
    errorNP1,
    np2Options,
    isLoadingNP2,
    errorNP2,
    estadoGestionClaroOptions,
    isLoadingEstadoGestionClaro,
    errorEstadoGestionClaro,
    motivoNoPagoOptions,
    isLoadingMotivoNoPago,
    errorMotivoNoPago,
  } = useFichaGestionCatalogos(
    idCliente,
    idCartera,
    idContrato,
    form.np0,
    form.np1
  );

  const mostrarCamposClaro = String(idCliente) === CLIENTE_CLARO_ID;

  const np1Seleccionado = np1Options.find(
    (option) => String(option.id) === String(form.np1)
  );

  const np1TipoContacto = Number(np1Seleccionado?.idTipoContacto ?? 0);

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
    idCliente,
    idCartera,
    idContrato,
    idDeudor,
    idUsuario,
    fechaInicioGestion,
    documentosFiltrados,
    np1TipoContacto,
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

  return {
    datosPrincipalesProps: {
      form,
      setField,
      handleNP0Change,
      handleNP1Change,
      handleOpenWhatsApp,
      estadosOptions,
      isLoadingEstados,
      errorEstados,
      tiposOptions,
      isLoadingTipos,
      errorTipos,
      np0Options,
      isLoadingNP0,
      errorNP0,
      np1Options,
      isLoadingNP1,
      errorNP1,
      np2Options,
      isLoadingNP2,
      errorNP2,
    },

    accionesTomarProps: {
      form,
      setField,
      setFields,
      usuarioActual,
      handleAgendar,
    },

    resultadosLlamadaProps: {
      form,
      setField,
      validationErrors,
      feedback,
      onCloseFeedback: handleCloseFeedback,
      mostrarCamposClaro,
      estadoGestionClaroOptions,
      isLoadingEstadoGestionClaro,
      errorEstadoGestionClaro,
      motivoNoPagoOptions,
      isLoadingMotivoNoPago,
      errorMotivoNoPago,
      handleGuardar: handleGuardarGestion,
      isSaving,
    },
  };
};