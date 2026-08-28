import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Modulo,
  OpcionApi,
} from '../types/opcion.types';

import {
  buildUpdateOpcionRequests,
} from './actualizarOpcion.mapper';

const createModule = (
  overrides: Partial<Modulo>
): Modulo => ({
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  urlBI: null,
  imagenOpcion: null,
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
  ...overrides,
});

const detail: OpcionApi = {
  nId_Opcion: 2,
  sCodigoOpcion: 'mSeguridad',
  sNombreOpcion: 'Seguridad',
  sDescripcionOpcion:
    'Módulo de seguridad',
  sUrlOpcion: 'root/mSeguridad/',
  sUrlBI: '',
  sIcono: '/candado.ico',
  nTipo: 2,
  nId_OpcionPadre: 1,
  sCodigoOpcionPadre: 'Root',
  sNombreOpcionPadre: 'Root',
  nOrden: 1,
  bVisible: true,
  bEstado: true,
  nCrea: 14931,
  dFechaCrea: '2026-08-03 17:27:12',
  nModifica: 16068,
  dFechaModifica: '2026-08-04 00:00:00',
};

const root = createModule({
  idModulo: 1,
});

const parent = createModule({
  idModulo: 2,
  nombre: 'Seguridad',
  codigo: 'mSeguridad',
  ruta: 'root/mSeguridad/',
  icono: '/candado.ico',
  tipo: 2,
  idPadre: 1,
  codigoPadre: 'Root',
  padre: 'Root',
  orden: 1,
});

const child = createModule({
  idModulo: 6,
  nombre: 'Mantener perfil',
  codigo: 'mMantenerPerfil',
  ruta: 'root/mSeguridad/mMantenerPerfil/',
  tipo: 3,
  idPadre: 2,
  codigoPadre: 'mSeguridad',
  padre: 'Seguridad',
  orden: 1,
});

const inactiveChild: Modulo = {
  ...child,
  visibleActivo: false,
  visible: 'No',
  estadoActivo: false,
  estado: 'Inactivo',
};


const grandchild = createModule({
  idModulo: 9,
  nombre: 'Permisos especiales',
  codigo: 'mPermisosEspeciales',
  ruta:
    'root/mSeguridad/mMantenerPerfil/mPermisosEspeciales/',
  tipo: 4,
  idPadre: 6,
  codigoPadre: 'mMantenerPerfil',
  padre: 'Mantener perfil',
  orden: 1,
});

const inactiveForm = {
  nombre: 'Seguridad',
  descripcion:
    'Módulo de seguridad actualizado',
  codigo: 'mSeguridad',
  icono: '/candado.ico',
  esPowerBI: false,
  urlBI: '',
  imagenOpcion: '',
  padreId: 1,
  orden: 1,
  visible: true,
  estado: false,
};

