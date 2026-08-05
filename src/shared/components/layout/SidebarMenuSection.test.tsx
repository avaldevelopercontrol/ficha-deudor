import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  MemoryRouter,
} from 'react-router-dom';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  SidebarMenuSection,
} from './SidebarMenuSection';

export const suite = defineSuite(
  'SidebarMenuSection',
  [
    test(
      'muestra una opción directa sin permiso pero no genera un enlace navegable',
      () => {
        const html =
          renderToStaticMarkup(
            <SidebarMenuSection
              label="Mantener perfil"
              icon={<span>icono</span>}
              isOpen
              items={[]}
              to="/seguridad/mantener-perfil"
              disabled
              onToggle={() => undefined}
            />
          );

        assert.match(
          html,
          /disabled=""/
        );
        assert.match(
          html,
          /aria-disabled="true"/
        );
        assert.doesNotMatch(
          html,
          /href=/
        );
      }
    ),
    test(
      'mantiene visibles los hijos sin consulta y solo enlaza los autorizados',
      () => {
        const html =
          renderToStaticMarkup(
            <MemoryRouter>
              <SidebarMenuSection
                label="Seguridad"
                icon={<span>icono</span>}
                isOpen
                items={[
                  {
                    label:
                      'Mantener perfil',
                    to: '/seguridad/mantener-perfil',
                    disabled: true,
                  },
                  {
                    label:
                      'Mantener módulo',
                    to: '/seguridad/mantener-modulos',
                  },
                ]}
                onToggle={() => undefined}
              />
            </MemoryRouter>
          );

        assert.match(
          html,
          /Mantener perfil/
        );
        assert.match(
          html,
          /app-sidebar__sub-item--disabled/
        );
        assert.doesNotMatch(
          html,
          /href="\/seguridad\/mantener-perfil"/
        );
        assert.match(
          html,
          /href="\/seguridad\/mantener-modulos"/
        );
      }
    ),
  ]
);
