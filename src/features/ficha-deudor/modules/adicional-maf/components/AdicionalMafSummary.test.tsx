import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type { AdicionalMaf } from '../types/adicionalMaf.types';
import { AdicionalMafSummary } from './AdicionalMafSummary';

const data: AdicionalMaf = {
  numeroDiasNoContacto: 4,
  fechaUltimoContacto: '2026-09-17T12:43:04.177',
  cantidadTotalVino: 26,
  cantidadTotalPago: 22,
  cantidadTotalVino6Meses: 2,
  cantidadTotalPago6Meses: 0,
  cobertura: 'MEDIA',
  mejoresGestiones: [
    {
      ventanaMeses: 12,
      canal: 1,
      canalNombre: 'CALL',
      idDocxCobrarOpe: 1814811285,
      idDocxCobrar: 236569565,
      fecha: '2026-09-03T12:42:24.257',
      estatus: 'TELF OCUPADO',
      peso: 80,
      telefono: '948225402',
      comentario: 'OCUPADO',
      intentos: 503,
      intentosRobot: 180,
      contactosDirectos: 0,
      origenDireccion: null,
      direccion: null,
    },
    {
      ventanaMeses: 12,
      canal: 2,
      canalNombre: 'CAMPO',
      idDocxCobrarOpe: 0,
      idDocxCobrar: 0,
      fecha: null,
      estatus: 'Sin gestión en el periodo',
      peso: 0,
      telefono: null,
      comentario: null,
      intentos: 0,
      intentosRobot: 0,
      contactosDirectos: 0,
      origenDireccion: null,
      direccion: null,
    },
  ],
  operaciones: [
    {
      operacion: '84011',
      placa: 'M5M372',
      diasAtraso: 62,
      idUbigeo: 1346,
      estadoOperacion: 'Normal',
      avanceCredito: 'Tramo Final',
      direccionLegal: 'CALLE MIGUEL GRAU NUMERO 751',
      distritoLegal: 'MONSEFU',
      provinciaLegal: 'CHICLAYO',
      departamentoLegal: 'Lambayeque',
    },
    {
      operacion: '84012',
      placa: null,
      diasAtraso: 15,
      idUbigeo: 999,
      estadoOperacion: null,
      avanceCredito: 'Tramo Inicial',
      direccionLegal: null,
      distritoLegal: null,
      provinciaLegal: 'LIMA',
      departamentoLegal: 'Lima',
    },
  ],
};

export const suite = defineSuite('AdicionalMafSummary', [
  test('representa la respuesta MAF en una lista semántica de dos columnas', () => {
    const html = renderToStaticMarkup(
      <AdicionalMafSummary data={data} />
    );

    assert.match(html, /adicional-maf-list/);
    assert.match(html, /17\/09\/2026/);
    assert.match(html, /TELF OCUPADO/);
    assert.match(html, /Tel:<\/strong> 948225402/);
    assert.match(html, /DISCADOR 180/);
    assert.match(html, /Sin gestión en el periodo/);
    assert.match(html, /Op\. 84011 \| M5M372/);
    assert.match(html, /Op\. 84012/);
    assert.match(html, /Tramo Inicial/);
    assert.match(html, /Sin información/);
  }),
  test('mantiene las filas esperadas aunque no existan gestiones ni operaciones', () => {
    const html = renderToStaticMarkup(
      <AdicionalMafSummary
        data={{
          ...data,
          fechaUltimoContacto: null,
          cobertura: null,
          mejoresGestiones: [],
          operaciones: [],
        }}
      />
    );

    assert.match(html, /Sin gestión en el periodo/);
    assert.match(html, /Sin operaciones registradas/);
    assert.match(html, /Sin información/);
    assert.match(html, /Mejor Gestión Call \(últimos 12 meses\)/);
    assert.match(html, /Dirección Legal/);
  }),
]);
