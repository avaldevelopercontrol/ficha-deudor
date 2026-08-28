import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import {
  mapGestionEstadoClaro,
  mapGestionEstados,
  mapGestionMotivoNoPago,
  mapGestionPaletaRespuesta,
  mapGestionTipos,
} from './fichaGestionCatalogos.mapper';

export const suite = defineSuite('fichaGestionCatalogos.mapper', [
  test('convierte estados y tipos a opciones con identificadores de texto', () => {
    assert.deepEqual(
      mapGestionEstados([
        {
          nId_OpeCodCliOut: 10,
          cNombre_OpeCodCliOut: 'CONTACTADO',
        },
      ]),
      [{ id: '10', nombre: 'CONTACTADO' }]
    );

    assert.deepEqual(
      mapGestionTipos([
        {
          nId_TipoGestion: 3,
          cNomTipoGestion: 'TELEFÓNICA',
        },
      ]),
      [{ id: '3', nombre: 'TELEFÓNICA' }]
    );
  }),
  test('conserva el tipo de contacto y normaliza su ausencia como null', () => {
    assert.deepEqual(
      mapGestionPaletaRespuesta([
        {
          nId_OpeCodCliOut: 101,
          cNombre_OpeCodCliOut: 'TITULAR',
          nId_TipoContacto: 1,
        },
        {
          nId_OpeCodCliOut: 102,
          cNombre_OpeCodCliOut: 'SIN CONTACTO',
        },
      ]),
      [
        {
          id: '101',
          nombre: 'TITULAR',
          idTipoContacto: 1,
        },
        {
          id: '102',
          nombre: 'SIN CONTACTO',
          idTipoContacto: null,
        },
      ]
    );
  }),
  test('mapea catálogos Claro y tolera respuestas vacías', () => {
    assert.deepEqual(
      mapGestionEstadoClaro([
        {
          nId_OpeCodCliOut: 7,
          cNombre_OpeCodCliOut: 'PROMESA',
        },
      ]),
      [{ id: '7', nombre: 'PROMESA' }]
    );
    assert.deepEqual(
      mapGestionMotivoNoPago([
        {
          nId_MotivoNoPago: 9,
          cNombreMotivoNoPago: 'SIN LIQUIDEZ',
        },
      ]),
      [{ id: '9', nombre: 'SIN LIQUIDEZ' }]
    );
    assert.deepEqual(mapGestionEstados(null), []);
    assert.deepEqual(mapGestionTipos(undefined), []);
    assert.deepEqual(mapGestionPaletaRespuesta(null), []);
  }),
]);
