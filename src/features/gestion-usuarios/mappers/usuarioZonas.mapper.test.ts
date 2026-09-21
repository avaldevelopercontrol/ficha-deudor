import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  dedupeUsuarioZonas,
  getUsuarioZonaDiff,
  mapUsuarioZonaAsignada,
  mapUsuarioZonaFaltante,
} from './usuarioZonas.mapper';

import type {
  UsuarioZonaItem,
} from '../modules/asignar-usuario/types/usuarioZonas.types';

const createZona = (
  zona: string,
  overrides: Partial<UsuarioZonaItem> = {}
): UsuarioZonaItem => ({
  idAsignacion: null,
  idUsuario: 16068,
  idCliente: 59,
  zona,
  nombre: `${zona} Zona ${zona}`,
  estado: null,
  ...overrides,
});

export const suite = defineSuite(
  'usuarioZonas.mapper',
  [
    test(
      'normaliza una zona faltante y conserva bEstado=null para crearla mediante POST',
      () => {
        const zona =
          mapUsuarioZonaFaltante(
            {
              zona: '550',
              descripcionZona:
                '550 Lima                ',
              bEstado: null,
              nid_asignacion: null,
            },
            16068,
            59
          );

        assert.deepEqual(zona, {
          idAsignacion: null,
          idUsuario: 16068,
          idCliente: 59,
          zona: '550',
          nombre: '550 Lima',
          estado: null,
        });
      }
    ),

    test(
      'conserva bEstado=false de una zona faltante para identificar una reactivación',
      () => {
        const zona =
          mapUsuarioZonaFaltante(
            {
              zona: '650',
              descripcionZona:
                '650 Callao',
              bEstado: false,
              nid_asignacion: 82450,
            },
            16068,
            59
          );

        assert.equal(
          zona.idAsignacion,
          82450
        );
        assert.equal(
          zona.estado,
          false
        );
      }
    ),

    test(
      'mapea una zona asignada usando la zona como identidad funcional',
      () => {
        const zona =
          mapUsuarioZonaAsignada({
            nid_asignacion: 901,
            nid_usuario: 16068,
            nid_cliente: 59,
            zona: '550',
            bestado: true,
            region: 'Lima',
          });

        assert.deepEqual(zona, {
          idAsignacion: 901,
          idUsuario: 16068,
          idCliente: 59,
          zona: '550',
          nombre: '550 Lima',
          estado: true,
        });
      }
    ),

    test(
      'calcula únicamente altas y bajas reales de zonas',
      () => {
        const iniciales = [
          createZona('100', {
            estado: true,
          }),
          createZona('550', {
            estado: true,
          }),
        ];

        const actuales = [
          iniciales[1]!,
          createZona('650'),
        ];

        const diff = getUsuarioZonaDiff(
          iniciales,
          actuales
        );

        assert.deepEqual(
          diff.agregar.map(
            (zona) => zona.zona
          ),
          ['650']
        );
        assert.deepEqual(
          diff.quitar.map(
            (zona) => zona.zona
          ),
          ['100']
        );
      }
    ),

    test(
      'al deduplicar prefiere la relación activa de la misma zona',
      () => {
        const zonas = dedupeUsuarioZonas([
          createZona('550'),
          createZona('550', {
            idAsignacion: 901,
            estado: true,
            nombre: '550 Lima',
          }),
        ]);

        assert.equal(zonas.length, 1);
        assert.equal(
          zonas[0]?.estado,
          true
        );
        assert.equal(
          zonas[0]?.nombre,
          '550 Lima'
        );
      }
    ),
  ]
);
