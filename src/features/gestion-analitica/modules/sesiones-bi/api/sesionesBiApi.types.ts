import type {
  SesionBiEstado,
} from '../domain/sesionesBi.types';

export interface SesionesBiSummaryApiResponse {
  sesionesActivas: number;
  totalSesiones: number;
  usuariosUnicos: number;
  segundosVisibles: number;
  promedioSegundosPorSesion: number;
}

export interface SesionesBiReportUsageApiResponse {
  idOpcionReporte: number;
  reporteNombre: string;
  sesiones: number;
  usuariosUnicos: number;
  segundosVisibles: number;
}

export interface SesionesBiUserUsageApiResponse {
  idUsuario: number;
  usuarioLogin: string;
  usuarioNombre: string;
  sesiones: number;
  reportesUnicos: number;
  segundosVisibles: number;
}

export interface SesionesBiTrendPointApiResponse {
  periodoUtc: string;
  sesiones: number;
  usuariosUnicos: number;
  segundosVisibles: number;
}

export interface SesionesBiFilterOptionApiResponse {
  id: number;
  nombre: string;
}

export interface SesionesBiReportFilterOptionApiResponse
  extends SesionesBiFilterOptionApiResponse {
  requiereSeleccionCliente: boolean;
}

export interface SesionesBiCatalogsApiResponse {
  reportes: SesionesBiReportFilterOptionApiResponse[];
  usuarios: SesionesBiFilterOptionApiResponse[];
  clientes: SesionesBiFilterOptionApiResponse[];
  estados: SesionBiEstado[];
}

export interface SesionBiRowApiResponse {
  idSesion: string;
  idUsuario: number;
  usuarioLogin: string;
  usuarioNombre: string;
  idOpcionReporte: number;
  reporteNombre: string;
  idCliente: number | null;
  clienteNombre: string | null;
  fechaInicioUtc: string;
  fechaUltimoHeartbeatUtc: string;
  fechaFinUtc: string | null;
  segundosVisibles: number;
  estaVisible: boolean;
  estado: SesionBiEstado;
  motivoCierre: string | null;
}

export interface SesionesBiPageApiResponse {
  pagina: number;
  tamanoPagina: number;
  total: number;
  items: SesionBiRowApiResponse[];
}

export interface SesionesBiPanelApiResponse {
  desdeUtc: string;
  hastaUtc: string;
  granularidadTendencia: string;
  resumen: SesionesBiSummaryApiResponse;
  usoReportes: SesionesBiReportUsageApiResponse[];
  usuariosMayorUso: SesionesBiUserUsageApiResponse[];
  tendencia: SesionesBiTrendPointApiResponse[];
  catalogos: SesionesBiCatalogsApiResponse;
  sesiones: SesionesBiPageApiResponse;
}

export interface SesionBiEventApiResponse {
  idEvento: number;
  tipoEvento: string;
  fechaEventoUtc: string;
  segundosVisibles: number;
  origen: string;
  detalle: string | null;
}

export interface SesionBiDetailApiResponse {
  sesion: SesionBiRowApiResponse;
  segundosTranscurridos: number;
  segundosNoVisiblesEstimados: number;
  eventos: SesionBiEventApiResponse[];
}
