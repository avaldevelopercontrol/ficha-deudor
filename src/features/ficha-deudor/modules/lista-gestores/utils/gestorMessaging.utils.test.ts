import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  Gestor,
} from '../types/gestor.types';
import {
  buildGestorSeleccionadoMessage,
  GESTOR_SELECTION_PROTOCOL_VERSION,
  isGestorSeleccionadoMessage,
} from './gestorMessaging.utils';

const gestor: Gestor = {
  id: '25',
  nombre: 'Gestor de prueba',
  perfil: 'COBRANZA',
  login: 'gestor25',
  subZona: 'LIMA',
  codRecaudacion: 'REC-25',
};

const popupId = 'popup-gestor-123';

export const suite = defineSuite(
  'gestorMessaging.utils',
  [
    test(
      'construye un mensaje versionado vinculado al popup',
      () => {
        assert.deepEqual(
          buildGestorSeleccionadoMessage(
            gestor,
            popupId
          ),
          {
            version: GESTOR_SELECTION_PROTOCOL_VERSION,
            type: 'GESTOR_SELECTED',
            popupId,
            payload: {
              id: gestor.id,
              nombre: gestor.nombre,
            },
          }
        );
      }
    ),
    test(
      'valida el mensaje y el identificador del popup esperado',
      () => {
        const message =
          buildGestorSeleccionadoMessage(
            gestor,
            popupId
          );

        assert.equal(
          isGestorSeleccionadoMessage(
            message,
            popupId
          ),
          true
        );
        assert.equal(
          isGestorSeleccionadoMessage(
            message,
            'otro-popup'
          ),
          false
        );
      }
    ),
    test(
      'rechaza versiones y payloads manipulados',
      () => {
        const message =
          buildGestorSeleccionadoMessage(
            gestor,
            popupId
          );

        assert.equal(
          isGestorSeleccionadoMessage({
            ...message,
            version: 2,
          }),
          false
        );
        assert.equal(
          isGestorSeleccionadoMessage({
            ...message,
            payload: {
              id: '0',
              nombre: gestor.nombre,
            },
          }),
          false
        );
        assert.equal(
          isGestorSeleccionadoMessage({
            ...message,
            payload: {
              id: gestor.id,
              nombre: '   ',
            },
          }),
          false
        );
      }
    ),
    test(
      'impide construir mensajes con gestor o popup inválido',
      () => {
        assert.throws(() => {
          buildGestorSeleccionadoMessage(
            {
              ...gestor,
              id: 'abc',
            },
            popupId
          );
        });

        assert.throws(() => {
          buildGestorSeleccionadoMessage(
            gestor,
            'popup:invalido'
          );
        });
      }
    ),
  ]
);
