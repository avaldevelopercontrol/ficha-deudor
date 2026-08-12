import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

import {
  buildOperationSuccessFeedback,
} from './operationFeedback';

export const suite = defineSuite(
  'operationFeedback',
  [
    test(
      'construye el mensaje estándar para crear una entidad masculina en un listado',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Usuario',
              gender: 'masculine',
            },
            action: 'create',
          }),
          {
            variant: 'success',
            title: 'Usuario registrado correctamente',
            message:
              'El nuevo usuario ya se encuentra disponible en el listado.',
          }
        );
      }
    ),

    test(
      'construye el mensaje estándar para editar una entidad femenina',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Dirección',
              gender: 'feminine',
            },
            action: 'update',
          }),
          {
            variant: 'success',
            title: 'Dirección actualizada correctamente',
            message:
              'Los cambios de la dirección se guardaron correctamente.',
          }
        );
      }
    ),

    test(
      'construye asignaciones plurales sin romper la concordancia',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Accesos por perfil',
              gender: 'masculine',
              number: 'plural',
            },
            action: 'assign',
          }),
          {
            variant: 'success',
            title:
              'Accesos por perfil asignados correctamente',
            message:
              'Los accesos por perfil se asignaron correctamente.',
          }
        );
      }
    ),

    test(
      'permite un mensaje contextual sin perder el título normalizado',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Gestión',
              gender: 'feminine',
            },
            action: 'create',
            context: 'record',
            message:
              'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
          }),
          {
            variant: 'success',
            title: 'Gestión registrada correctamente',
            message:
              'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
          }
        );
      }
    ),
  ]
);
