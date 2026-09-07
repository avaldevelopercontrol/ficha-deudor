import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  parseGestionDeudorApiEnvelope,
  parseGestionDeudorApiPagination,
  parseGestionDeudorApiRecordCollection,
} from './gestionDeudorApiBoundary';

const FALLBACK = 'No se pudo completar la consulta.';

export const suite = defineSuite(
  'gestionDeudorApiBoundary',
  [
    test(
      'acepta envelopes estructurales válidos sin confiar en response',
      () => {
        const envelope = parseGestionDeudorApiEnvelope(
          {
            statusCode: 500,
            messageUser: 'Error controlado',
            response: 'payload-invalido',
          },
          FALLBACK
        );

        assert.equal(envelope.statusCode, 500);
        assert.equal(
          envelope.messageUser,
          'Error controlado'
        );
        assert.equal(
          envelope.response,
          'payload-invalido'
        );
      }
    ),
    test(
      'rechaza envelopes que no son objetos o no tienen statusCode entero',
      () => {
        for (const value of [
          null,
          [],
          'respuesta',
          { statusCode: '200', response: [] },
          { statusCode: 200.5, response: [] },
        ]) {
          assert.throws(
            () =>
              parseGestionDeudorApiEnvelope(
                value,
                FALLBACK
              ),
            /respuesta del servidor no contiene datos válidos/i
          );
        }
      }
    ),

    test(
      'valida metadata paginada antes de usarla para solicitar más páginas',
      () => {
        assert.deepEqual(
          parseGestionDeudorApiPagination(
            {
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 1001,
              totalPages: 2,
            },
            FALLBACK
          ),
          {
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: 1001,
            totalPages: 2,
          }
        );

        assert.deepEqual(
          parseGestionDeudorApiPagination(
            {
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 0,
              totalPages: 0,
            },
            FALLBACK
          ),
          {
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: 0,
            totalPages: 0,
          }
        );
      }
    ),
    test(
      'rechaza metadata paginada ausente, negativa o incoherente',
      () => {
        for (const value of [
          {},
          {
            pageNumber: 0,
            pageSize: 1000,
            totalRecords: 0,
            totalPages: 0,
          },
          {
            pageNumber: 1,
            pageSize: 0,
            totalRecords: 0,
            totalPages: 0,
          },
          {
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: -1,
            totalPages: 0,
          },
          {
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: 1,
            totalPages: 0,
          },
          {
            pageNumber: 3,
            pageSize: 1000,
            totalRecords: 1001,
            totalPages: 2,
          },
        ]) {
          assert.throws(
            () =>
              parseGestionDeudorApiPagination(
                value,
                FALLBACK
              ),
            /respuesta del servidor no contiene datos válidos/i
          );
        }
      }
    ),
    test(
      'normaliza null, objeto único y arreglos de registros',
      () => {
        assert.deepEqual(
          parseGestionDeudorApiRecordCollection(
            null,
            FALLBACK
          ),
          []
        );

        assert.deepEqual(
          parseGestionDeudorApiRecordCollection(
            { id: 1 },
            FALLBACK
          ),
          [{ id: 1 }]
        );

        assert.deepEqual(
          parseGestionDeudorApiRecordCollection(
            [{ id: 1 }, { id: 2 }],
            FALLBACK
          ),
          [{ id: 1 }, { id: 2 }]
        );
      }
    ),
    test(
      'rechaza response ausente, primitivo o con filas no objeto',
      () => {
        for (const response of [
          undefined,
          'fila',
          123,
          [null],
          [{ id: 1 }, false],
        ]) {
          assert.throws(
            () =>
              parseGestionDeudorApiRecordCollection(
                response,
                FALLBACK
              ),
            /respuesta del servidor no contiene datos válidos/i
          );
        }
      }
    ),
  ]
);
