import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../../test/testHarness';

import FichaGestionContactoFields from './FichaGestionContactoFields';
import FichaGestionEstadoGestorFields from './FichaGestionEstadoGestorFields';
import FichaGestionPaletaFields from './FichaGestionPaletaFields';

export const suite = defineSuite('secciones internas de datos principales de gestión', [
  test('conserva el bloque de contacto y las acciones de teléfono', () => {
    const html = renderToStaticMarkup(
      <FichaGestionContactoFields
        nombreContacto="Ana"
        cargo="Titular"
        telefono="999111222"
        isTelefonoSearchDisabled={false}
        onNombreContactoChange={() => undefined}
        onCargoChange={() => undefined}
        onClearTelefono={() => undefined}
        onOpenTelefonoSearch={() => undefined}
      />
    );

    assert.match(html, /gestion-compact-grid--datos-contacto/);
    assert.match(html, /Nombre Contacto:/);
    assert.match(html, /Cargo:/);
    assert.match(html, /Teléfono/);
    assert.match(html, />Limpiar</);
    assert.match(html, />Buscar</);
  }),

  test('conserva la dependencia visual NP0 → NP1 → NP2', () => {
    const html = renderToStaticMarkup(
      <FichaGestionPaletaFields
        np0=""
        np1=""
        np2=""
        catalogos={{
          np0: {
            options: [{ id: '1', label: 'NP0 A', idTipoContacto: null }],
            isLoading: false,
            error: null,
          },
          np1: {
            options: [],
            isLoading: false,
            error: null,
          },
          np2: {
            options: [],
            isLoading: false,
            error: null,
          },
        }}
        onNP0Change={() => undefined}
        onNP1Change={() => undefined}
        onNP2Change={() => undefined}
      />
    );

    assert.match(html, /gestion-compact-grid--np/);
    assert.match(html, /NP0/);
    assert.match(html, /Primero seleccione NP0/);
    assert.match(html, /Primero seleccione NP1/);
  }),

  test('conserva estado tipo y selector de gestor en el mismo bloque', () => {
    const html = renderToStaticMarkup(
      <FichaGestionEstadoGestorFields
        idCliente="95"
        estadoGestion="1"
        tipoGestion="2"
        gestorId="16068"
        gestorNombre="GESTOR PRUEBA"
        catalogos={{
          estados: {
            options: [{ id: '1', label: 'CONTACTADO' }],
            isLoading: false,
            error: null,
          },
          tipos: {
            options: [{ id: '2', label: 'TELEFÓNICA' }],
            isLoading: false,
            error: null,
          },
        }}
        onEstadoGestionChange={() => undefined}
        onTipoGestionChange={() => undefined}
        onOpenListaGestores={() => undefined}
      />
    );

    assert.match(html, /gestion-compact-grid--resultado-gestor/);
    assert.match(html, /Estado de Gestión/);
    assert.match(html, /Tipo de Gestión/);
    assert.match(html, /Buscar Gestor/);
    assert.match(html, /GESTOR PRUEBA/);
  }),
]);
