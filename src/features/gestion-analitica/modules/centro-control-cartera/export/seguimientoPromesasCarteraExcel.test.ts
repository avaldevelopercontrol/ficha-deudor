import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  SeguimientoPromesaCarteraItem,
} from '../domain/promesasCartera.types';
import {
  buildSeguimientoPromesasExcelFile,
} from './seguimientoPromesasCarteraExcel';

const ITEMS: readonly SeguimientoPromesaCarteraItem[] = [
  {
    promiseId: '901',
    debtorId: '1200',
    debtorName: 'EMPRESA UNO SAC',
    dueDate: '2026-09-16',
    promiseAmount: 1000,
    paidAmount: 1000,
    outstandingAmount: 0,
    lastPaymentDate: '2026-09-15',
    statusKey: 'fulfilled',
    statusLabel: 'Cumplida',
    managed: true,
    managementCount: 2,
    callCount: 1,
    contactKey: 'direct',
    contactLabel: 'Contacto directo',
    paymentConfirmed: true,
    lastManagementAt: '2026-09-16T10:30:00',
    advisorId: '44',
    advisorName: 'ASESOR UNO',
    supervisorId: '9',
    supervisorName: 'SUPERVISOR UNO',
  },
  {
    promiseId: '902',
    debtorId: '1201',
    debtorName: null,
    dueDate: null,
    promiseAmount: 500,
    paidAmount: 0,
    outstandingAmount: 500,
    lastPaymentDate: null,
    statusKey: 'pending',
    statusLabel: 'Pendiente',
    managed: false,
    managementCount: 0,
    callCount: 0,
    contactKey: 'no-management',
    contactLabel: 'Sin gestión',
    paymentConfirmed: null,
    lastManagementAt: null,
    advisorId: null,
    advisorName: null,
    supervisorId: null,
    supervisorName: null,
  },
];

export const suite = defineSuite(
  'seguimientoPromesasCarteraExcel',
  [
    test('genera un XLSX real con todos los campos y casos nulos', async () => {
      const result = buildSeguimientoPromesasExcelFile({
        items: ITEMS,
        crmClientId: 95,
        context: {
          businessUnit: 'CLARO CORPORATIVO',
          campaignId: '2026-09',
          subPortfolioId: '602',
        },
        period: 'today',
        dueDate: '2026-09-16',
        status: 'all',
        sortKey: 'outstandingAmount',
        sortDirection: 'desc',
        operationAsOfAt: '2026-09-16T09:03:00-05:00',
        exportedAt: new Date('2026-09-16T16:20:30.000Z'),
      });

      assert.match(result.fileName, /^Seguimiento_Promesas_2026-09-16_Todos_\d{14}\.xlsx$/);
      assert.equal(
        result.blob.type,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const bytes = new Uint8Array(await result.blob.arrayBuffer());
      assert.equal(bytes[0], 0x50);
      assert.equal(bytes[1], 0x4b);

      const rawPackage = new TextDecoder().decode(bytes);
      assert.match(rawPackage, /Seguimiento de promesas/);
      assert.match(rawPackage, /Exportación completa sin paginación/);
      assert.match(
        rawPackage,
        /Corte de información: 16\/09\/2026, 09:03 AM/
      );
      assert.match(rawPackage, /Exportado el: 16\/09\/2026, 11:20 AM/);
      assert.match(rawPackage, /Cumplida anticipadamente/);
      assert.match(rawPackage, /Sin gestión hoy/);
      assert.match(rawPackage, /Sin confirmación/);
      assert.match(rawPackage, /Sin asesor/);
      assert.match(rawPackage, /Sin supervisor/);

      const autoFilterIndex = rawPackage.indexOf('<autoFilter');
      const mergeCellsIndex = rawPackage.indexOf('<mergeCells');
      assert.ok(autoFilterIndex >= 0, 'el XLSX debe contener autofiltro');
      assert.ok(mergeCellsIndex >= 0, 'el XLSX debe contener celdas combinadas');
      assert.ok(
        autoFilterIndex < mergeCellsIndex,
        'autoFilter debe aparecer antes de mergeCells según el orden OOXML de Worksheet'
      );
    }),
    test('explicita cuando el corte operativo no está disponible', async () => {
      const result = buildSeguimientoPromesasExcelFile({
        items: [],
        crmClientId: 95,
        context: {
          businessUnit: 'CLARO CORPORATIVO',
          campaignId: '2026-09',
          subPortfolioId: null,
        },
        period: 'today',
        dueDate: '2026-09-16',
        status: 'all',
        sortKey: 'outstandingAmount',
        sortDirection: 'desc',
        operationAsOfAt: null,
        exportedAt: new Date('2026-09-16T16:20:30.000Z'),
      });

      const rawPackage = new TextDecoder().decode(
        new Uint8Array(await result.blob.arrayBuffer())
      );

      assert.match(rawPackage, /Corte de información: No disponible/);
    }),
  ]
);
