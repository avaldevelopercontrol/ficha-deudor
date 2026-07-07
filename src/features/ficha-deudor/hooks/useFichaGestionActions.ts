import { useState } from 'react';
import { createGestionOpeGesContratos } from '../api/fichaGestionApi';
import {
  hasFichaGestionErrors,
  validateFichaGestion,
  type FichaGestionValidationErrors,
} from '../validations/fichaGestionValidation';
import type {
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';
import type { DocumentoApi } from '../../../shared/types/indexApi';
import {
  buildCreateGestionPayload,
  buildDocxCobrars,
} from '../mappers/fichaGestion.mapper';

interface UseFichaGestionActionsParams {
  form: GestionFormClaro;
  setField: SetGestionField;
  usuarioActual: string;
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

export const useFichaGestionActions = ({
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
  onSubmit,
}: UseFichaGestionActionsParams) => {
  const [validationErrors, setValidationErrors] =
    useState<FichaGestionValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAgendar = () => {
    if (form.fechaNuevaGestion && form.horaNuevaGestion) {
      const mensaje = `Gestión agendada para: ${form.fechaNuevaGestion} a las ${form.horaNuevaGestion} por ${usuarioActual}`;

      alert(mensaje);
      setField('fechaGestion', form.fechaNuevaGestion);
      setField('horaGestion', form.horaNuevaGestion);
    } else {
      alert('Por favor seleccione fecha y hora para agendar');
    }
  };

  const handleOpenWhatsApp = () => {
    const telefono = form.telefono.replace(/\D/g, '');

    if (!telefono) {
      alert('Por favor seleccione un número de teléfono');
      return;
    }

    const mensaje = encodeURIComponent(
      'Hola, me comunico de [Empresa] respecto a su gestión.'
    );

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  const handleGuardar = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const nIdDocxCobrars = buildDocxCobrars(documentosFiltrados);

      const errors = validateFichaGestion({
        form,
        np1TipoContacto,
        tieneDocumentos: Boolean(nIdDocxCobrars),
      });

      setValidationErrors(errors);

      if (hasFichaGestionErrors(errors)) {
        return;
      }

      const payload = buildCreateGestionPayload({
        form,
        idCliente,
        idCartera,
        idContrato,
        idDeudor,
        idUsuario,
        fechaInicioGestion,
        nIdDocxCobrars,
      });

      await createGestionOpeGesContratos(payload);

      setValidationErrors({});

      onSubmit?.(form);

      onGestionGuardada?.(form.gestionTerminada);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al guardar la gestión.';

      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    validationErrors,
    isSaving,
    handleAgendar,
    handleOpenWhatsApp,
    handleGuardar,
  };
};