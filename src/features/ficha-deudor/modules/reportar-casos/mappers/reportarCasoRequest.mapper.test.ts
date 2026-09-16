import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  buildCreateReportarCasoRequest,
  buildUpdateReportarCasoRequest,
} from './reportarCasoRequest.mapper';

export const suite = defineSuite('reportarCasoRequest.mapper', [
  test('construye el payload documentado para crear un caso MAF', () => {
    const result = buildCreateReportarCasoRequest(
      '95',
      '156',
      '3001',
      '15458',
      {
        caso: ' Reportar Caso MAF ',
        descripcion: ' Pago no reconocido por el cliente. ',
        tipoSiniestro: ' Pago no Reflejado ',
      },
      new Date('2026-09-16T18:44:23.449Z')
    );

    assert.deepEqual(result, {
      nId_DocxCobrar: 0,
      dDocCobOpe_FecIni: '2026-09-16T13:44:23.449',
      cDocOpeCobOut_Descr: 'Pago no reconocido por el cliente.',
      nId_UsuOpe: 15458,
      nId_PersDeudor: 3001,
      nId_Cartera: 156,
      nId_Cliente: 95,
      dDoc_FecActual: '2026-09-16T13:44:23.449',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Pago no Reflejado',
    });
  }),
  test('construye el payload de edición preservando la identidad del registro', () => {
    const original = {
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

    const result = buildUpdateReportarCasoRequest(
      '59',
      '34359',
      '17524528',
      '15458',
      original,
      {
        caso: ' Reportar Caso MAF ',
        descripcion: ' Descripción editada ',
        tipoSiniestro: ' Extorno de Seguro ',
      },
      new Date('2026-09-16T19:38:44.440Z')
    );

    assert.deepEqual(result, {
      nId_DocxCobrarOpeResult: 161915,
      nId_DocxCobrar: 238796074,
      dDocCobOpe_FecIni: '2026-09-16T13:33:57.907',
      cDocOpeCobOut_Descr: 'Descripción editada',
      nId_UsuOpe: 15458,
      nId_PersDeudor: 17524528,
      nId_Cartera: 34359,
      nId_Cliente: 59,
      dDoc_FecActual: '2026-09-16T14:38:44.440',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Extorno de Seguro',
    });
  }),
  test('rechaza editar un caso que no pertenece al contexto actual', () => {
    const original = {
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

    assert.throws(
      () =>
        buildUpdateReportarCasoRequest(
          '60',
          '34359',
          '17524528',
          '15458',
          original,
          {
            caso: 'Reportar Caso MAF',
            descripcion: 'Descripción editada',
            tipoSiniestro: 'Caso Varios',
          }
        ),
      /no pertenece al contexto actual/i
    );
  })
]);
