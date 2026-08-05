import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { defineSuite, test } from '../../../../../test/testHarness';
import { GestionDeudorResultsCard } from './GestionDeudorResultsCard';

export const suite = defineSuite('estados críticos del listado de gestión', [
  test('muestra la carga sin renderizar registros anteriores', () => {
    const html = renderToStaticMarkup(
      <GestionDeudorResultsCard
        columns={[]}
        data={[]}
        isLoading
        pageNumber={1}
        pageSize={10}
        totalRecords={0}
        totalPages={1}
        indiceInicio={0}
        indiceFin={0}
        onRowClick={() => undefined}
        onPageNumberChange={() => undefined}
        onPageSizeChange={() => undefined}
        onOpenProduccionGestorHoy={() => undefined}
        isProduccionGestorHoyDisabled={false}
      />
    );

    assert.match(html, /Buscando deudores/);
    assert.match(html, /0 registro\(s\)/);
  }),
  test('mantiene deshabilitado el acceso a producción sin contexto', () => {
    const html = renderToStaticMarkup(
      <GestionDeudorResultsCard
        columns={[]}
        data={[]}
        isLoading={false}
        pageNumber={1}
        pageSize={10}
        totalRecords={0}
        totalPages={1}
        indiceInicio={0}
        indiceFin={0}
        onRowClick={() => undefined}
        onPageNumberChange={() => undefined}
        onPageSizeChange={() => undefined}
        onOpenProduccionGestorHoy={() => undefined}
        isProduccionGestorHoyDisabled
      />
    );

    assert.match(html, /disabled=""/);
    assert.match(html, /PRODUCCION DEL GESTOR/);
  }),
]);
