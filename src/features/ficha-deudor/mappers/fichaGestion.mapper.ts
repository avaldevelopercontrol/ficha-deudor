import type { CreateGestionOpeGesContratosPayload } from '../api/fichaGestionApi';
import { SISTEMA_GESTION } from '../constants/fichaGestion.constants';
import type { GestionFormClaro } from '../types/fichaGestion.types';
import { toApiDateTimeOrCurrent, toApiDateTimeOrNull, splitTime } from '../utils/date.utils';
import { toDecimalNumber, toNumber } from '../utils/number.utils';
import type { DocumentoApi } from '../../../shared/types/indexApi';

interface BuildCreateGestionPayloadParams {
  form: GestionFormClaro;
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
  nIdDocxCobrars: string;
}

export const buildDocxCobrars = (documentos: DocumentoApi[]) => {
  return documentos
    .map((documento) => documento.nId_DocxCobrar)
    .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
    .map(String)
    .join(',');
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
}: BuildCreateGestionPayloadParams): CreateGestionOpeGesContratosPayload => {
  const nuevaGestionTime = splitTime(form.horaNuevaGestion);
  const gestionTime = splitTime(form.horaGestion);

  return {
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
    cSISTEMA: SISTEMA_GESTION,
    nESTADOGESTIONCLARO: toNumber(form.estadoGestionClaro),
    nMOTIVONOPAGO: toNumber(form.motivoNoPago),
    dFechaInicioGestion: toApiDateTimeOrCurrent(fechaInicioGestion),
    bEstado: true,
  };
};