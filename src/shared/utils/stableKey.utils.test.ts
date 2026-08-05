import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  createStableKey,
} from './stableKey.utils';

function assert(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const suite = defineSuite(
  'stableKey.utils',
  [
    test(
      'genera la misma clave para la misma secuencia de primitivas',
      () => {
        const first = createStableKey([
          'cliente',
          10,
          true,
          null,
          undefined,
        ]);
        const second = createStableKey([
          'cliente',
          10,
          true,
          null,
          undefined,
        ]);

        assert(
          first === second,
          'La misma secuencia debe producir una clave estable.'
        );
      }
    ),
    test(
      'distingue valores iguales representados con tipos diferentes',
      () => {
        assert(
          createStableKey([1]) !== createStableKey(['1']),
          'Un número no debe compartir clave con su representación textual.'
        );
        assert(
          createStableKey([true]) !== createStableKey(['true']),
          'Un booleano no debe compartir clave con su representación textual.'
        );
      }
    ),
    test(
      'distingue null, undefined y números no finitos',
      () => {
        const keys = new Set([
          createStableKey([null]),
          createStableKey([undefined]),
          createStableKey([Number.NaN]),
          createStableKey([Number.POSITIVE_INFINITY]),
          createStableKey([Number.NEGATIVE_INFINITY]),
        ]);

        assert(
          keys.size === 5,
          'Cada valor especial debe conservar una clave diferente.'
        );
      }
    ),
    test(
      'evita colisiones entre separadores y límites de elementos',
      () => {
        const onePart = createStableKey([
          'cliente|string:10',
        ]);
        const twoParts = createStableKey([
          'cliente',
          '10',
        ]);

        assert(
          onePart !== twoParts,
          'Una cadena compuesta no debe confundirse con varios elementos.'
        );
      }
    ),
    test(
      'cambia la clave cuando cambia cualquier dependencia',
      () => {
        const original = createStableKey([
          10,
          20,
          'activo',
        ]);

        assert(
          original !== createStableKey([11, 20, 'activo']),
          'Debe detectar cambios en la primera dependencia.'
        );
        assert(
          original !== createStableKey([10, 20, 'inactivo']),
          'Debe detectar cambios en la última dependencia.'
        );
        assert(
          original !== createStableKey([10, 20]),
          'Debe detectar cambios en la cantidad de dependencias.'
        );
      }
    ),
  ]
);
