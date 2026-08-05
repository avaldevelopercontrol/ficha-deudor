import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  buildPopupWindowName,
  isPopupContextRequestMessage,
  isPopupContextResponseMessage,
  parsePopupWindowName,
  POPUP_MESSAGING_PROTOCOL_VERSION,
} from './popupMessaging.utils';

const popupId = 'popup-123';
const validContext = {
  idCliente: '1',
};

export const suite = defineSuite(
  'popupMessaging.utils',
  [
    test(
      'construye y analiza un nombre de ventana válido',
      () => {
        const windowName = buildPopupWindowName(
          'lista-gestores',
          popupId
        );

        assert.deepEqual(
          parsePopupWindowName(windowName),
          {
            popupType: 'lista-gestores',
            popupId,
          }
        );
      }
    ),
    test(
      'rechaza nombres de ventana manipulados o incompletos',
      () => {
        assert.equal(
          parsePopupWindowName(
            `otro-prefijo:lista-gestores:${popupId}`
          ),
          null
        );
        assert.equal(
          parsePopupWindowName(
            `avalperu-popup:desconocido:${popupId}`
          ),
          null
        );
        assert.equal(
          parsePopupWindowName(
            `avalperu-popup:lista-gestores:${popupId}:extra`
          ),
          null
        );
      }
    ),
    test(
      'valida solicitudes de contexto con versión tipo e identificadores',
      () => {
        const request = {
          version: POPUP_MESSAGING_PROTOCOL_VERSION,
          type: 'AVALPERU_POPUP_CONTEXT_REQUEST',
          popupId,
          popupType: 'lista-gestores',
        };

        assert.equal(
          isPopupContextRequestMessage(request),
          true
        );
        assert.equal(
          isPopupContextRequestMessage({
            ...request,
            version: 2,
          }),
          false
        );
        assert.equal(
          isPopupContextRequestMessage({
            ...request,
            popupType: 'desconocido',
          }),
          false
        );
      }
    ),
    test(
      'valida respuestas únicamente cuando el contexto coincide con el tipo',
      () => {
        const response = {
          version: POPUP_MESSAGING_PROTOCOL_VERSION,
          type: 'AVALPERU_POPUP_CONTEXT_RESPONSE',
          popupId,
          popupType: 'lista-gestores',
          context: validContext,
        };

        assert.equal(
          isPopupContextResponseMessage(response),
          true
        );
        assert.equal(
          isPopupContextResponseMessage({
            ...response,
            popupType: 'email-deudor',
          }),
          false
        );
      }
    ),
    test(
      'rechaza respuestas con protocolo o contenido inválido',
      () => {
        const response = {
          version: POPUP_MESSAGING_PROTOCOL_VERSION,
          type: 'AVALPERU_POPUP_CONTEXT_RESPONSE',
          popupId,
          popupType: 'lista-gestores',
          context: validContext,
        };

        assert.equal(
          isPopupContextResponseMessage({
            ...response,
            version: 0,
          }),
          false
        );
        assert.equal(
          isPopupContextResponseMessage({
            ...response,
            context: {
              idCliente: 'abc',
            },
          }),
          false
        );
        assert.equal(
          isPopupContextResponseMessage(null),
          false
        );
      }
    ),
  ]
);
