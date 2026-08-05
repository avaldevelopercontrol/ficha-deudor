import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  AsignarAccesosPerfilFormData,
  OpcionTreeItem,
} from '../types/asignarAccesosPerfil.types';

import AccesosPerfilPermissionsPanel from './AccesosPerfilPermissionsPanel';

import AccesosPerfilTree from './AccesosPerfilTree';

import AsignarAccesosPerfilErrorSummary from './AsignarAccesosPerfilErrorSummary';

const rootItem: OpcionTreeItem = {
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  icono: '',
  tipo: 1,
  idPadre: 0,
  codigoPadre: '',
  padre: '',
  orden: 0,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  depth: 0,
  treeCode: '1',
  displayLabel:
    'Todas las opciones',
  hasChildren: true,
  isAssignmentTarget: false,
  isPermissionTarget: false,
};

const item: OpcionTreeItem = {
  idModulo: 6,
  nombre: 'Mantener perfil',
  descripcion: '',
  codigo: 'mMantenerPerfil',
  ruta: 'root/mSeguridad/mMantenerPerfil/',
  icono: '',
  tipo: 3,
  idPadre: 1,
  codigoPadre: 'Root',
  padre: 'Root',
  orden: 1,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  depth: 1,
  treeCode: '1',
  displayLabel:
    '1. Mantener perfil',
  hasChildren: false,
  isAssignmentTarget: true,
  isPermissionTarget: true,
};


const secondItem: OpcionTreeItem = {
  ...item,
  idModulo: 7,
  nombre: 'Mantener módulo',
  codigo: 'mMantenerModulo',
  orden: 2,
  treeCode: '2',
  displayLabel:
    '2. Mantener módulo',
};

const parentItem: OpcionTreeItem = {
  ...item,
  idModulo: 2,
  nombre: 'Seguridad',
  codigo: 'mSeguridad',
  tipo: 2,
  idPadre: 1,
  depth: 1,
  treeCode: '1',
  displayLabel: '1. Seguridad',
  hasChildren: true,
  isPermissionTarget: false,
};

const form: AsignarAccesosPerfilFormData = {
  perfilId: 9,
  selectedOptionIds: [6],
  activeOptionId: 6,
  permissionsByOptionId: {
    '6': {
      consultar: true,
      insertar: true,
      editar: true,
      eliminar: true,
      exportar: true,
    },
  },
};

export const suite = defineSuite(
  'controles de asignación de accesos',
  [
    test(
      'muestra Todas las opciones y el estado parcial de su rama',
      () => {
        const html =
          renderToStaticMarkup(
            <AccesosPerfilTree
              items={[
                rootItem,
                item,
                secondItem,
              ]}
              form={form}
              onActivate={() => undefined}
              onToggle={() => undefined}
            />
          );

        assert.match(
          html,
          /Todas las opciones/
        );
        assert.match(
          html,
          /1\. Mantener perfil/
        );
        assert.match(
          html,
          /aria-checked="mixed"/
        );
        assert.match(
          html,
          /checked=""/
        );
      }
    ),
    test(
      'muestra seleccionar todo y los cinco permisos de la opción activa',
      () => {
        const html =
          renderToStaticMarkup(
            <AccesosPerfilPermissionsPanel
              activeOption={item}
              permissionStates={{
                consultar: 'checked',
                insertar: 'checked',
                editar: 'checked',
                eliminar: 'checked',
                exportar: 'checked',
              }}
              selectAllState="checked"
              titleLabel="Seleccionaste:"
              noSelectionMessage="Seleccione una opción"
              selectAllLabel="Seleccionar todo"
              globalHint="Root no se registra"
              containerHint="Es un contenedor automático"
              singleHint="Se aplica solo a esta opción"
              onPermissionChange={() => undefined}
              onSelectAll={() => undefined}
            />
          );

        assert.match(
          html,
          /Seleccionaste:/
        );
        assert.match(
          html,
          /Seleccionar todo/
        );
        assert.match(html, /CONSULTAR/);
        assert.match(html, /INSERTAR/);
        assert.match(html, /EDITAR/);
        assert.match(html, /ELIMINAR/);
        assert.match(html, /EXPORTAR/);
      }
    ),
    test(
      'deshabilita permisos del contenedor y muestra consultar automático',
      () => {
        const html =
          renderToStaticMarkup(
            <AccesosPerfilPermissionsPanel
              activeOption={parentItem}
              permissionStates={{
                consultar: 'checked',
                insertar: 'unchecked',
                editar: 'unchecked',
                eliminar: 'unchecked',
                exportar: 'unchecked',
              }}
              selectAllState="unchecked"
              titleLabel="Seleccionaste:"
              noSelectionMessage="Seleccione una opción"
              selectAllLabel="Seleccionar todo"
              globalHint="Root no se registra"
              containerHint="Se registrará automáticamente con consultar"
              singleHint="Se aplica solo a esta opción"
              onPermissionChange={() => undefined}
              onSelectAll={() => undefined}
            />
          );

        assert.match(
          html,
          /Se registrará automáticamente con consultar/
        );
        assert.match(
          html,
          /disabled=""[^>]*aria-label="CONSULTAR"[^>]*checked=""/
        );
        assert.equal(
          (html.match(/disabled=""/g) ?? []).length,
          6
        );
      }
    ),
    test(
      'muestra la validación con el mismo resumen y sus mensajes visibles',
      () => {
        const html =
          renderToStaticMarkup(
            <AsignarAccesosPerfilErrorSummary
              title="Revise los siguientes campos antes de registrar:"
              errors={{
                perfilId:
                  'Seleccione un perfil.',
                selectedOptionIds:
                  'Seleccione una opción.',
              }}
            />
          );

        assert.match(
          html,
          /Revise los siguientes campos antes de registrar:/
        );
        assert.match(
          html,
          /<ul>/
        );
        assert.match(
          html,
          /Seleccione un perfil\./
        );
        assert.match(
          html,
          /Seleccione una opción\./
        );
      }
    ),
  ]
);
