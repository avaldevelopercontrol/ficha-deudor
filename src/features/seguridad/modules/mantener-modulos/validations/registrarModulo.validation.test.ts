import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  validateEditarModuloForm,
  validateRegistrarModuloForm,
} from './registrarModulo.validation';

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

const reporteria: Modulo = {
  ...root,
  idModulo: 25,
  nombre: 'Reportería',
  codigo: 'mReporteria',
  ruta: 'root/mGestionAnalitica/mReporteria/',
  icono: 'client-reports',
  tipo: 3,
  idPadre: 24,
  padre: 'Gestión Analítica',
  orden: 2,
};

export const suite = defineSuite(
  'registrarModulo.validation',
  [
    test(
      'rechaza valores de icono que no pertenecen al catálogo',
      () => {
        const errors =
          validateRegistrarModuloForm(
            {
              nombre: 'Mantener Grupo',
              descripcion: '',
              codigo: 'mMantenerGrupo',
              icono: 'ruta-inventada.ico',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 1,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
            }
          );

        assert.equal(
          errors.icono,
          'Seleccione un icono válido del catálogo SISGES.'
        );
      }
    ),
    test(
      'permite registrar un módulo antes de desarrollar su pantalla React',
      () => {
        const errors =
          validateRegistrarModuloForm(
            {
              nombre: 'Administración',
              descripcion:
                'Contenedor pendiente de implementación.',
              codigo: 'mAdministracion',
              icono: '',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 1,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
            }
          );

        assert.deepEqual(
          errors,
          {}
        );
      }
    ),
    test(
      'no exige ni valida orden al editar la opción Root',
      () => {
        const errors =
          validateEditarModuloForm(
            {
              nombre: 'Root',
              descripcion: '',
              codigo: 'Root',
              icono: '',
              esPowerBI: false,
              urlBI: '',
              imagenOpcion: '',
              padreId: 0,
              orden: 999,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
              moduloIdActual: 1,
            }
          );

        assert.equal(
          errors.orden,
          undefined
        );
        assert.deepEqual(errors, {});
      }
    ),
    test(
      'valida la configuración específica de un módulo Power BI',
      () => {
        const validErrors = validateRegistrarModuloForm(
          {
            nombre: 'Backus Cobranza',
            descripcion: '',
            codigo: 'mBackusCobranza',
            icono: 'analytics',
            esPowerBI: true,
            urlBI: 'https://app.powerbi.com/view?r=demo',
            imagenOpcion: '/logos/backus.webp',
            emailOpcion: 'ngutierrez@avalperu.com',
            padreId: 25,
            visible: true,
            estado: true,
          },
          {
            modulosExistentes: [root, reporteria],
          }
        );

        assert.deepEqual(validErrors, {});

        const invalidErrors = validateRegistrarModuloForm(
          {
            nombre: 'Backus Crédito',
            descripcion: '',
            codigo: 'mBackusCredito',
            icono: '',
            esPowerBI: true,
            urlBI: 'javascript:alert(1)',
            imagenOpcion: 'logos/backus.webp',
            emailOpcion: 'correo-invalido',
            padreId: 1,
            visible: true,
            estado: true,
          },
          {
            modulosExistentes: [root, reporteria],
          }
        );

        assert.match(invalidErrors.padreId ?? '', /Reportería/);
        assert.match(invalidErrors.urlBI ?? '', /http o https/);
        assert.match(invalidErrors.imagenOpcion ?? '', /ruta relativa/);
        assert.match(invalidErrors.emailOpcion ?? '', /correo electrónico válido/);

        const missingEmailErrors = validateRegistrarModuloForm(
          {
            nombre: 'Americatel',
            descripcion: '',
            codigo: 'mAmericatel',
            icono: 'analytics',
            esPowerBI: true,
            urlBI: 'https://app.powerbi.com/view?r=demo',
            imagenOpcion: '/logos/entel.webp',
            emailOpcion: '',
            padreId: 25,
            visible: true,
            estado: true,
          },
          {
            modulosExistentes: [root, reporteria],
          }
        );

        assert.match(
          missingEmailErrors.emailOpcion ?? '',
          /obligatorio/
        );
      }
    ),
  ]
);
