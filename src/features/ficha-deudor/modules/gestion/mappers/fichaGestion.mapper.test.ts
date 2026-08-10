import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createDocumento, createGestionForm } from '../../../../../test/factories/fichaGestion.factory';
import { buildCreateGestionPayload, buildDocxCobrars } from './fichaGestion.mapper';

export const suite = defineSuite('fichaGestion.mapper', [
  test('construye la lista de documentos sin valores vacíos', () => {
    const documentos = [
      createDocumento(101),
      createDocumento(202),
      createDocumento(303),
    ];
    assert.equal(buildDocxCobrars(documentos), '101,202,303');
  }),
  test('construye el payload completo y normaliza valores', () => {
    const payload = buildCreateGestionPayload({
      form: createGestionForm(),
      idCliente: '1', idCartera: '2', idContrato: '4', idDeudor: '3', idUsuario: '5',
      fechaInicioGestion: '2026-08-04T14:00:00.000Z',
      fechaFinGestion: '2026-08-04T14:17:00.000Z',
      nIdDocxCobrars: '101,202', incluyeCamposClaro: true,
    });

    assert.equal(payload.nId_Cliente, 1);
    assert.equal(payload.nId_DocxCobrars, '101,202');
    assert.equal(payload.cNOMBRECONTACTO, 'Ana Torres');
    assert.equal(payload.nMONTOSOLES, 150.5);
    assert.equal(payload.dFECHACOMPROMISO, '2026-08-10T00:00:00');
    assert.equal(payload.cHORANUEVAGESTION, '14');
    assert.equal(payload.cMINUTONUEVAGESTION, '35');
    assert.equal(payload.dFechaInicioGestion, '2026-08-04T09:00:00.000');
    assert.equal(payload.dFechaFinGestion, '2026-08-04T09:17:00.000');
    assert.equal(payload.nESTADOGESTIONCLARO, 50);
    assert.equal(payload.nMOTIVONOPAGO, 60);
  }),
  test('rechaza identificadores inválidos antes de construir el payload', () => {
    assert.throws(
      () => buildCreateGestionPayload({
        form: createGestionForm(),
        idCliente: 'abc', idCartera: '2', idContrato: '4', idDeudor: '3', idUsuario: '5',
        fechaInicioGestion: '2026-08-04T09:00:00.000',
        fechaFinGestion: '2026-08-04T09:17:00.000',
        nIdDocxCobrars: '101', incluyeCamposClaro: true,
      }),
      /nId_Cliente/
    );
  }),
  test('mantiene cero únicamente para NP2 cuando no aplica', () => {
    const payload = buildCreateGestionPayload({
      form: createGestionForm({ np2: '' }),
      idCliente: '1', idCartera: '2', idContrato: '4', idDeudor: '3', idUsuario: '5',
      fechaInicioGestion: '2026-08-04T09:00:00.000',
      fechaFinGestion: '2026-08-04T09:17:00.000',
      nIdDocxCobrars: '101', incluyeCamposClaro: true,
    });

    assert.equal(payload.nNP2, 0);
  }),
  test('envía cero en campos Claro cuando el cliente no los usa', () => {
    const payload = buildCreateGestionPayload({
      form: createGestionForm(),
      idCliente: '1', idCartera: '2', idContrato: '4', idDeudor: '3', idUsuario: '5',
      fechaInicioGestion: '2026-08-04T09:00:00.000',
      fechaFinGestion: '2026-08-04T09:17:00.000',
      nIdDocxCobrars: '101', incluyeCamposClaro: false,
    });
    assert.equal(payload.nESTADOGESTIONCLARO, 0);
    assert.equal(payload.nMOTIVONOPAGO, 0);
  }),
]);