export const suite = defineSuite(
  'actualizarOpcion.mapper',
  [
    test(
      'rechaza inactivar un padre mientras conserve descendientes activos',
      () => {
        assert.throws(
          () =>
            buildUpdateOpcionRequests(
              detail,
              inactiveForm,
              [
                root,
                parent,
                child,
              ],
              '16068'
            ),
          /primero inactive/i
        );
      }
    ),
    test(
      'permite inactivar el padre después de sus hijos y fuerza visible en false',
      () => {
        const requests =
          buildUpdateOpcionRequests(
            detail,
            inactiveForm,
            [
              root,
              parent,
              inactiveChild,
            ],
            '16068',
            new Date(
              '2026-08-05T16:18:55.053Z'
            )
          );

        const parentRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 2
          );

        assert.ok(parentRequest);
        assert.equal(
          parentRequest.bEstado,
          false
        );
        assert.equal(
          parentRequest.bVisible,
          false
        );
        assert.equal(
          parentRequest.sDescripcionOpcion,
          'Módulo de seguridad actualizado'
        );
        assert.equal(
          parentRequest.dFechaModifica,
          '2026-08-05T11:18:55.053'
        );
      }
    ),
    test(
      'actualiza las rutas de todos los descendientes cuando cambia el código del padre',
      () => {
        const requests =
          buildUpdateOpcionRequests(
            detail,
            {
              nombre: 'Seguridad',
              descripcion:
                'Módulo de seguridad',
              codigo:
                'mSeguridadAdministrativa',
              icono: '/candado.ico',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 1,
              orden: 1,
              visible: true,
              estado: true,
            },
            [
              root,
              parent,
              child,
              grandchild,
            ],
            '16068',
            new Date(
              '2026-08-05T16:18:55.053Z'
            )
          );

        assert.deepEqual(
          requests.map(
            (request) =>
              request.nId_Opcion
          ),
          [2, 6, 9]
        );

        const parentRequest =
          requests[0];
        const childRequest =
          requests[1];
        const grandchildRequest =
          requests[2];

        assert.equal(
          parentRequest.sUrlOpcion,
          'root/mSeguridadAdministrativa/'
        );
        assert.equal(
          childRequest.sUrlOpcion,
          'root/mSeguridadAdministrativa/mMantenerPerfil/'
        );
        assert.equal(
          grandchildRequest.sUrlOpcion,
          'root/mSeguridadAdministrativa/mMantenerPerfil/mPermisosEspeciales/'
        );
        assert.equal(
          childRequest.nId_OpcionPadre,
          2
        );
        assert.equal(
          grandchildRequest.nId_OpcionPadre,
          6
        );
      }
    ),
    test(
      'fuerza orden 0 para Root aunque el formulario contenga una posición residual',
      () => {
        const rootDetail: OpcionApi = {
          nId_Opcion: 1,
          sCodigoOpcion: 'Root',
          sNombreOpcion: 'Root',
          sDescripcionOpcion: '',
          sUrlOpcion: 'root/',
          sUrlBI: '',
          sIcono: '',
          nTipo: 1,
          nId_OpcionPadre: 0,
          nOrden: 0,
          bVisible: true,
          bEstado: true,
          nCrea: 14931,
          dFechaCrea:
            '2026-07-31 10:18:23',
          nModifica: 0,
          dFechaModifica: '',
        };

        const requests =
          buildUpdateOpcionRequests(
            rootDetail,
            {
              nombre: 'Root SISGES',
              descripcion: '',
              codigo: 'RootSisges',
              icono: '',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 0,
              orden: 999,
              visible: true,
              estado: true,
            },
            [
              root,
              parent,
              child,
            ],
            '16068',
            new Date(
              '2026-08-05T16:18:55.053Z'
            )
          );

        const rootRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 1
          );

        assert.ok(rootRequest);
        assert.equal(
          rootRequest.nOrden,
          0
        );
        assert.equal(
          rootRequest.sUrlOpcion,
          'RootSisges/'
        );

        const childRouteRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 6
          );

        assert.ok(childRouteRequest);
        assert.equal(
          childRouteRequest.sUrlOpcion,
          'RootSisges/mSeguridad/mMantenerPerfil/'
        );
      }
    ),
    test(
      'preserva la ruta jerárquica existente cuando se edita sin cambiar padre ni código',
      () => {
        const portfolio = createModule({
          idModulo: 23,
          nombre:
            'Portfolio Control Center',
          codigo:
            'mPortfolioControlCenter',
          ruta:
            'root/mPortfolio-control-center',
          icono: 'analytics',
          tipo: 2,
          idPadre: 1,
          codigoPadre: 'Root',
          padre: 'Root',
          orden: 2,
        });

        const requests =
          buildUpdateOpcionRequests(
            {
              ...detail,
              nId_Opcion: 23,
              sCodigoOpcion:
                'mPortfolioControlCenter',
              sNombreOpcion:
                'Portfolio Control Center',
              sDescripcionOpcion:
                'Monitorea cartera.',
              sUrlOpcion:
                'root/mPortfolio-control-center',
              sIcono: 'analytics',
              nId_OpcionPadre: 1,
              nOrden: 2,
            },
            {
              nombre:
                'Portfolio Control Center',
              descripcion:
                'Monitorea cartera y recuperación.',
              codigo:
                'mPortfolioControlCenter',
              icono: 'analytics',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 1,
              orden: 2,
              visible: true,
              estado: true,
            },
            [root, parent, portfolio],
            '16068'
          );

        const portfolioRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 23
          );

        assert.ok(portfolioRequest);
        assert.equal(
          portfolioRequest.sUrlOpcion,
          'root/mPortfolio-control-center'
        );
      }
    ),
    test(
      'renombra una opción implementada por Id y actualiza su ruta jerárquica sin cambiar nId_Opcion',
      () => {
        const gestionUsuarios = createModule({
          idModulo: 5,
          nombre: 'Gestión de usuarios',
          codigo: 'mGestionDeUsuarios',
          ruta: 'root/mGestionDeUsuarios/',
          tipo: 2,
          idPadre: 1,
          codigoPadre: 'Root',
          padre: 'Root',
          orden: 4,
        });

        const mantenerUsuario = createModule({
          idModulo: 20,
          nombre: 'Mantener usuario',
          codigo: 'mMantenerUsuario',
          ruta: 'root/mGestionDeUsuarios/mMantenerUsuario/',
          tipo: 3,
          idPadre: 5,
          codigoPadre: 'mGestionDeUsuarios',
          padre: 'Gestión de usuarios',
          orden: 3,
        });

        const request = buildUpdateOpcionRequests(
          {
            ...detail,
            nId_Opcion: 20,
            sCodigoOpcion: 'mMantenerUsuario',
            sNombreOpcion: 'Mantener usuario',
            sDescripcionOpcion: 'Consulta usuarios.',
            sUrlOpcion: 'root/mGestionDeUsuarios/mMantenerUsuario/',
            sIcono: 'user',
            nTipo: 3,
            nId_OpcionPadre: 5,
            sCodigoOpcionPadre: 'mGestionDeUsuarios',
            sNombreOpcionPadre: 'Gestión de usuarios',
            nOrden: 3,
          },
          {
            nombre: 'Administrar usuarios',
            descripcion: 'Consulta usuarios.',
            codigo: 'mAdministrarUsuarios',
            icono: 'user',
            esPowerBI: false,
            urlBI: '',
            imagenOpcion: '',
            padreId: 5,
            orden: 3,
            visible: true,
            estado: true,
          },
          [root, gestionUsuarios, mantenerUsuario],
          '16068'
        ).at(-1);

        assert.ok(request);
        assert.equal(request.nId_Opcion, 20);
        assert.equal(request.sCodigoOpcion, 'mAdministrarUsuarios');
        assert.equal(
          request.sUrlOpcion,
          'root/mGestionDeUsuarios/mAdministrarUsuarios/'
        );
      }
    ),
    test(
      'mueve un módulo padre con sus hijos preservando el segmento de ruta configurado en base de datos',
      () => {
        const portfolio = createModule({
          idModulo: 23,
          nombre:
            'Portfolio Control Center',
          codigo:
            'mPortfolioControlCenter',
          ruta:
            'root/mPortfolio-control-center',
          icono: 'analytics',
          tipo: 2,
          idPadre: 1,
          codigoPadre: 'Root',
          padre: 'Root',
          orden: 2,
        });

        const portfolioChild =
          createModule({
            idModulo: 24,
            nombre: 'Detalle portfolio',
            codigo: 'mDetallePortfolio',
            ruta:
              'root/mPortfolio-control-center/mDetallePortfolio/',
            tipo: 3,
            idPadre: 23,
            codigoPadre:
              'mPortfolioControlCenter',
            padre:
              'Portfolio Control Center',
            orden: 1,
          });

        const portfolioDetail: OpcionApi = {
          nId_Opcion: 23,
          sCodigoOpcion:
            'mPortfolioControlCenter',
          sNombreOpcion:
            'Portfolio Control Center',
          sDescripcionOpcion:
            'Monitorea cartera.',
          sUrlOpcion:
            'root/mPortfolio-control-center',
          sUrlBI: '',
          sIcono: 'analytics',
          nTipo: 2,
          nId_OpcionPadre: 1,
          sCodigoOpcionPadre: 'Root',
          sNombreOpcionPadre: 'Root',
          nOrden: 2,
          bVisible: true,
          bEstado: true,
          nCrea: 16068,
          dFechaCrea:
            '2026-08-12 16:03:19',
          nModifica: 0,
          dFechaModifica: '',
        };

        const requests =
          buildUpdateOpcionRequests(
            portfolioDetail,
            {
              nombre:
                'Portfolio Control Center',
              descripcion:
                'Monitorea cartera.',
              codigo:
                'mPortfolioControlCenter',
              icono: 'analytics',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 2,
              orden: 2,
              visible: true,
              estado: true,
            },
            [
              root,
              parent,
              portfolio,
              portfolioChild,
            ],
            '16068',
            new Date(
              '2026-08-18T20:00:00.000Z'
            )
          );

        const portfolioRequests =
          requests.filter(
            (request) =>
              request.nId_Opcion === 23
          );

        assert.ok(
          portfolioRequests.length >= 1
        );

        const finalPortfolioRequest =
          portfolioRequests.at(-1);

        assert.ok(finalPortfolioRequest);
        assert.equal(
          finalPortfolioRequest.sCodigoOpcion,
          'mPortfolioControlCenter'
        );
        assert.equal(
          finalPortfolioRequest.sUrlOpcion,
          'root/mSeguridad/mPortfolio-control-center/'
        );
        assert.equal(
          finalPortfolioRequest.nId_OpcionPadre,
          2
        );
        assert.equal(
          finalPortfolioRequest.nTipo,
          3
        );

        const childRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 24
          );

        assert.ok(childRequest);
        assert.equal(
          childRequest.sUrlOpcion,
          'root/mSeguridad/mPortfolio-control-center/mDetallePortfolio/'
        );
        assert.equal(
          childRequest.nId_OpcionPadre,
          23
        );
        assert.equal(
          childRequest.nOrden,
          1
        );
        assert.equal(
          childRequest.nTipo,
          4
        );
      }
    ),
    test(
      'actualiza URL e imagen de un Power BI conservando su nId_Opcion y padre Reportería',
      () => {
        const gestionAnalitica = createModule({
          idModulo: 24,
          nombre: 'Gestión Analítica',
          codigo: 'mGestionAnalitica',
          ruta: 'root/mGestionAnalitica/',
          tipo: 2,
          idPadre: 1,
          orden: 9,
        });

        const reporteria = createModule({
          idModulo: 25,
          nombre: 'Reportería',
          codigo: 'mReporteria',
          ruta: 'root/mGestionAnalitica/mReporteria/',
          icono: 'client-reports',
          tipo: 3,
          idPadre: 24,
          orden: 2,
        });

        const powerBi = createModule({
          idModulo: 26,
          nombre: 'Backus Cobranza',
          codigo: 'mBackusCobranza',
          ruta: 'root/mGestionAnalitica/mReporteria/mBackusCobranza/',
          urlBI: 'https://app.powerbi.com/view?r=anterior',
          imagenOpcion: '/imgs_webp/logo-backus-cre.webp',
          emailOpcion: 'anterior@avalperu.com',
          icono: 'analytics',
          tipo: 4,
          idPadre: 25,
          orden: 1,
        });

        const powerBiDetail: OpcionApi = {
          ...detail,
          nId_Opcion: 26,
          sCodigoOpcion: 'mBackusCobranza',
          sNombreOpcion: 'Backus Cobranza',
          sDescripcionOpcion: 'Seguimiento de cobranza.',
          sUrlOpcion: powerBi.ruta,
          sUrlBI: 'https://app.powerbi.com/view?r=anterior',
          sIcono: 'analytics',
          sImagenOpcion: '/imgs_webp/logo-backus-cre.webp',
          sEmailOpcion: 'anterior@avalperu.com',
          nTipo: 4,
          nId_OpcionPadre: 25,
          sCodigoOpcionPadre: 'mReporteria',
          sNombreOpcionPadre: 'Reportería',
          nOrden: 1,
        };

        const request = buildUpdateOpcionRequests(
          powerBiDetail,
          {
            nombre: 'Backus Cobranza',
            descripcion: 'Seguimiento de cobranza.',
            codigo: 'mBackusCobranza',
            icono: 'database',
            esPowerBI: true,
            urlBI: 'https://app.powerbi.com/view?r=nuevo',
            imagenOpcion: '/imgs_webp/logo-backus.webp',
            emailOpcion: 'nuevo@avalperu.com',
            padreId: 25,
            orden: 1,
            visible: true,
            estado: true,
          },
          [root, gestionAnalitica, reporteria, powerBi],
          '16068'
        ).find((item) => item.nId_Opcion === 26);

        assert.ok(request);
        assert.equal(request.nId_Opcion, 26);
        assert.equal(request.nId_OpcionPadre, 25);
        assert.equal(
          request.sUrlBI,
          'https://app.powerbi.com/view?r=nuevo'
        );
        assert.equal(
          request.sImagenOpcion,
          '/imgs_webp/logo-backus.webp'
        );
        assert.equal(
          request.sEmailOpcion,
          'nuevo@avalperu.com'
        );
        assert.equal(
          request.sIcono,
          'analytics'
        );
      }
    ),
  ]
);
