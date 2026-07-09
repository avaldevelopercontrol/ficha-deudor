import type { CreateGestionOpeGesContratosPayload } from '../types/fichaGestion.types';
import { SISTEMA_GESTION } from '../constants/fichaGestion.constants';
import type { GestionFormClaro } from '../types/fichaGestion.types';
import {
  splitTime,
  toApiDateTimeOrCurrent,
  toApiDateTimeOrNull,
} from '../../../shared/utils/date.utils';
import { toDecimalNumber, toNumber } from '../../../shared/utils/number.utils';
import type { DocumentoApi } from '../../../shared/types';

interface BuildCreateGestionPayloadParams {
  form: GestionFormClaro;
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
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
  'cSISTEMA' | 'dFechaInicioGestion' | 'bEstado'
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
    nId_Cliente: toNumber(idCliente),
    nId_Contrato: toNumber(idContrato),
    nId_Cartera: toNumber(idCartera),
    nId_DocxCobrars: nIdDocxCobrars,
    nId_PersDeudor: toNumber(idDeudor),
    nId_Usuario: toNumber(idUsuario),
  };
};

const buildGestionContactPayload = (
  form: GestionFormClaro
): GestionContactPayload => {
  return {
    cNOMBRECONTACTO: form.nombreContacto.trim(),
    cCARGO: form.cargo.trim(),
    nNP0: toNumber(form.np0),
    nNP1: toNumber(form.np1),
    nNP2: toNumber(form.np2),
    nESTADOGESTION: toNumber(form.estadoGestion),
    cTELEFONO: form.telefono.trim(),
    nTIPOGESTION: toNumber(form.tipoGestion),
    nASIGNARGESTOR: null,
  };
};

const buildGestionCompromisoPayload = (
  form: GestionFormClaro
): GestionCompromisoPayload => {
  return {
    dFECHACOMPROMISO: toApiDateTimeOrNull(form.fechaCompromisoPago),
    nMONTOSOLES: toDecimalNumber(form.compromisoSoles),
    nMONTODOLARES: toDecimalNumber(form.compromisoUSD),
  };
};

const buildGestionAgendaPayload = (
  form: GestionFormClaro
): GestionAgendaPayload => {
  const nuevaGestionTime = splitTime(form.horaNuevaGestion);

  return {
    dFECHANUEVAGESTION: toApiDateTimeOrNull(form.fechaNuevaGestion),
    cHORANUEVAGESTION: nuevaGestionTime.hour,
    cMINUTONUEVAGESTION: nuevaGestionTime.minute,
  };
};

const buildGestionActualPayload = (
  form: GestionFormClaro
): GestionActualPayload => {
  const gestionTime = splitTime(form.horaGestion);

  return {
    dFECHAGESTION: toApiDateTimeOrCurrent(form.fechaGestion),
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
    nESTADOGESTIONCLARO: toNumber(form.estadoGestionClaro),
    nMOTIVONOPAGO: toNumber(form.motivoNoPago),
  };
};

const buildGestionAuditPayload = (
  fechaInicioGestion: string
): GestionAuditPayload => {
  return {
    cSISTEMA: SISTEMA_GESTION,
    dFechaInicioGestion: toApiDateTimeOrCurrent(fechaInicioGestion),
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
    ...buildGestionAuditPayload(fechaInicioGestion),
  };
};