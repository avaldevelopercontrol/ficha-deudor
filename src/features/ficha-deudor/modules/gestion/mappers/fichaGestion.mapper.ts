import type { CreateGestionOpeGesContratosPayload } from '../types/fichaGestionApi.types';
import { SISTEMA_GESTION } from '../constants/fichaGestion.constants';
import type { GestionFormClaro } from '../types/fichaGestionForm.types';
import {
  splitTime,
  toPeruApiDateTimeOrCurrent,
  toPeruApiDateTimeOrNull,
  toRequiredPeruApiDateTime,
} from '../../../shared/utils/date.utils';
import {
  toDecimalNumber,
  toOptionalIdOrZero,
  toRequiredId,
} from '../../../shared/utils/number.utils';
import type { DocumentoApi } from '../../../shared/types';

interface BuildCreateGestionPayloadParams {
  form: GestionFormClaro;
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
  fechaFinGestion: string;
  nIdDocxCobrars: string;
  incluyeCamposClaro: boolean;
}

type GestionIdentityPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  | 'nId_DocxCobrarOpe'
  | 'nId_Cliente'
  | 'nId_Contrato'
  | 'nId_Cartera'
  | 'nId_DocxCobrars'
  | 'nId_PersDeudor'
  | 'nId_Usuario'
>;

type GestionContactPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  | 'cNOMBRECONTACTO'
  | 'cCARGO'
  | 'nNP0'
  | 'nNP1'
  | 'nNP2'
  | 'nESTADOGESTION'
  | 'cTELEFONO'
  | 'nTIPOGESTION'
  | 'nASIGNARGESTOR'
>;

type GestionCompromisoPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  'dFECHACOMPROMISO' | 'nMONTOSOLES' | 'nMONTODOLARES'
>;

type GestionAgendaPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  'dFECHANUEVAGESTION' | 'cHORANUEVAGESTION' | 'cMINUTONUEVAGESTION'
>;

type GestionActualPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  'dFECHAGESTION' | 'cHORAGESTION' | 'cMINUTOGESTION' | 'cOBSERVACION'
>;

type GestionClaroPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  'nESTADOGESTIONCLARO' | 'nMOTIVONOPAGO'
>;

type GestionAuditPayload = Pick<
  CreateGestionOpeGesContratosPayload,
  | 'cSISTEMA'
  | 'dFechaInicioGestion'
  | 'dFechaFinGestion'
  | 'bEstado'
>;

export const buildDocxCobrars = (documentos: DocumentoApi[]) => {
  return documentos
    .map((documento) => documento.nId_DocxCobrar)
    .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
    .map(String)
    .join(',');
};

const buildGestionIdentityPayload = ({
  idCliente,
  idCartera,
  idContrato,
  idDeudor,
  idUsuario,
  nIdDocxCobrars,
}: Pick<
  BuildCreateGestionPayloadParams,
  | 'idCliente'
  | 'idCartera'
  | 'idContrato'
  | 'idDeudor'
  | 'idUsuario'
  | 'nIdDocxCobrars'
>): GestionIdentityPayload => {
  return {
    nId_DocxCobrarOpe: 0,
    nId_Cliente: toRequiredId(idCliente, 'nId_Cliente'),
    nId_Contrato: toRequiredId(idContrato, 'nId_Contrato'),
    nId_Cartera: toRequiredId(idCartera, 'nId_Cartera'),
    nId_DocxCobrars: nIdDocxCobrars,
    nId_PersDeudor: toRequiredId(idDeudor, 'nId_PersDeudor'),
    nId_Usuario: toRequiredId(idUsuario, 'nId_Usuario'),
  };
};

