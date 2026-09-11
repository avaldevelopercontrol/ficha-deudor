import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Perfil,
} from '../../../types/perfil.types';

import {
  normalizeRegistrarPerfilForm,
  validateRegistrarPerfilForm,
} from './registrarPerfil.validation';

const perfilesExistentes: Perfil[] = [
  {
    idPerfil: 1,
    nombrePerfil: 'Administrador General',
    abreviatura: 'ADM',
    fechaRegistro: '01/09/2026',
    estado: 'Activo',
    produccionOnline: 'Sí',
    historiaDeudor: 'Sí',
  },
  {
    idPerfil: 2,
    nombrePerfil: 'Supervisor',
    abreviatura: 'SUP',
    fechaRegistro: '01/09/2026',
    estado: 'Activo',
    produccionOnline: 'Sí',
    historiaDeudor: 'Sí',
  },
];

export const suite = defineSuite(
  'registrarPerfil.validation',
  [
    test(
      'normaliza espacios exteriores sin mutar el formulario',
      () => {
        const form = {
          nombrePerfil: '  Supervisor  ',
          abreviatura: ' SUP ',
          estado: 1 as const,
        };

        const normalized = normalizeRegistrarPerfilForm(form);

        assert.deepEqual(normalized, {
          nombrePerfil: 'Supervisor',
          abreviatura: 'SUP',
          estado: 1,
        });
        assert.equal(form.nombrePerfil, '  Supervisor  ');
      }
    ),
    test(
      'rechaza campos obligatorios y estados inválidos',
      () => {
        const errors = validateRegistrarPerfilForm({
          nombrePerfil: ' ',
          abreviatura: '',
          estado: 3 as 0,
        });

        assert.equal(
          errors.nombrePerfil,
          'El nombre del perfil es obligatorio.'
        );
        assert.equal(
          errors.abreviatura,
          'La abreviatura es obligatoria.'
        );
        assert.equal(
          errors.estado,
          'El estado seleccionado no es válido.'
        );
      }
    ),
    test(
      'detecta duplicados ignorando mayúsculas, tildes de casing y espacios repetidos',
      () => {
        const errors = validateRegistrarPerfilForm(
          {
            nombrePerfil: ' administrador   general ',
            abreviatura: ' adm ',
            estado: 1,
          },
          { perfilesExistentes }
        );

        assert.equal(
          errors.nombrePerfil,
          'Ya existe un perfil con el mismo nombre.'
        );
        assert.equal(
          errors.abreviatura,
          'Ya existe un perfil con la misma abreviatura.'
        );
      }
    ),
    test(
      'en edición excluye el perfil actual de la validación de duplicados',
      () => {
        const errors = validateRegistrarPerfilForm(
          {
            nombrePerfil: 'Supervisor',
            abreviatura: 'SUP',
            estado: 1,
          },
          {
            perfilesExistentes,
            perfilIdActual: 2,
          }
        );

        assert.deepEqual(errors, {});
      }
    ),
  ]
);
