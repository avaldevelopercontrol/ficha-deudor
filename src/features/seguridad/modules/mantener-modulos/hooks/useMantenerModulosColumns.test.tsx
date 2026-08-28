import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import Table from '@shared/components/table/Table';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  useMantenerModulosColumns,
} from './useMantenerModulosColumns';

const row: Modulo = {
  idModulo: 10,
  nombre: 'Mantener perfil',
  descripcion: '',
  codigo: 'mAdministrarPerfiles',
  ruta: 'root/mSeguridad/mAdministrarPerfiles/',
  urlBI: null,
  imagenOpcion: null,
  icono: '',
  tipo: 3,
  idPadre: 2,
  codigoPadre: 'mSeguridad',
  padre: 'Seguridad',
  orden: 1,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  implementacion: 'IMPLEMENTADO',
};

const ColumnsTable = () => {
  const columns =
    useMantenerModulosColumns();

  return (
    <Table
      columns={columns}
      data={[row]}
      allData={[row]}
      enableColumnFilters
      fitToPanel
    />
  );
};

const StructureColumnsTable = () => {
  const structureRow: Modulo = {
    ...row,
    idModulo: 24,
    nombre:
      'Inteligencia de Negocio',
    codigo:
      'mInteligenciaDeNegocio',
    ruta:
      'root/mInteligenciaDeNegocio/',
    tipo: 2,
    idPadre: 1,
    codigoPadre: 'Root',
    padre: 'Root',
    orden: 9,
    implementacion: 'AGRUPADOR',
  };

  const childRow: Modulo = {
    ...row,
    idModulo: 23,
    nombre:
      'Portfolio Control Center',
    codigo:
      'mPortfolioControlCenter',
    ruta:
      'root/mInteligenciaDeNegocio/mPortfolio-control-center/',
    tipo: 3,
    idPadre: 24,
    codigoPadre:
      'mInteligenciaDeNegocio',
    padre:
      'Inteligencia de Negocio',
    orden: 1,
  };

  const modulos = [
    structureRow,
    childRow,
  ];

  const columns =
    useMantenerModulosColumns();

  return (
    <Table
      columns={columns}
      data={[structureRow]}
      allData={modulos}
      fitToPanel
    />
  );
};

const PendingScreenColumnsTable = () => {
  const pendingRow: Modulo = {
    ...row,
    idModulo: 14,
    nombre: 'Cartera',
    codigo: 'mCartera',
    ruta:
      'root/mGestionDeCobranzas/mCartera/',
    tipo: 3,
    idPadre: 4,
    codigoPadre:
      'mGestionDeCobranzas',
    padre:
      'Gestión de cobranzas',
    orden: 2,
    implementacion: 'SIN IMPLEMENTAR',
    estadoActivo: false,
    estado: 'Inactivo',
  };

  const columns =
    useMantenerModulosColumns();

  return (
    <Table
      columns={columns}
      data={[pendingRow]}
      allData={[pendingRow]}
      fitToPanel
    />
  );
};

export const suite = defineSuite(
  'columnas de mantener módulos',
  [
    test(
      'oculta código y ruta, y mantiene el tipo de implementación',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable />
          );

        assert.match(html, />Id</);
        assert.match(html, />Nombre</);
        assert.doesNotMatch(
          html,
          />Código</
        );
        assert.doesNotMatch(
          html,
          />Ruta</
        );
        assert.match(html, />Padre</);
        assert.match(html, />Nivel</);
        assert.match(
          html,
          />Implementación</
        );
        assert.match(
          html,
          /placeholder="Implementación"/
        );
        assert.match(
          html,
          /IMPLEMENTADO/
        );
        assert.match(html, />Visible</);
        assert.match(html, />Estado</);
        assert.match(html, />Editar</);
      }
    ),

    test(
      'distingue un contenedor de una pantalla pendiente',
      () => {
        const structureHtml =
          renderToStaticMarkup(
            <StructureColumnsTable />
          );

        const pendingHtml =
          renderToStaticMarkup(
            <PendingScreenColumnsTable />
          );

        assert.match(
          structureHtml,
          /AGRUPADOR/
        );
        assert.match(
          pendingHtml,
          /SIN IMPLEMENTAR/
        );
      }
    ),
  ]
);
