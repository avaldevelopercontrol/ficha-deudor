import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import {
  lockModalScroll,
  unlockModalScroll,
} from './modalScrollLock.utils';

interface BrowserFixture {
  bodyStyle: {
    overflow: string;
    paddingRight: string;
    position: string;
    top: string;
  };
}

const withBrowserFixture = (
  run: (fixture: BrowserFixture) => void,
  options: {
    innerWidth?: number;
    clientWidth?: number;
    computedPaddingRight?: string;
    initialOverflow?: string;
    initialPaddingRight?: string;
  } = {}
) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

  const bodyStyle = {
    overflow: options.initialOverflow ?? '',
    paddingRight: options.initialPaddingRight ?? '',
    position: '',
    top: '',
  };

  const body = { style: bodyStyle };
  const documentElement = {
    clientWidth: options.clientWidth ?? 1180,
  };

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      innerWidth: options.innerWidth ?? 1200,
      getComputedStyle: () => ({
        paddingRight: options.computedPaddingRight ?? '4px',
      }),
    },
  });

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      body,
      documentElement,
    },
  });

  try {
    run({ bodyStyle });
  } finally {
    // Cada prueba equilibra sus locks, pero esta llamada adicional es inocua y
    // evita que una aserción futura deje el estado compartido bloqueado.
    unlockModalScroll();

    if (previousWindow) {
      Object.defineProperty(globalThis, 'window', previousWindow);
    } else {
      delete (globalThis as { window?: Window }).window;
    }

    if (previousDocument) {
      Object.defineProperty(globalThis, 'document', previousDocument);
    } else {
      delete (globalThis as { document?: Document }).document;
    }
  }
};

export const suite = defineSuite('modalScrollLock.utils', [
  test('bloquea el scroll sin reposicionar el body y compensa el scrollbar', () => {
    withBrowserFixture(({ bodyStyle }) => {
      lockModalScroll();

      assert.equal(bodyStyle.overflow, 'hidden');
      assert.equal(bodyStyle.paddingRight, '24px');
      assert.equal(bodyStyle.position, '');
      assert.equal(bodyStyle.top, '');

      unlockModalScroll();

      assert.equal(bodyStyle.overflow, '');
      assert.equal(bodyStyle.paddingRight, '');
    });
  }),
  test('respeta los estilos inline previos al restaurar el ultimo modal', () => {
    withBrowserFixture(
      ({ bodyStyle }) => {
        lockModalScroll();
        unlockModalScroll();

        assert.equal(bodyStyle.overflow, 'auto');
        assert.equal(bodyStyle.paddingRight, '6px');
      },
      {
        initialOverflow: 'auto',
        initialPaddingRight: '6px',
        computedPaddingRight: '6px',
      }
    );
  }),
  test('mantiene el bloqueo mientras exista un modal anidado abierto', () => {
    withBrowserFixture(({ bodyStyle }) => {
      lockModalScroll();
      lockModalScroll();

      unlockModalScroll();
      assert.equal(bodyStyle.overflow, 'hidden');

      unlockModalScroll();
      assert.equal(bodyStyle.overflow, '');
    });
  }),
  test('no altera el padding cuando no existe scrollbar vertical', () => {
    withBrowserFixture(
      ({ bodyStyle }) => {
        lockModalScroll();

        assert.equal(bodyStyle.overflow, 'hidden');
        assert.equal(bodyStyle.paddingRight, '7px');

        unlockModalScroll();
        assert.equal(bodyStyle.paddingRight, '7px');
      },
      {
        innerWidth: 1200,
        clientWidth: 1200,
        initialPaddingRight: '7px',
        computedPaddingRight: '7px',
      }
    );
  }),
]);
