export interface ReportarCasoApi {
  id: number;
  caso: string;
  descripcion: string;
  cartera: string;
  usuario: string;
  fec_Ingreso: string;
}

export interface ReportarCaso {
  id: string;
  caso: string;
  descripcion: string;
  cartera: string;
  usuario: string;
  fechaIngreso: string;
}

export interface ReportarCasoFormData {
  caso: string;
  descripcion: string;
  tipoSiniestro: string;
}

export interface CreateReportarCasoRequest {
  nId_DocxCobrar: number;
  dDocCobOpe_FecIni: string;
  cDocOpeCobOut_Descr: string;
  nId_UsuOpe: number;
  nId_PersDeudor: number;
  nId_Cartera: number;
  nId_Cliente: number;
  dDoc_FecActual: string;
  cDocParam01: string;
  cDocParam04: string;
}

export interface CreateReportarCasoResponse {
  nId_DocxCobrarOpeResult: number;
  nId_Cliente: number;
  nId_Cartera: number;
  nId_DocxCobrar: number;
}


export interface ReportarCasoByIdApi {
  nId_DocxCobrarOpeResult: number;
  nId_DocxCobrar: number;
  dDocCobOpe_FecIni: string;
  cDocOpeCobOut_Descr: string;
  nId_UsuOpe: number;
  nId_PersDeudor: number;
  nId_Cartera: number;
  nId_Cliente: number;
  dDoc_FecActual: string;
  cDocParam01: string;
  cDocParam04: string;
}

export interface UpdateReportarCasoRequest {
  nId_DocxCobrarOpeResult: number;
  nId_DocxCobrar: number;
  dDocCobOpe_FecIni: string;
  cDocOpeCobOut_Descr: string;
  nId_UsuOpe: number;
  nId_PersDeudor: number;
  nId_Cartera: number;
  nId_Cliente: number;
  dDoc_FecActual: string;
  cDocParam01: string;
  cDocParam04: string;
}

export type UpdateReportarCasoResponse = CreateReportarCasoResponse;
