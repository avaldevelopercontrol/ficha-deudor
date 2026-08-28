import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  ColumnApi,
  DocumentoApi,
} from '../../../shared/types';
import {
  enrichDocumentoWithDynamicColumns,
  getDocumentoCanonicalDynamicKeys,
  getDocumentoColumnValue,
} from './documentosDynamicKeys';

const columns: ColumnApi[] = [
  {
    key: 'dyn_0',
    label: 'Documento',
    type: 'text',
  },
  {
    key: 'dyn_1',
    label: 'Importe',
    type: 'money',
  },
];

const createDocumento = (
  dynamicValues: Record<string, unknown>
): DocumentoApi => ({
  nId_DocxCobrar: 1,
  mejorStatus: 0,
  nId_Moneda: 1,
  bEstado: 1,
  nZona: 'LIMA',
  bSelected: false,
  nId_Estrategia: 1,
  nId_Cartera: 10,
  ...dynamicValues,
});

export const suite = defineSuite(
  'documentosDynamicKeys',
  [
    test('mantiene la misma correspondencia aunque cambie el orden de propiedades', () => {
      const data = [
        createDocumento({
          numeroDocumento: 'FAC-001',
          importe: 100,
        }),
        createDocumento({
          importe: 200,
          numeroDocumento: 'FAC-002',
        }),
      ];

      const result =
        enrichDocumentoWithDynamicColumns(
          data,
          columns
        );

      assert.equal(result[0].dyn_0, 'FAC-001');
      assert.equal(result[0].dyn_1, 100);
      assert.equal(result[1].dyn_0, 'FAC-002');
      assert.equal(result[1].dyn_1, 200);
    }),
    test('usa la fila más completa y no desplaza valores cuando falta un campo', () => {
      const data = [
        createDocumento({
          numeroDocumento: 'FAC-001',
        }),
        createDocumento({
          numeroDocumento: 'FAC-002',
          importe: 200,
        }),
      ];

      assert.deepEqual(
        getDocumentoCanonicalDynamicKeys(data),
        ['numeroDocumento', 'importe']
      );

      const result =
        enrichDocumentoWithDynamicColumns(
          data,
          columns
        );

      assert.equal(result[0].dyn_0, 'FAC-001');
      assert.equal(result[0].dyn_1, undefined);
      assert.equal(result[1].dyn_0, 'FAC-002');
      assert.equal(result[1].dyn_1, 200);
    }),
    test('lee únicamente el alias enriquecido y no vuelve a inferir por fila', () => {
      const row = createDocumento({
        importe: 200,
        numeroDocumento: 'FAC-002',
        dyn_0: 'FAC-002',
        dyn_1: 200,
      });

      assert.equal(
        getDocumentoColumnValue(row, columns[0]),
        'FAC-002'
      );
      assert.equal(
        getDocumentoColumnValue(row, columns[1]),
        200
      );
    }),
    test('no modifica los registros originales', () => {
      const row = createDocumento({
        numeroDocumento: 'FAC-001',
        importe: 100,
      });

      const result =
        enrichDocumentoWithDynamicColumns(
          [row],
          columns
        );

      assert.notEqual(result[0], row);
      assert.equal(row.dyn_0, undefined);
      assert.equal(row.dyn_1, undefined);
    }),
  ]
);
