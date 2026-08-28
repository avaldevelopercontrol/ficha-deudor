import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import {
  buildDocumentosBotonesParams,
  buildDocumentosCabeceraParams,
  buildGestionDocumentosParams,
} from './documentosParams.utils';

const toObject = (params: URLSearchParams) =>
  Object.fromEntries(params.entries());

export const suite = defineSuite('documentosParams.utils', [
  test('construye los parámetros exactos para listar documentos', () => {
    const params = buildGestionDocumentosParams({
      idCliente: '95',
      idCartera: '156',
      idDeudor: '3001',
      pageNumber: 2,
      pageSize: 50,
    });

    assert.deepEqual(toObject(params), {
      nId_Cliente: '95',
      nId_Cartera: '156',
      nId_Persdeudor: '3001',
      PageNumber: '2',
      PageSize: '50',
    });
  }),
  test('mantiene los nombres contractuales de botones y cabecera', () => {
    assert.deepEqual(
      toObject(buildDocumentosBotonesParams('95')),
      { id_cliente: '95' }
    );

    assert.deepEqual(
      toObject(
        buildDocumentosCabeceraParams({
          idCliente: '95',
          idContrato: '801',
        })
      ),
      {
        nId_Cliente: '95',
        nId_Contrato: '801',
      }
    );
  }),
]);
