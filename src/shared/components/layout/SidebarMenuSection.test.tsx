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

const OPEN_SECTIONS = {};

export const suite = defineSuite(
  'SidebarMenuSection',
  [
    test(
      'muestra una opción directa sin permiso pero no genera un enlace navegable',
      () => {
        const html =
          renderToStaticMarkup(
            <MemoryRouter>
              <SidebarMenuSection
                sectionId={10}
                label="Mantener perfil"
                icon={<span>icono</span>}
                items={[]}
                openSections={
                  OPEN_SECTIONS
                }
                to="/seguridad/mantener-perfil"
                disabled
                onToggle={() => undefined}
              />
            </MemoryRouter>
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
                sectionId={2}
                label="Seguridad"
                icon={<span>icono</span>}
                items={[
                  {
                    id: 10,
                    label:
                      'Mantener perfil',
                    to: '/seguridad/mantener-perfil',
                    disabled: true,
                  },
                  {
                    id: 11,
                    label:
                      'Mantener módulo',
                    to: '/seguridad/mantener-modulos',
                  },
                ]}
                openSections={
                  OPEN_SECTIONS
                }
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
    test(
      'renderiza contenedores anidados y conserva navegables sus descendientes',
      () => {
        const html =
          renderToStaticMarkup(
            <MemoryRouter>
              <SidebarMenuSection
                sectionId={2}
                label="Seguridad"
                icon={<span>icono</span>}
                items={[
                  {
                    id: 5,
                    label:
                      'Gestión de usuarios',
                    children: [
                      {
                        id: 20,
                        label:
                          'Mantener usuario',
                        to: '/gestion-usuarios/mantener-usuario',
                      },
                    ],
                  },
                ]}
                openSections={
                  OPEN_SECTIONS
                }
                onToggle={() => undefined}
              />
            </MemoryRouter>
          );

        assert.match(
          html,
          /Gestión de usuarios/
        );
        assert.match(
          html,
          /app-sidebar__submenu--nested/
        );
        assert.match(
          html,
          /href="\/gestion-usuarios\/mantener-usuario"/
        );
      }
    ),
    test(
      'no marca el módulo padre como activo solo por estar expandido',
      () => {
        const html =
          renderToStaticMarkup(
            <MemoryRouter
              initialEntries={[
                '/gestion-usuarios/asignar-usuario',
              ]}
            >
              <SidebarMenuSection
                sectionId={2}
                label="Seguridad"
                icon={<span>icono</span>}
                items={[
                  {
                    id: 10,
                    label:
                      'Mantener perfil',
                    to: '/seguridad/mantener-perfil',
                  },
                ]}
                openSections={
                  OPEN_SECTIONS
                }
                onToggle={() => undefined}
              />
            </MemoryRouter>
          );

        assert.doesNotMatch(
          html,
          /app-sidebar__nav-item app-sidebar__nav-item--parent app-sidebar__nav-item--active/
        );
      }
    ),
    test(
      'marca como activos únicamente el módulo padre y el submódulo de la ruta actual',
      () => {
        const html =
          renderToStaticMarkup(
            <MemoryRouter
              initialEntries={[
                '/seguridad/mantener-modulos',
              ]}
            >
              <SidebarMenuSection
                sectionId={2}
                label="Seguridad"
                icon={<span>icono</span>}
                items={[
                  {
                    id: 10,
                    label:
                      'Mantener perfil',
                    to: '/seguridad/mantener-perfil',
                  },
                  {
                    id: 11,
                    label:
                      'Mantener módulo',
                    to: '/seguridad/mantener-modulos',
                  },
                ]}
                openSections={
                  OPEN_SECTIONS
                }
                onToggle={() => undefined}
              />
            </MemoryRouter>
          );

        assert.match(
          html,
          /app-sidebar__nav-item app-sidebar__nav-item--parent app-sidebar__nav-item--active/
        );
        assert.match(
          html,
          /app-sidebar__sub-item app-sidebar__sub-item--active[^>]*>Mantener módulo/
        );
        assert.doesNotMatch(
          html,
          /app-sidebar__sub-item app-sidebar__sub-item--active[^>]*>Mantener perfil/
        );
      }
    ),
  ]
);
