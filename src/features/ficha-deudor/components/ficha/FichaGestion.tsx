import React, { useEffect, useMemo, useState } from 'react';

import {
  useFichaGestionForm,
  type GestionFormClaro,
} from '../../hooks/useFichaGestionForm';
import { useFichaGestionCatalogos } from '../../hooks/useFichaGestionCatalogos';
import { useFichaGestionActions } from '../../hooks/useFichaGestionActions';

import FichaGestionDatosPrincipales from '../ficha-gestion/FichaGestionDatosPrincipales';
import FichaGestionAccionesTomar from '../ficha-gestion/FichaGestionAccionesTomar';
import FichaGestionResultadosLlamada from '../ficha-gestion/FichaGestionResultadosLlamada';

import { useAuth } from '../../../auth/contexts/authContextValue';

import type { FeedbackMessageVariant } from '../../../../shared/components/ui';
import type { DocumentoApi } from '../../../../shared/types/indexApi';

interface Props {
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

interface GestionFeedback {
  variant: FeedbackMessageVariant;
  title: string;
  message: string;
}

const ID_CLIENTE_CLARO = '95';

const FichaGestion: React.FC<Props> = ({
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
}) => {
  const { usuario } = useAuth();
  const [feedback, setFeedback] = useState<GestionFeedback | null>(null);

  const {
    form,
    setField,
    handleNP0Change,
    handleNP1Change,
    resetForm,
  } = useFichaGestionForm();

  const usuarioActual = useMemo(() => {
    const nombreCompleto = [
      usuario?.nombre,
      usuario?.apellido,
    ]
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

  const mostrarCamposClaro = String(idCliente) === ID_CLIENTE_CLARO;

  const np1Seleccionado = np1Options.find(
    (option) => String(option.id) === String(form.np1)
  );

  const np1TipoContacto = Number(np1Seleccionado?.idTipoContacto ?? 0);

  const handleGestionRegistrada = (data: GestionFormClaro) => {
    resetForm();

    setFeedback({
      variant: 'success',
      title: 'Gestión registrada correctamente',
      message:
        'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
    });

    onSubmit?.(data);
  };

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

  const handleGuardarGestion = async () => {
    setFeedback(null);
    await handleGuardar();
  };

  return (
    <div className="ficha-card ficha-gestion ficha-gestion--compact">
      <div className="ficha-gestion-header">
        <span className="fg-title">FICHA DE GESTIÓN</span>
      </div>

      <FichaGestionDatosPrincipales
        form={form}
        setField={setField}
        handleNP0Change={handleNP0Change}
        handleNP1Change={handleNP1Change}
        handleOpenWhatsApp={handleOpenWhatsApp}
        estadosOptions={estadosOptions}
        isLoadingEstados={isLoadingEstados}
        errorEstados={errorEstados}
        tiposOptions={tiposOptions}
        isLoadingTipos={isLoadingTipos}
        errorTipos={errorTipos}
        np0Options={np0Options}
        isLoadingNP0={isLoadingNP0}
        errorNP0={errorNP0}
        np1Options={np1Options}
        isLoadingNP1={isLoadingNP1}
        errorNP1={errorNP1}
        np2Options={np2Options}
        isLoadingNP2={isLoadingNP2}
        errorNP2={errorNP2}
      />

      <FichaGestionAccionesTomar
        form={form}
        setField={setField}
        usuarioActual={usuarioActual}
        handleAgendar={handleAgendar}
      />

      <FichaGestionResultadosLlamada
        form={form}
        setField={setField}
        validationErrors={validationErrors}
        feedback={feedback}
        onCloseFeedback={() => setFeedback(null)}
        mostrarCamposClaro={mostrarCamposClaro}
        estadoGestionClaroOptions={estadoGestionClaroOptions}
        isLoadingEstadoGestionClaro={isLoadingEstadoGestionClaro}
        errorEstadoGestionClaro={errorEstadoGestionClaro}
        motivoNoPagoOptions={motivoNoPagoOptions}
        isLoadingMotivoNoPago={isLoadingMotivoNoPago}
        errorMotivoNoPago={errorMotivoNoPago}
        resetForm={resetForm}
        handleGuardar={handleGuardarGestion}
        isSaving={isSaving}
      />
    </div>
  );
};

export default FichaGestion;