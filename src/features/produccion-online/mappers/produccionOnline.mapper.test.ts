import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapClientesProduccionResponse,
  mapPerfilesProduccionResponse,
  mapProduccionResumenResponse,
  mapProvinciasProduccionResponse,
} from './produccionOnline.mapper';

export const suite = defineSuite(
  'produccionOnline.mapper',
  [
    test(
      'normaliza los catálogos de producción y elimina espacios sobrantes',
      () => {
        assert.deepEqual(
          mapProvinciasProduccionResponse([
            {
              nId_Ubigeo: 1379,
              cNombre_Ubigeo: ' Lima ',
            },
          ]),
          [
            {
              id: 1379,
              label: 'Lima',
            },
          ]
        );

        assert.deepEqual(
          mapPerfilesProduccionResponse([
            {
              nid_perfil: 2,
              per_Nombre: 'Gestor Call       ',
            },
          ]),
          [
            {
              id: 2,
              label: 'Gestor Call',
            },
          ]
        );

        assert.deepEqual(
          mapClientesProduccionResponse([
            {
              nId_Cliente: 208,
              cCli_Siglas: ' BBVA ',
            },
          ]),
          [
            {
              id: 208,
              label: 'BBVA',
            },
          ]
        );
      }
    ),
    test(
      'acepta identificadores numéricos enviados como string en catálogos',
      () => {
        assert.deepEqual(
          mapClientesProduccionResponse([
            {
              nId_Cliente: '208',
              cCli_Siglas: 'BBVA',
            },
          ]),
          [
            {
              id: 208,
              label: 'BBVA',
            },
          ]
        );
      }
    ),
    test(
      'descarta elementos inválidos del catálogo sin invalidar los válidos',
      () => {
        assert.deepEqual(
          mapProvinciasProduccionResponse([
            null,
            {
              nId_Ubigeo: 'no-numérico',
              cNombre_Ubigeo: 'Inválida',
            },
            {
              nId_Ubigeo: 1379,
              cNombre_Ubigeo: ' Lima ',
            },
          ]),
          [
            {
              id: 1379,
              label: 'Lima',
            },
          ]
        );
      }
    ),
    test(
      'mapea el resumen a las columnas visibles y genera el Id correlativo',
      () => {
        assert.deepEqual(
          mapProduccionResumenResponse([
            {
              nombresUsu: ' PÉREZ JUAN ',
              clienteNom: ' BBVA ',
              minutosGes: 120,
              contactGes: 30,
              totalesGes: 80,
              contactGesProm: 999,
              porcentContact: 15.5,
            },
          ]),
          [
            {
              id: 1,
              nombres: 'PÉREZ JUAN',
              contactosHora: 15.5,
              totalContactos: 30,
              totalGestiones: 80,
              cartera: 'BBVA',
            },
          ]
        );
      }
    ),
    test(
      'normaliza métricas numéricas recibidas como string',
      () => {
        assert.deepEqual(
          mapProduccionResumenResponse([
            {
              nombresUsu: 'ANA',
              clienteNom: 'BCP',
              contactGes: '12',
              totalesGes: '20',
              porcentContact: '6.5',
            },
          ]),
          [
            {
              id: 1,
              nombres: 'ANA',
              contactosHora: 6.5,
              totalContactos: 12,
              totalGestiones: 20,
              cartera: 'BCP',
            },
          ]
        );
      }
    ),
    test(
      'descarta filas inválidas individualmente y conserva el índice original como Id',
      () => {
        assert.deepEqual(
          mapProduccionResumenResponse([
            {
              nombresUsu: '',
              clienteNom: 'BBVA',
              contactGes: 1,
              totalesGes: 1,
              porcentContact: 1,
            },
            {
              nombresUsu: 'JUAN',
              clienteNom: 'BBVA',
              contactGes: 30,
              totalesGes: 80,
              porcentContact: 15.5,
            },
          ]),
          [
            {
              id: 2,
              nombres: 'JUAN',
              contactosHora: 15.5,
              totalContactos: 30,
              totalGestiones: 80,
              cartera: 'BBVA',
            },
          ]
        );
      }
    ),
    test(
      'rechaza colecciones con una forma raíz inválida',
      () => {
        assert.throws(
          () =>
            mapProduccionResumenResponse({}),
          /resumen de producción recibido no es válido/i
        );
      }
    ),
  ]
);
