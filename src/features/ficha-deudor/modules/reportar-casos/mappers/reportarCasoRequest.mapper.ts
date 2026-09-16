import { getCurrentPeruDateTime } from '../../../shared/utils/date.utils';
import { toRequiredId } from '../../../shared/utils/number.utils';

import type {
  CreateReportarCasoRequest,
  ReportarCasoByIdApi,
  ReportarCasoFormData,
  UpdateReportarCasoRequest,
} from '../types/reportarCaso.types';

const REPORTAR_CASO_DOCX_COBRAR_DEFAULT = 0;

export const buildCreateReportarCasoRequest = (
  idCliente: string,
  idCartera: string,
  idDeudor: string,
  idUsuario: string,
  data: ReportarCasoFormData,
  currentDate = new Date()
): CreateReportarCasoRequest => {
  const currentDateTime = getCurrentPeruDateTime(currentDate);

  return {
    nId_DocxCobrar: REPORTAR_CASO_DOCX_COBRAR_DEFAULT,
    dDocCobOpe_FecIni: currentDateTime,
    cDocOpeCobOut_Descr: data.descripcion.trim(),
    nId_UsuOpe: toRequiredId(idUsuario, 'nId_UsuOpe'),
    nId_PersDeudor: toRequiredId(idDeudor, 'nId_PersDeudor'),
    nId_Cartera: toRequiredId(idCartera, 'nId_Cartera'),
    nId_Cliente: toRequiredId(idCliente, 'nId_Cliente'),
    dDoc_FecActual: currentDateTime,
    cDocParam01: data.caso.trim(),
    cDocParam04: data.tipoSiniestro.trim(),
  };
};


const assertReportarCasoContext = (
  original: ReportarCasoByIdApi,
  idCliente: number,
  idCartera: number,
  idDeudor: number
): void => {
  if (
    original.nId_Cliente !== idCliente ||
    original.nId_Cartera !== idCartera ||
    original.nId_PersDeudor !== idDeudor
  ) {
    throw new Error(
      'El caso seleccionado no pertenece al contexto actual del deudor'
    );
  }
};

export const buildUpdateReportarCasoRequest = (
  idCliente: string,
  idCartera: string,
  idDeudor: string,
  idUsuario: string,
  original: ReportarCasoByIdApi,
  data: ReportarCasoFormData,
  currentDate = new Date()
): UpdateReportarCasoRequest => {
  const clienteId = toRequiredId(idCliente, 'nId_Cliente');
  const carteraId = toRequiredId(idCartera, 'nId_Cartera');
  const deudorId = toRequiredId(idDeudor, 'nId_PersDeudor');

  assertReportarCasoContext(
    original,
    clienteId,
    carteraId,
    deudorId
  );

  return {
    nId_DocxCobrarOpeResult: original.nId_DocxCobrarOpeResult,
    nId_DocxCobrar: original.nId_DocxCobrar,
    dDocCobOpe_FecIni: original.dDocCobOpe_FecIni,
    cDocOpeCobOut_Descr: data.descripcion.trim(),
    nId_UsuOpe: toRequiredId(idUsuario, 'nId_UsuOpe'),
    nId_PersDeudor: deudorId,
    nId_Cartera: carteraId,
    nId_Cliente: clienteId,
    dDoc_FecActual: getCurrentPeruDateTime(currentDate),
    cDocParam01: data.caso.trim(),
    cDocParam04: data.tipoSiniestro.trim(),
  };
};