const buildGestionContactPayload = (
  form: GestionFormClaro
): GestionContactPayload => {
  return {
    cNOMBRECONTACTO: form.nombreContacto.trim(),
    cCARGO: form.cargo.trim(),
    nNP0: toRequiredId(form.np0, 'nNP0'),
    nNP1: toRequiredId(form.np1, 'nNP1'),
    nNP2: toOptionalIdOrZero(form.np2, 'nNP2'),
    nESTADOGESTION: toRequiredId(
      form.estadoGestion,
      'nESTADOGESTION'
    ),
    cTELEFONO: form.telefono.trim(),
    nTIPOGESTION: toRequiredId(form.tipoGestion, 'nTIPOGESTION'),
    nASIGNARGESTOR: null,
  };
};

const buildGestionCompromisoPayload = (
  form: GestionFormClaro
): GestionCompromisoPayload => {
  return {
    dFECHACOMPROMISO: toPeruApiDateTimeOrNull(form.fechaCompromisoPago),
    nMONTOSOLES: toDecimalNumber(form.compromisoSoles),
    nMONTODOLARES: toDecimalNumber(form.compromisoUSD),
  };
};

const buildGestionAgendaPayload = (
  form: GestionFormClaro
): GestionAgendaPayload => {
  const nuevaGestionTime = splitTime(form.horaNuevaGestion);

  return {
    dFECHANUEVAGESTION: toPeruApiDateTimeOrNull(form.fechaNuevaGestion),
    cHORANUEVAGESTION: nuevaGestionTime.hour,
    cMINUTONUEVAGESTION: nuevaGestionTime.minute,
  };
};

const buildGestionActualPayload = (
  form: GestionFormClaro
): GestionActualPayload => {
  const gestionTime = splitTime(form.horaGestion);

  return {
    dFECHAGESTION: toPeruApiDateTimeOrCurrent(form.fechaGestion),
    cHORAGESTION: gestionTime.hour,
    cMINUTOGESTION: gestionTime.minute,
    cOBSERVACION: form.observaciones.trim(),
  };
};

const buildGestionClaroPayload = (
  form: GestionFormClaro,
  incluyeCamposClaro: boolean
): GestionClaroPayload => {
  if (!incluyeCamposClaro) {
    return {
      nESTADOGESTIONCLARO: 0,
      nMOTIVONOPAGO: 0,
    };
  }

  return {
    nESTADOGESTIONCLARO: toRequiredId(
      form.estadoGestionClaro,
      'nESTADOGESTIONCLARO'
    ),
    nMOTIVONOPAGO: toRequiredId(
      form.motivoNoPago,
      'nMOTIVONOPAGO'
    ),
  };
};

const buildGestionAuditPayload = (
  fechaInicioGestion: string,
  fechaFinGestion: string
): GestionAuditPayload => {
  return {
    cSISTEMA: SISTEMA_GESTION,

    dFechaInicioGestion:
      toRequiredPeruApiDateTime(
        fechaInicioGestion,
        'dFechaInicioGestion'
      ),

    dFechaFinGestion:
      toRequiredPeruApiDateTime(
        fechaFinGestion,
        'dFechaFinGestion'
      ),

    bEstado: true,
  };
};

export const buildCreateGestionPayload = ({
  form,
  idCliente,
  idCartera,
  idContrato,
  idDeudor,
  idUsuario,
  fechaInicioGestion,
  fechaFinGestion,
  nIdDocxCobrars,
  incluyeCamposClaro,
}: BuildCreateGestionPayloadParams): CreateGestionOpeGesContratosPayload => {
  return {
    ...buildGestionIdentityPayload({
      idCliente,
      idCartera,
      idContrato,
      idDeudor,
      idUsuario,
      nIdDocxCobrars,
    }),
    ...buildGestionContactPayload(form),
    ...buildGestionCompromisoPayload(form),
    ...buildGestionAgendaPayload(form),
    ...buildGestionActualPayload(form),
    ...buildGestionClaroPayload(form, incluyeCamposClaro),
    ...buildGestionAuditPayload(fechaInicioGestion, fechaFinGestion),
  };
};