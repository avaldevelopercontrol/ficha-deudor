import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  ModuloMutationState,
} from './moduloMutation.types';
import {
  buildSafeModuloReorderSequence,
} from './moduloReorder.utils';

const createState = (
  idModulo: number,
  orden: number
): ModuloMutationState => ({
  idModulo,
  codigo: `m${idModulo}`,
  nombre: `Módulo ${idModulo}`,
  descripcion: '',
  ruta: `root/m${idModulo}/`,
  urlBI: null,
  imagenOpcion: null,
  emailOpcion: null,
  icono: '',
  tipo: 3,
  idPadre: 10,
  orden,
  visible: true,
  estado: true,
});

export const suite = defineSuite(
  'moduloReorder.utils',
  [
    test(
      'libera primero una posición temporal antes de intercambiar hermanos',
      () => {
        const first = createState(1, 1);
        const current = createState(2, 2);
        const third = createState(3, 3);
        const updatedCurrent = {
          ...current,
          orden: 1,
        };
        const displacedFirst = {
          ...first,
          orden: 2,
        };
        const originals = new Map([
          [1, first],
          [2, current],
          [3, third],
        ]);

        const sequence =
          buildSafeModuloReorderSequence(
            originals,
            [
              updatedCurrent,
              displacedFirst,
            ],
            updatedCurrent
          );

        assert.deepEqual(
          sequence.map((item) => [
            item.idModulo,
            item.orden,
          ]),
          [
            [2, 5],
            [1, 2],
            [2, 1],
          ]
        );
      }
    ),
    test(
      'no introduce una actualización temporal cuando la posición no cambia',
      () => {
        const current = createState(2, 2);
        const updated = {
          ...current,
          nombre: 'Renombrado',
        };

        assert.deepEqual(
          buildSafeModuloReorderSequence(
            new Map([[2, current]]),
            [updated],
            updated
          ),
          [updated]
        );
      }
    ),
  ]
);
