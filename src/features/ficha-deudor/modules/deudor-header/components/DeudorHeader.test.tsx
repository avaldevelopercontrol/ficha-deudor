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
  asesorPostVenta: '',
  asesorComercial: '',
  correoApv: '',
  correoAc: '',
  clientePorVision: '',
  clienteListaBlanca: '',
  clienteConSinPe: '',
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
]);
