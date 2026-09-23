import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioOverduePromiseItem,
} from '../domain/promesasCartera.types';
import {
  buildPromesasCarteraVencidasExcelFile,
} from './promesasCarteraVencidasExcel';

const ITEMS: readonly PortfolioOverduePromiseItem[] = [
  {
    promiseId: '901',
    debtorId: '16068',
    debtorName: 'INVERSIONES METCON SAC',
    dueDate: '2026-09-20',
    overdueDays: 3,
    promiseAmount: 1000,
    paidAmount: 250,
    outstandingAmount: 750,
    situationKey: 'partial-payment',
    situationLabel: 'Pago parcial',
    agingKey: '1-3',
    advisorId: '44',
    advisorName: 'ASESOR UNO',
    supervisorId: '9',
    supervisorName: 'SUPERVISOR UNO',
  },
  {
    promiseId: '902',
    debtorId: '16069',
    debtorName: null,
    dueDate: null,
    overdueDays: null,
    promiseAmount: 500,
    paidAmount: 0,
    outstandingAmount: 500,
    situationKey: 'no-payment-recorded',
    situationLabel: 'Sin pago registrado',
    agingKey: 'unclassified',
    advisorId: null,
    advisorName: null,
    supervisorId: null,
    supervisorName: null,
  },
];

export const suite = defineSuite(
  'promesasCarteraVencidasExcel',
  [
    test('genera un XLSX completo con las columnas de la tabla y valores nulos normalizados', async () => {
      const result = buildPromesasCarteraVencidasExcelFile({
        items: ITEMS,
        crmClientId: 95,
        context: {
          businessUnit: 'CLARO CORPORATIVO',
          campaignId: '2026-09',
          subPortfolioId: '602',
        },
        aging: 'all',
        sortKey: 'overdueDays',
        sortDirection: 'desc',
        asOfDate: '2026-09-23',
        updatedAt: '2026-09-23T09:45:00-05:00',
        exportedAt: new Date('2026-09-23T15:20:30.000Z'),
      });

      assert.match(
        result.fileName,
        /^Promesas_Vencidas_Con_Saldo_2026-09-23_Todas_\d{14}\.xlsx$/
      );
      assert.equal(
        result.blob.type,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const bytes = new Uint8Array(await result.blob.arrayBuffer());
      assert.equal(bytes[0], 0x50);
      assert.equal(bytes[1], 0x4b);

      const rawPackage = new TextDecoder().decode(bytes);
      assert.match(rawPackage, /Promesas vencidas con saldo/);
      assert.match(rawPackage, /Exportación completa sin paginación/);
      assert.match(rawPackage, /Deudor/);
      assert.match(rawPackage, /INVERSIONES METCON SAC/);
      assert.match(rawPackage, /Situación/);
      assert.match(rawPackage, /Pago parcial/);
      assert.match(rawPackage, /Sin pago registrado/);
      assert.match(rawPackage, /Vencimiento/);
      assert.match(rawPackage, /Días vencidos/);
      assert.match(rawPackage, /Prometido/);
      assert.match(rawPackage, /Pagado/);
      assert.match(rawPackage, /Pendiente/);
      assert.match(rawPackage, /Asesor/);
      assert.match(rawPackage, /Supervisor/);
      assert.match(rawPackage, /Sin fecha/);
      assert.match(rawPackage, /Sin atribución/);
      assert.match(rawPackage, /Corte: 23\/09\/2026/);
      assert.match(rawPackage, /Registros/);

      const autoFilterIndex = rawPackage.indexOf('<autoFilter');
      const mergeCellsIndex = rawPackage.indexOf('<mergeCells');
      assert.ok(autoFilterIndex >= 0, 'el XLSX debe contener autofiltro');
      assert.ok(mergeCellsIndex >= 0, 'el XLSX debe contener celdas combinadas');
      assert.ok(
        autoFilterIndex < mergeCellsIndex,
        'autoFilter debe aparecer antes de mergeCells según OOXML'
      );
    }),
    test('genera un nombre seguro cuando Analytics no informa fecha de corte', () => {
      const result = buildPromesasCarteraVencidasExcelFile({
        items: [],
        crmClientId: 95,
        context: {
          businessUnit: null,
          campaignId: '2026-09',
          subPortfolioId: null,
        },
        aging: '8-plus',
        sortKey: 'outstandingAmount',
        sortDirection: 'desc',
        asOfDate: null,
        updatedAt: null,
        exportedAt: new Date('2026-09-23T15:20:30.000Z'),
      });

      assert.match(
        result.fileName,
        /^Promesas_Vencidas_Con_Saldo_sin-corte_8_dias_\d{14}\.xlsx$/
      );
    }),
  ]
);
