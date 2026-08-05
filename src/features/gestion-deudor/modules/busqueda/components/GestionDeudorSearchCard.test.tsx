import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { defineSuite, test } from '../../../../../test/testHarness';
import { GestionDeudorSearchCard } from './GestionDeudorSearchCard';

const renderCard = ({
  isLoading = false,
  error = null as string | null,
} = {}) => renderToStaticMarkup(
  <GestionDeudorSearchCard
    tipoBusqueda="R"
    valorBusqueda="20123456789"
    isLoading={isLoading}
    error={error}
    onTipoBusquedaChange={() => undefined}
    onValorBusquedaChange={() => undefined}
    onBuscar={() => undefined}
    onLimpiar={() => undefined}
  />
);

export const suite = defineSuite('estados críticos de búsqueda de deudor', [
  test('muestra el estado de búsqueda y deshabilita los controles', () => {
    const html = renderCard({ isLoading: true });

    assert.match(html, /Buscando\.\.\./);
    assert.match(html, /disabled=""/);
  }),
  test('muestra el mensaje de validación o consulta', () => {
    const html = renderCard({ error: 'No se encontró el deudor.' });

    assert.match(html, /gestion-deudor-error/);
    assert.match(html, /No se encontró el deudor/);
  }),
]);
