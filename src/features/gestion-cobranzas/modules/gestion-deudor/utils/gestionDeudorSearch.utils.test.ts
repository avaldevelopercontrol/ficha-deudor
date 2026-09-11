import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  normalizeGestionDeudorClientId,
  prepareGestionDeudorSearch,
} from './gestionDeudorSearch.utils';

export const suite = defineSuite(
  'gestionDeudorSearch.utils',
  [
    test(
      'normaliza el identificador de cliente para comparar el contexto por valor',
      () => {
        assert.equal(
          normalizeGestionDeudorClientId(' 025 '),
          '25'
        );
        assert.equal(
          normalizeGestionDeudorClientId('0'),
          null
        );
        assert.equal(
          normalizeGestionDeudorClientId('cliente'),
          null
        );
      }
    ),

    test(
      'prepara una solicitud inmutable con la búsqueda normalizada',
      () => {
        const result =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'R',
            valorBusqueda:
              ' 20 123 456 789 ',
            requestId: 7,
          });

        assert.deepEqual(result, {
          status: 'ready',
          request: {
            requestId: 7,
            requestParams: {
              idCliente: '25',
              busqueda: 'R20123456789',
            },
          },
        });
      }
    ),

    test(
      'prepara búsquedas por número de documento y código del cliente con sus prefijos',
      () => {
        const documentSearch =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'T',
            valorBusqueda: 'CE001234',
            requestId: 8,
          });
        const clientCodeSearch =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'C',
            valorBusqueda: 'CLI-001',
            requestId: 9,
          });

        assert.equal(documentSearch.status, 'ready');
        assert.equal(clientCodeSearch.status, 'ready');

        if (
          documentSearch.status !== 'ready' ||
          clientCodeSearch.status !== 'ready'
        ) {
          throw new Error(
            'Se esperaban búsquedas válidas.'
          );
        }

        assert.equal(
          documentSearch.request.requestParams.busqueda,
          'TCE001234'
        );
        assert.equal(
          clientCodeSearch.request.requestParams.busqueda,
          'CCLI-001'
        );
      }
    ),

    test(
      'devuelve el mensaje de validación sin construir una consulta',
      () => {
        const result =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'D',
            valorBusqueda: '123',
            requestId: 8,
          });

        assert.equal(
          result.status,
          'invalid'
        );

        if (result.status !== 'invalid') {
          throw new Error(
            'Se esperaba una búsqueda inválida.'
          );
        }

        assert.match(
          result.message,
          /8 dígitos/i
        );
      }
    ),

    test(
      'no construye una request cuando el contexto de cliente es inválido',
      () => {
        const result =
          prepareGestionDeudorSearch({
            idCliente: '0',
            tipoBusqueda: 'D',
            valorBusqueda: '12345678',
            requestId: 9,
          });

        assert.equal(result.status, 'invalid');

        if (result.status !== 'invalid') {
          throw new Error(
            'Se esperaba una búsqueda inválida.'
          );
        }

        assert.match(
          result.message,
          /identificador del cliente seleccionado no es válido/i
        );
      }
    ),

    test(
      'distingue búsquedas repetidas mediante un identificador incremental',
      () => {
        const first =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'D',
            valorBusqueda: '12345678',
            requestId: 1,
          });
        const second =
          prepareGestionDeudorSearch({
            idCliente: '25',
            tipoBusqueda: 'D',
            valorBusqueda: '12345678',
            requestId: 2,
          });

        assert.equal(first.status, 'ready');
        assert.equal(second.status, 'ready');

        if (
          first.status !== 'ready' ||
          second.status !== 'ready'
        ) {
          throw new Error(
            'Se esperaban solicitudes válidas.'
          );
        }

        assert.notEqual(
          first.request.requestId,
          second.request.requestId
        );
        assert.deepEqual(
          first.request.requestParams,
          second.request.requestParams
        );
      }
    ),
  ]
);
