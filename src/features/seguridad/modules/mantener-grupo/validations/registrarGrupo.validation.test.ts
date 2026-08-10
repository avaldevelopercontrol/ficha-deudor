import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  normalizeRegistrarGrupoForm,
  validateRegistrarGrupoForm,
} from './registrarGrupo.validation';

export const suite = defineSuite(
  'registrarGrupo.validation',
  [
    test(
      'normaliza nombre y sigla antes de registrar',
      () => {
        assert.deepEqual(
          normalizeRegistrarGrupoForm({
            nombre: ' Grupo ',
            sigla: ' GR ',
            clienteId: 10,
            estado: true,
          }),
          {
            nombre: 'Grupo',
            sigla: 'GR',
            clienteId: 10,
            estado: true,
          }
        );
      }
    ),
    test(
      'exige nombre, sigla y cliente válido',
      () => {
        const errors =
          validateRegistrarGrupoForm({
            nombre: '   ',
            sigla: '',
            clienteId: '',
            estado: true,
          });

        assert.ok(errors.nombre);
        assert.ok(errors.sigla);
        assert.ok(errors.clienteId);
      }
    ),
    test(
      'acepta un formulario válido',
      () => {
        assert.deepEqual(
          validateRegistrarGrupoForm({
            nombre: 'Grupo',
            sigla: 'GR',
            clienteId: 178,
            estado: false,
          }),
          {}
        );
      }
    ),
  ]
);
