import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Modulo,
} from '../types/opcion.types';

import {
  buildCreateOpcionRequest,
} from './crearOpcion.mapper';

const root: Modulo = {
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
};

export const suite = defineSuite(
  'crearOpcion.mapper',
  [
    test(
      'envía visible en false cuando el nuevo módulo se registra inactivo',
      () => {
        const request =
          buildCreateOpcionRequest(
            {
              nombre: 'Mantener Grupo',
              descripcion:
                'Descripción de prueba',
              codigo: 'mMantenerGrupo',
              icono: '',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 1,
              visible: true,
              estado: false,
            },
            [root],
            '16068',
            new Date(
              '2026-08-05T16:12:59.850Z'
            )
          );

        assert.equal(
          request.bEstado,
          false
        );
        assert.equal(
          request.bVisible,
          false
        );
        assert.equal(
          request.sDescripcionOpcion,
          'Descripción de prueba'
        );
        assert.equal(
          request.sUrlOpcion,
          'root/mMantenerGrupo/'
        );
        assert.equal(
          request.sUrlBI,
          null
        );
        assert.equal(
          request.sEmailOpcion,
          null
        );
        assert.equal(
          request.dFechaCrea,
          '2026-08-05T11:12:59.850'
        );
      }
    ),
    test(
      'permite registrar un módulo sin pantalla React y construye la ruta desde el padre',
      () => {
        const parent: Modulo = {
          ...root,
          idModulo: 30,
          nombre: 'Administración',
          codigo: 'mAdministracion',
          ruta: 'root/mAdministracion/',
          tipo: 2,
          idPadre: 1,
          orden: 1,
        };

        const request =
          buildCreateOpcionRequest(
            {
              nombre: 'Operaciones',
              descripcion:
                'Contenedor pendiente de implementación.',
              codigo: 'mOperaciones',
              icono: '',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 30,
              visible: true,
              estado: true,
            },
            [root, parent],
            '16068',
            new Date(
              '2026-08-05T16:12:59.850Z'
            )
          );

        assert.equal(
          request.sCodigoOpcion,
          'mOperaciones'
        );
        assert.equal(
          request.sUrlOpcion,
          'root/mAdministracion/mOperaciones/'
        );
        assert.equal(
          request.sUrlBI,
          null
        );
        assert.equal(
          request.nId_OpcionPadre,
          30
        );
        assert.equal(
          request.nTipo,
          3
        );
      }
    ),
    test(
      'registra un Power BI debajo de Reportería sin requerir una ruta React propia',
      () => {
        const gestionAnalitica: Modulo = {
          ...root,
          idModulo: 24,
          nombre: 'Gestión Analítica',
          codigo: 'mGestionAnalitica',
          ruta: 'root/mGestionAnalitica/',
          tipo: 2,
          idPadre: 1,
          orden: 9,
        };

        const reporteria: Modulo = {
          ...root,
          idModulo: 25,
          nombre: 'Reportería',
          codigo: 'mReporteria',
          ruta: 'root/mGestionAnalitica/mReporteria/',
          icono: 'client-reports',
          tipo: 3,
          idPadre: 24,
          orden: 2,
        };

        const request = buildCreateOpcionRequest(
          {
            nombre: 'Backus Cobranza',
            descripcion: 'Seguimiento de cobranza.',
            codigo: 'mBackusCobranza',
            icono: 'database',
            esPowerBI: true,
            urlBI: 'https://app.powerbi.com/view?r=demo',
            imagenOpcion: '/imgs_webp/logo-backus.webp',
            emailOpcion: 'ngutierrez@avalperu.com',
            // El mapper debe forzar Reportería aunque el formulario haya quedado con otro padre.
            padreId: 1,
            visible: true,
            estado: true,
          },
          [root, gestionAnalitica, reporteria],
          '16068',
          new Date('2026-08-19T15:00:00.000Z')
        );

        assert.equal(request.nId_OpcionPadre, 25);
        assert.equal(request.nTipo, 4);
        assert.equal(
          request.sUrlOpcion,
          'root/mGestionAnalitica/mReporteria/mBackusCobranza/'
        );
        assert.equal(
          request.sUrlBI,
          'https://app.powerbi.com/view?r=demo'
        );
        assert.equal(
          request.sImagenOpcion,
          '/imgs_webp/logo-backus.webp'
        );
        assert.equal(
          request.sEmailOpcion,
          'ngutierrez@avalperu.com'
        );
        assert.equal(request.sIcono, 'analytics');
      }
    ),
  ]
);
