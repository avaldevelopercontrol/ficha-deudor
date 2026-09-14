import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  normalizarPanoramaCarteraTransporte,
  normalizarPromesasVenceHoyTransporte,
  normalizarPromesasVencidasTransporte,
  normalizarRendimientoAsesorTransporte,
  normalizarRendimientoSupervisorTransporte,
  normalizarSeguimientoPromesasTransporte,
} from './centroControlCarteraApi.normalizer';

export const suite = defineSuite(
  'centroControlCarteraApi normalizer',
  [
    test(
      'preserva tasaCumplimientoPromesa null del resumen en lugar de convertirla a undefined',
      () => {
        const result = normalizarPanoramaCarteraTransporte({
          resumen: {
            resumen: {
              tasaCumplimientoPromesa: null,
            },
          },
        });

        assert.equal(result.summary.summary.promiseFulfillmentRate, null);
      }
    ),
    test(
      'preserva tasaCumplimientoPromesa null en rendimiento por supervisor',
      () => {
        const result = normalizarRendimientoSupervisorTransporte({
          supervisores: [
            {
              tasaCumplimientoPromesa: null,
            },
          ],
        });

        assert.equal(result.supervisors[0]?.promiseFulfillmentRate, null);
      }
    ),
    test(
      'normaliza cantidadDeudoresGestionados del rendimiento por supervisor',
      () => {
        const result = normalizarRendimientoSupervisorTransporte({
          supervisores: [
            {
              cantidadDeudoresGestionados: 73,
            },
          ],
        });

        assert.equal(result.supervisors[0]?.managedDebtorCount, 73);

        const legacyResult = normalizarRendimientoSupervisorTransporte({
          supervisores: [{}],
        });
        assert.equal(legacyResult.supervisors[0]?.managedDebtorCount, null);
      }
    ),
    test(
      'preserva idSupervisorPeriodo null en rendimiento por asesor',
      () => {
        const result = normalizarRendimientoAsesorTransporte({
          asesores: [
            {
              idSupervisorPeriodo: null,
            },
          ],
        });

        assert.equal(result.advisors[0]?.periodSupervisorId, null);
      }
    ),
    test(
      'normaliza cantidadDeudoresGestionados del rendimiento por asesor',
      () => {
        const result = normalizarRendimientoAsesorTransporte({
          asesores: [
            {
              cantidadDeudoresGestionados: 121,
            },
          ],
        });

        assert.equal(result.advisors[0]?.managedDebtorCount, 121);

        const legacyResult = normalizarRendimientoAsesorTransporte({
          asesores: [{}],
        });
        assert.equal(legacyResult.advisors[0]?.managedDebtorCount, null);
      }
    ),
    test(
      'preserva idSupervisor null en promesas vencidas',
      () => {
        const result = normalizarPromesasVencidasTransporte({
          resumen: {},
          filtros: {},
          paginacion: {},
          elementos: [
            {
              idSupervisor: null,
            },
          ],
        });

        assert.equal(result.items[0]?.supervisorId, null);
      }
    ),
    test(
      'preserva fechaUltimoPago null en promesas con vencimiento hoy',
      () => {
        const result = normalizarPromesasVenceHoyTransporte({
          resumen: {},
          paginacion: {},
          elementos: [
            {
              fechaUltimoPago: null,
            },
          ],
        });

        assert.equal(result.items[0]?.lastPaymentDate, null);
      }
    ),
    test(
      'mantiene el fallback al nombre normalizado cuando la clave en espanol no existe',
      () => {
        const result = normalizarRendimientoSupervisorTransporte({
          supervisors: [
            {
              promiseFulfillmentRate: 75,
            },
          ],
        });

        assert.equal(result.supervisors[0]?.promiseFulfillmentRate, 75);
      }
    ),
    test(
      'normaliza seguimiento de promesas preservando null y claves operativas',
      () => {
        const result = normalizarSeguimientoPromesasTransporte({
          fechaVencimiento: '2026-09-14',
          resumen: {
            cantidadPromesas: 1,
          },
          estado: [
            {
              clave: 'pagada-fuera-plazo',
              etiqueta: 'Pagada fuera de plazo',
              cantidad: 1,
            },
          ],
          paginacion: {},
          elementos: [
            {
              idPromesa: 4951,
              idDeudor: 18330126,
              nombreDeudor: 'INVERSIONES METCON SAC',
              claveEstado: 'incumplida',
              claveContacto: 'sin-contacto',
              confirmoPago: null,
              idSupervisor: null,
            },
          ],
        });

        assert.equal(result.dueDate, '2026-09-14');
        assert.equal(result.status[0]?.key, 'paid-out-of-range');
        assert.equal(result.items[0]?.statusKey, 'broken');
        assert.equal(result.items[0]?.contactKey, 'no-contact');
        assert.equal(result.items[0]?.paymentConfirmed, null);
        assert.equal(result.items[0]?.supervisorId, null);
      }
    ),
  ]
);
