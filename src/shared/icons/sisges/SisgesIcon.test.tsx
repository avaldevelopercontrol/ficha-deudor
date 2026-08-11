import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import SisgesIcon from './SisgesIcon';
import {
  SISGES_ICON_CATALOG,
} from './sisgesIcon.catalog';

export const suite = defineSuite(
  'SisgesIcon',
  [
    test(
      'mantiene una geometría visual distinta por cada icono del catálogo',
      () => {
        const renderedIcons =
          SISGES_ICON_CATALOG.map(
            (icon) => ({
              name: icon.name,
              markup:
                renderToStaticMarkup(
                  <SisgesIcon
                    name={icon.name}
                  />
                ),
            })
          );

        const markupOwners = new Map<
          string,
          string
        >();

        for (const icon of renderedIcons) {
          const previousOwner =
            markupOwners.get(
              icon.markup
            );

          assert.equal(
            previousOwner,
            undefined,
            previousOwner
              ? `Los iconos ${previousOwner} y ${icon.name} comparten la misma geometría.`
              : undefined
          );

          markupOwners.set(
            icon.markup,
            icon.name
          );
        }

        assert.equal(
          markupOwners.size,
          SISGES_ICON_CATALOG.length
        );
      }
    ),
  ]
);
