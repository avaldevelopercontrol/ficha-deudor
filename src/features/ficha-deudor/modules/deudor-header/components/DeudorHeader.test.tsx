import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../test/testHarness';
import type { CabeceraInfo, DeudorInfo } from '../../../shared/types';
import DeudorHeader from './DeudorHeader';

const deudorData: DeudorInfo = {
  nombreRazonSocial: 'Cliente de prueba',
  dniRuc: '12345678',
  gradoInstruccion: '',
  edad: '',
  contacto: 'contacto@example.com',
  asesorPostVenta: 'Post venta de prueba',
  asesorComercial: 'Comercial de prueba',
  correoApv: 'apv@example.com',
  correoAc: 'ac@example.com',
  clientePorVision: 'Provision de prueba',
  clienteListaBlanca: 'White list de prueba',
  clienteConSinPe: 'Plazo especial de prueba',
};

const cabeceraData: CabeceraInfo = {
  zona: 'UNICA',
  cartera: 'CARTERA',
  campana: 'Campaña',
};

export const suite = defineSuite('DeudorHeader', [
  test('mantiene el campo Contacto visible pero de solo lectura', () => {
    const html = renderToStaticMarkup(
      <DeudorHeader
        idCliente="1"
        deudorData={deudorData}
        cabeceraData={cabeceraData}
        isLoadingCabecera={false}
        cabeceraError={null}
        compact
      />
    );

    assert.match(html, /Contacto:/);
    assert.match(html, /placeholder="Ingresar\.\.\."/);
    assert.match(html, /readOnly=""/);
    assert.match(html, /class="compact-input"/);
  }),
  test('muestra Información Adicional para el cliente MAF 59', () => {
    const html = renderToStaticMarkup(
      <DeudorHeader
        idCliente="59"
        deudorData={deudorData}
        cabeceraData={cabeceraData}
        isLoadingCabecera={false}
        cabeceraError={null}
        compact
      />
    );

    assert.match(html, /Información Adicional/);
    assert.match(html, /deudor-header__maf-additional-fields/);
    assert.match(html, /Reprogramación Cuota Balón:/);
    assert.match(html, /Plazo especial de prueba/);
    assert.match(html, /Refinanciamiento Balón:/);
    assert.match(html, /White list de prueba/);
    assert.match(html, /Refinanciamiento Cuota Normal:/);
    assert.match(html, /Provision de prueba/);

    assert.doesNotMatch(html, /Asesores/);
    assert.doesNotMatch(html, /Post Venta:/);
    assert.doesNotMatch(html, /Comercial:/);
    assert.doesNotMatch(html, /Correo APV:/);
    assert.doesNotMatch(html, /Correo AC:/);
    assert.doesNotMatch(html, /Plazo Especial:/);
    assert.doesNotMatch(html, /White List:/);
    assert.doesNotMatch(html, /Provision:/);
  }),
  test('mantiene Asesores y sus campos para clientes distintos de 59', () => {
    const html = renderToStaticMarkup(
      <DeudorHeader
        idCliente="95"
        deudorData={deudorData}
        cabeceraData={cabeceraData}
        isLoadingCabecera={false}
        cabeceraError={null}
        compact
      />
    );

    assert.match(html, /Asesores/);
    assert.match(html, /Post Venta:/);
    assert.match(html, /Comercial:/);
    assert.match(html, /Correo APV:/);
    assert.match(html, /Correo AC:/);
    assert.match(html, /Plazo Especial:/);
    assert.match(html, /White List:/);
    assert.match(html, /Provision:/);

    assert.doesNotMatch(html, /Información Adicional/);
    assert.doesNotMatch(html, /Reprogramación Cuota Balón:/);
    assert.doesNotMatch(html, /Refinanciamiento Balón:/);
    assert.doesNotMatch(html, /Refinanciamiento Cuota Normal:/);
  }),
]);
