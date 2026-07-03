import { useState } from 'react';
import {
  createGestionOpeGesContratos,
  type CreateGestionOpeGesContratosPayload,
} from '../api/fichaGestionApi';
import {
  hasFichaGestionErrors,
  validateFichaGestion,
  type FichaGestionValidationErrors,
} from '../validations/fichaGestionValidation';
import type { GestionFormClaro } from './useFichaGestionForm';
import type { DocumentoApi } from '../../../shared/types/indexApi';

type SetGestionField = <K extends keyof GestionFormClaro>(
  field: K,
  value: GestionFormClaro[K]
) => void;

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

const toNumber = (value: string | number | null | undefined) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const toDecimalNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 0;

  const parsedValue = Number(String(value).replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const splitTime = (time: string | null | undefined) => {
  const [hour = '', minute = ''] = String(time ?? '').split(':');

  return {
    hour,
    minute,
  };
};

const getCurrentDateTime = () => {
  return new Date().toISOString();
};

const normalizeDateValue = (date: string | null | undefined) => {
  const value = String(date ?? '').trim();

  if (!value) return '';

  const slashDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashDateMatch) {
    const [, day, month, year] = slashDateMatch;

    return `${year}-${month}-${day}`;
  }

  return value.replace(' ', 'T');
};

const toApiDateTimeOrNull = (date: string | null | undefined) => {
  const normalizedDate = normalizeDateValue(date);

  if (!normalizedDate) return null;

  if (normalizedDate.includes('T')) {
    return normalizedDate;
  }

  return `${normalizedDate}T00:00:00`;
};

const toApiDateTimeOrCurrent = (date: string | null | undefined) => {
  return toApiDateTimeOrNull(date) ?? getCurrentDateTime();
};

const buildDocxCobrars = (documentos: DocumentoApi[]) => {
  return documentos
    .map((documento) => documento.nId_DocxCobrar)
    .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
    .map(String)
    .join(',');
};

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

      const nuevaGestionTime = splitTime(form.horaNuevaGestion);
      const gestionTime = splitTime(form.horaGestion);

      const payload: CreateGestionOpeGesContratosPayload = {
        nId_DocxCobrarOpe: 0,
        nId_Cliente: toNumber(idCliente),
        nId_Contrato: toNumber(idContrato),
        nId_Cartera: toNumber(idCartera),
        nId_DocxCobrars: nIdDocxCobrars,
        nId_PersDeudor: toNumber(idDeudor),
        nId_Usuario: toNumber(idUsuario),

        cNOMBRECONTACTO: form.nombreContacto.trim(),
        cCARGO: form.cargo.trim(),
        nNP0: toNumber(form.np0),
        nNP1: toNumber(form.np1),
        nNP2: toNumber(form.np2),
        nESTADOGESTION: toNumber(form.estadoGestion),
        cTELEFONO: form.telefono.trim(),
        nTIPOGESTION: toNumber(form.tipoGestion),
        nASIGNARGESTOR: null,

        dFECHACOMPROMISO: toApiDateTimeOrNull(form.fechaCompromisoPago),
        nMONTOSOLES: toDecimalNumber(form.compromisoSoles),
        nMONTODOLARES: toDecimalNumber(form.compromisoUSD),

        dFECHANUEVAGESTION: toApiDateTimeOrNull(form.fechaNuevaGestion),
        cHORANUEVAGESTION: nuevaGestionTime.hour,
        cMINUTONUEVAGESTION: nuevaGestionTime.minute,

        dFECHAGESTION: toApiDateTimeOrCurrent(form.fechaGestion),
        cHORAGESTION: gestionTime.hour,
        cMINUTOGESTION: gestionTime.minute,

        cOBSERVACION: form.observaciones.trim(),
        cSISTEMA: 'SISGES',
        nESTADOGESTIONCLARO: toNumber(form.estadoGestionClaro),
        nMOTIVONOPAGO: toNumber(form.motivoNoPago),
        dFechaInicioGestion: toApiDateTimeOrCurrent(fechaInicioGestion),
        bEstado: true,
      };

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