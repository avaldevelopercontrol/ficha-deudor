import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  isCreateReportarCasoResponse,
  isReportarCasoApi,
  isReportarCasoByIdApi,
  isUpdateReportarCasoResponse,
} from './reportarCasosApi.validators';

const validCase = {
  id: 15,
  caso: 'VALIDACIÓN DOCUMENTARIA',
  descripcion: 'El cliente solicita revisar la documentación.',
  cartera: 'MAF',
  usuario: 'GESTOR 01',
  fec_Ingreso: '2026-09-16T10:30:00',
};

export const suite = defineSuite('reportarCasosApi.validators', [
  test('acepta el contrato documentado de un caso reportado', () => {
    assert.equal(isReportarCasoApi(validCase), true);
  }),
  test('rechaza identificadores y textos con tipos incompatibles', () => {
    assert.equal(isReportarCasoApi({ ...validCase, id: '15' }), false);
    assert.equal(isReportarCasoApi({ ...validCase, descripcion: null }), false);
  }),
  test('valida la respuesta documentada al crear un caso', () => {
    const response = {
      nId_DocxCobrarOpeResult: 77,
      nId_Cliente: 95,
      nId_Cartera: 156,
      nId_DocxCobrar: 0,
    };

    assert.equal(isCreateReportarCasoResponse(response), true);
    assert.equal(
      isCreateReportarCasoResponse({
        ...response,
        nId_DocxCobrarOpeResult: '77',
      }),
      false
    );
  }),
  test('valida el contrato documentado del detalle para editar', () => {
    const detail = {
      nId_DocxCobrarOpeResult: 161915,
      nId_DocxCobrar: 238796074,
      dDocCobOpe_FecIni: '2026-09-16T13:33:57.907',
      cDocOpeCobOut_Descr: 'ACTUALIZACION DE CUOTA',
      nId_UsuOpe: 11765,
      nId_PersDeudor: 17524528,
      nId_Cartera: 34359,
      nId_Cliente: 59,
      dDoc_FecActual: '2026-09-16T13:33:57.907',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Caso Varios',
    };

    assert.equal(isReportarCasoByIdApi(detail), true);
    assert.equal(
      isReportarCasoByIdApi({ ...detail, nId_DocxCobrar: '238796074' }),
      false
    );
  }),
  test('valida la respuesta documentada al editar un caso', () => {
    const response = {
      nId_DocxCobrarOpeResult: 161915,
      nId_Cliente: 59,
      nId_Cartera: 34359,
      nId_DocxCobrar: 238796074,
    };

    assert.equal(isUpdateReportarCasoResponse(response), true);
    assert.equal(
      isUpdateReportarCasoResponse({ ...response, nId_Cliente: '59' }),
      false
    );
  })
]);
