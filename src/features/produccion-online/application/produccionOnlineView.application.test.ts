import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  PRODUCCION_ONLINE_DEFAULT_FILTERS,
} from '../constants/produccionOnline.constants';
import {
  buildProduccionOnlineCatalogOptions,
  createDefaultProduccionOnlineFilters,
  createProduccionOnlineFilterDependencies,
} from './produccionOnlineView.application';

export const suite = defineSuite(
  'produccionOnlineView.application',
  [
    test(
      'crea una copia independiente de los filtros predeterminados',
      () => {
        const filters =
          createDefaultProduccionOnlineFilters();

        filters.idCliente = 208;

        assert.equal(
          PRODUCCION_ONLINE_DEFAULT_FILTERS.idCliente,
          0
        );
        assert.deepEqual(
          createDefaultProduccionOnlineFilters(),
          PRODUCCION_ONLINE_DEFAULT_FILTERS
        );
      }
    ),
    test(
      'construye las dependencias remotas en el orden canónico',
      () => {
        assert.deepEqual(
          createProduccionOnlineFilterDependencies({
            idCliente: 208,
            idPerfil: 2,
            idUbigeo: 1379,
            idTipoLlamada: -1,
          }),
          [208, 2, 1379, -1]
        );
      }
    ),
    test(
      'agrega las opciones globales cuando el backend no las devuelve',
      () => {
        assert.deepEqual(
          buildProduccionOnlineCatalogOptions({
            provincias: [
              {
                id: 1379,
                label: 'Lima',
              },
            ],
            perfiles: [
              {
                id: 2,
                label: 'Gestor',
              },
            ],
            clientes: [
              {
                id: 208,
                label: 'BBVA',
              },
            ],
          }),
          {
            provincias: [
              {
                id: 0,
                label: 'Todas las ciudades',
              },
              {
                id: 1379,
                label: 'Lima',
              },
            ],
            perfiles: [
              {
                id: 2,
                label: 'Gestor',
              },
            ],
            clientes: [
              {
                id: 0,
                label: 'Todos los clientes',
              },
              {
                id: 208,
                label: 'BBVA',
              },
            ],
          }
        );
      }
    ),
    test(
      'no duplica opciones globales si ya fueron entregadas por el backend',
      () => {
        const options =
          buildProduccionOnlineCatalogOptions({
            provincias: [
              {
                id: 0,
                label: 'Todas',
              },
            ],
            perfiles: [],
            clientes: [
              {
                id: 0,
                label: 'Todos',
              },
            ],
          });

        assert.equal(
          options.provincias.length,
          1
        );
        assert.equal(
          options.clientes.length,
          1
        );
        assert.equal(
          options.provincias[0]?.label,
          'Todas'
        );
        assert.equal(
          options.clientes[0]?.label,
          'Todos'
        );
      }
    ),
  ]
);
