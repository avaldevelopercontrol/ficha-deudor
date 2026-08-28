import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { isEmailApi } from './emailsApi.validators';

export const suite = defineSuite('emailsApi.validators', [
  test('acepta campos descriptivos nulos u omitidos', () => {
    assert.equal(
      isEmailApi({
        nId_PersEmail: 10,
        email: 'cliente@example.com',
        fechaActivacion: null,
        estado: null,
        status: null,
        fuente: null,
        baseCliente: null,
        contacto: null,
        prioridad: null,
        comentario: null,
      }),
      true
    );

    assert.equal(
      isEmailApi({
        nId_PersEmail: 11,
      }),
      true
    );
  }),
  test('rechaza tipos incompatibles cuando el campo existe', () => {
    assert.equal(
      isEmailApi({
        nId_PersEmail: 10,
        prioridad: '1',
      }),
      false
    );

    assert.equal(
      isEmailApi({
        nId_PersEmail: '10',
      }),
      false
    );
  }),
]);
