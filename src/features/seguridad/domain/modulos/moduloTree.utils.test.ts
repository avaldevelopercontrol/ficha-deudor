import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  buildModuloChildrenIndex,
  getModuloDescendantIds,
  getModuloDescendantsFromIndex,
} from './moduloTree.utils';

interface TestNode {
  idModulo: number;
  idPadre: number;
}

export const suite = defineSuite(
  'moduloTree.utils',
  [
    test(
      'indexa hijos y obtiene descendientes sin volver a recorrer toda la colección por cada nivel',
      () => {
        const nodes: TestNode[] = [
          { idModulo: 1, idPadre: 0 },
          { idModulo: 2, idPadre: 1 },
          { idModulo: 3, idPadre: 1 },
          { idModulo: 4, idPadre: 2 },
          { idModulo: 5, idPadre: 4 },
        ];
        const index =
          buildModuloChildrenIndex(nodes);

        assert.deepEqual(
          getModuloDescendantsFromIndex(
            1,
            index
          ).map((node) => node.idModulo),
          [2, 3, 4, 5]
        );
        assert.deepEqual(
          [...getModuloDescendantIds(2, nodes)],
          [4, 5]
        );
      }
    ),
    test(
      'evita ciclos y nunca incluye al módulo raíz entre sus propios descendientes',
      () => {
        const nodes: TestNode[] = [
          { idModulo: 1, idPadre: 2 },
          { idModulo: 2, idPadre: 1 },
        ];

        assert.deepEqual(
          [...getModuloDescendantIds(1, nodes)],
          [2]
        );
      }
    ),
  ]
);
