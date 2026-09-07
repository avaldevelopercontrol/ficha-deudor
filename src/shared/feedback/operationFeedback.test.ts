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
            action: 'save',
            message:
              'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
          }),
          {
            variant: 'success',
            title: 'Gestión guardada correctamente',
            message:
              'La nueva gestión fue guardada y la tabla de Gestión Realizada se actualizó.',
          }
        );
      }
    ),

    test(
      'construye el mensaje estándar para agendar una gestión',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Gestión',
              gender: 'feminine',
            },
            action: 'schedule',
          }),
          {
            variant: 'success',
            title: 'Gestión agendada correctamente',
            message:
              'La gestión se agendó correctamente.',
          }
        );
      }
    ),

    test(
      'mantiene los mensajes CRUD esperados para teléfono, dirección y email',
      () => {
        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Teléfono',
              gender: 'masculine',
            },
            action: 'update',
          }),
          {
            variant: 'success',
            title: 'Teléfono actualizado correctamente',
            message:
              'Los cambios del teléfono se guardaron correctamente.',
          }
        );

        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Dirección',
              gender: 'feminine',
            },
            action: 'create',
          }),
          {
            variant: 'success',
            title: 'Dirección registrada correctamente',
            message:
              'La nueva dirección ya se encuentra disponible en el listado.',
          }
        );

        assert.deepEqual(
          buildOperationSuccessFeedback({
            entity: {
              label: 'Email',
              gender: 'masculine',
            },
            action: 'create',
          }),
          {
            variant: 'success',
            title: 'Email registrado correctamente',
            message:
              'El nuevo email ya se encuentra disponible en el listado.',
          }
        );
      }
    ),

  ]
);
