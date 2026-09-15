import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  parseSesionBiDetailApiResponse,
  parseSesionesBiPanelApiResponse,
} from './sesionesBiApi.validators';

const SESSION = {
  idSesion: 'session-1',
  idUsuario: 7,
  usuarioLogin: 'jperez',
  usuarioNombre: 'Junior Pérez',
  idOpcionReporte: 47,
  reporteNombre: 'Cartera',
  idCliente: null,
  clienteNombre: null,
  fechaInicioUtc: '2026-09-15T12:00:00',
  fechaUltimoHeartbeatUtc: '2026-09-15T12:05:00Z',
  fechaFinUtc: null,
  segundosVisibles: 240,
  estaVisible: true,
  estado: 'ACTIVA',
  motivoCierre: null,
};

const PANEL = {
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
  usuariosMayorUso: [
    {
      idUsuario: 7,
      usuarioLogin: 'jperez',
      usuarioNombre: 'Junior Pérez',
      sesiones: 3,
      reportesUnicos: 1,
      segundosVisibles: 900,
    },
  ],
  tendencia: [
    {
      periodoUtc: '2026-09-15T05:00:00Z',
      sesiones: 4,
      usuariosUnicos: 2,
      segundosVisibles: 1200,
    },
  ],
  catalogos: {
    reportes: [
      {
        id: 47,
        nombre: 'Cartera',
        requiereSeleccionCliente: false,
      },
    ],
    usuarios: [{ id: 7, nombre: 'Junior Pérez' }],
    clientes: [{ id: 5, nombre: 'Cliente A' }],
    estados: ['ACTIVA', 'CERRADA'],
  },
  sesiones: {
    pagina: 1,
    tamanoPagina: 20,
    total: 1,
    items: [SESSION],
  },
};

export const suite = defineSuite(
  'sesionesBiApi.validators',
  [
    test(
      'valida el contrato del panel y normaliza fechas sin zona a UTC',
      () => {
        const parsed = parseSesionesBiPanelApiResponse(PANEL);

        assert.equal(
          parsed.sesiones.items[0]?.fechaInicioUtc,
          '2026-09-15T12:00:00Z'
        );
        assert.equal(parsed.catalogos.reportes[0]?.id, 47);
        assert.equal(parsed.catalogos.estados[1], 'CERRADA');
      }
    ),
    test(
      'rechaza estados de sesión fuera del contrato',
      () => {
        const invalid = {
          ...PANEL,
          sesiones: {
            ...PANEL.sesiones,
            items: [
              {
                ...SESSION,
                estado: 'DESCONOCIDA',
              },
            ],
          },
        };

        assert.throws(
          () => parseSesionesBiPanelApiResponse(invalid),
          /estado no soportado/
        );
      }
    ),
    test(
      'valida el detalle y sus eventos',
      () => {
        const parsed = parseSesionBiDetailApiResponse({
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
        });

        assert.equal(parsed.eventos[0]?.tipoEvento, 'OPEN');
        assert.equal(parsed.segundosTranscurridos, 360);
      }
    ),
  ]
);
