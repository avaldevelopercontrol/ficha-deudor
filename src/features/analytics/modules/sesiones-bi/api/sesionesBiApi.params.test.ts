import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  buildSesionBiDetailPath,
  buildSesionesBiPanelPath,
} from './sesionesBiApi.params';

export const suite = defineSuite(
  'sesionesBiApi.params',
  [
    test(
      'construye el panel con filtros opcionales y paginación',
      () => {
        const path = buildSesionesBiPanelPath({
          fromUtc: '2026-09-08T05:00:00.000Z',
          toUtc: '2026-09-15T05:00:00.000Z',
          reportId: 47,
          userId: 12,
          clientId: null,
          status: 'CERRADA',
          order: 'tiempo_desc',
          page: 2,
          pageSize: 20,
        });

        const [, query = ''] = path.split('?');
        const params = new URLSearchParams(query);

        assert.equal(params.get('idOpcionReporte'), '47');
        assert.equal(params.get('idUsuario'), '12');
        assert.equal(params.has('idCliente'), false);
        assert.equal(params.get('estado'), 'CERRADA');
        assert.equal(params.has('busqueda'), false);
        assert.equal(params.get('pagina'), '2');
        assert.equal(params.get('tamanoPagina'), '20');
      }
    ),
    test(
      'codifica el identificador de sesión al construir el detalle',
      () => {
        assert.equal(
          buildSesionBiDetailPath('sesion/BI 01'),
          '/v1/Analitica/PowerBi/Sesiones/sesion%2FBI%2001'
        );
      }
    ),
  ]
);
