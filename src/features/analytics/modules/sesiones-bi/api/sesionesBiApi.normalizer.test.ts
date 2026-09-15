import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  SesionBiDetailApiResponse,
  SesionesBiPanelApiResponse,
} from './sesionesBiApi.types';
import {
  normalizeSesionBiDetailApiResponse,
  normalizeSesionesBiPanelApiResponse,
} from './sesionesBiApi.normalizer';

const SESSION = {
  idSesion: 'session-1',
  idUsuario: 7,
  usuarioLogin: 'jperez',
  usuarioNombre: 'Junior Pérez',
  idOpcionReporte: 47,
  reporteNombre: 'Cartera',
  idCliente: 5,
  clienteNombre: 'Cliente A',
  fechaInicioUtc: '2026-09-15T12:00:00Z',
  fechaUltimoHeartbeatUtc: '2026-09-15T12:05:00Z',
  fechaFinUtc: null,
  segundosVisibles: 240,
  estaVisible: true,
  estado: 'ACTIVA' as const,
  motivoCierre: null,
};

const PANEL: SesionesBiPanelApiResponse = {
  desdeUtc: '2026-09-09T05:00:00Z',
  hastaUtc: '2026-09-16T05:00:00Z',
  granularidadTendencia: 'DIA',
  resumen: {
    sesionesActivas: 1,
    totalSesiones: 4,
    usuariosUnicos: 2,
    segundosVisibles: 1200,
    promedioSegundosPorSesion: 300,
  },
  usoReportes: [
    {
      idOpcionReporte: 47,
      reporteNombre: 'Cartera',
      sesiones: 4,
      usuariosUnicos: 2,
      segundosVisibles: 1200,
    },
  ],
  usuariosMayorUso: [],
  tendencia: [],
  catalogos: {
    reportes: [
      {
        id: 47,
        nombre: 'Cartera',
        requiereSeleccionCliente: false,
      },
    ],
    usuarios: [],
    clientes: [],
    estados: ['ACTIVA'],
  },
  sesiones: {
    pagina: 1,
    tamanoPagina: 20,
    total: 1,
    items: [SESSION],
  },
};

export const suite = defineSuite(
  'sesionesBiApi.normalizer',
  [
    test(
      'mapea el transporte del panel al lenguaje del dominio',
      () => {
        const panel = normalizeSesionesBiPanelApiResponse(PANEL);

        assert.equal(panel.summary.activeSessions, 1);
        assert.equal(panel.reportUsage[0]?.reportName, 'Cartera');
        assert.equal(
          panel.catalogs.reports[0]?.requiresClientSelection,
          false
        );
        assert.equal(panel.sessions.items[0]?.sessionId, 'session-1');
        assert.equal(panel.sessions.items[0]?.clientName, 'Cliente A');
      }
    ),
    test(
      'mapea el detalle y preserva la semántica temporal',
      () => {
        const response: SesionBiDetailApiResponse = {
          sesion: SESSION,
          segundosTranscurridos: 360,
          segundosNoVisiblesEstimados: 120,
          eventos: [
            {
              idEvento: 1,
              tipoEvento: 'OPEN',
              fechaEventoUtc: '2026-09-15T12:00:00Z',
              segundosVisibles: 0,
              origen: 'POWER_BI',
              detalle: null,
            },
          ],
        };
        const detail = normalizeSesionBiDetailApiResponse(response);

        assert.equal(detail.elapsedSeconds, 360);
        assert.equal(detail.estimatedHiddenSeconds, 120);
        assert.equal(detail.events[0]?.eventType, 'OPEN');
      }
    ),
  ]
);
