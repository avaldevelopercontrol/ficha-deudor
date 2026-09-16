import {
  createObjectGuard,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CreateReportarCasoResponse,
  ReportarCasoApi,
  ReportarCasoByIdApi,
  UpdateReportarCasoResponse,
} from '../types/reportarCaso.types';

export const isReportarCasoApi = createObjectGuard<ReportarCasoApi>({
  id: isInteger,
  caso: isString,
  descripcion: isString,
  cartera: isString,
  usuario: isString,
  fec_Ingreso: isString,
});

export const isCreateReportarCasoResponse =
  createObjectGuard<CreateReportarCasoResponse>({
    nId_DocxCobrarOpeResult: isInteger,
    nId_Cliente: isInteger,
    nId_Cartera: isInteger,
    nId_DocxCobrar: isInteger,
  });


export const isReportarCasoByIdApi =
  createObjectGuard<ReportarCasoByIdApi>({
    nId_DocxCobrarOpeResult: isInteger,
    nId_DocxCobrar: isInteger,
    dDocCobOpe_FecIni: isString,
    cDocOpeCobOut_Descr: isString,
    nId_UsuOpe: isInteger,
    nId_PersDeudor: isInteger,
    nId_Cartera: isInteger,
    nId_Cliente: isInteger,
    dDoc_FecActual: isString,
    cDocParam01: isString,
    cDocParam04: isString,
  });

export const isUpdateReportarCasoResponse =
  createObjectGuard<UpdateReportarCasoResponse>({
    nId_DocxCobrarOpeResult: isInteger,
    nId_Cliente: isInteger,
    nId_Cartera: isInteger,
    nId_DocxCobrar: isInteger,
  });
