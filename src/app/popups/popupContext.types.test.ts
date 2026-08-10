import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  isFichaDeudorPopupContext,
  isFichaDeudorPopupType,
} from './popupContext.types';

const baseContext = {
  idCliente: '1',
  idDeudor: '2',
  nombre: 'Empresa de prueba',
  documento: '20123456789',
};

export const suite = defineSuite(
  'popupContext.types',
  [
    test(
      'reconoce únicamente los tipos de popup registrados',
      () => {
        assert.equal(
          isFichaDeudorPopupType('email-deudor'),
          true
        );
        assert.equal(
          isFichaDeudorPopupType('lista-gestores'),
          true
        );
        assert.equal(
          isFichaDeudorPopupType('popup-desconocido'),
          false
        );
      }
    ),
    test(
      'valida los contextos completos de cada popup',
      () => {
        assert.equal(
          isFichaDeudorPopupContext(
            'email-deudor',
            {
              ...baseContext,
              idUsuario: '3',
            }
          ),
          true
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'agenda-deudor',
            {
              ...baseContext,
              idCartera: '4',
              idUsuario: '3',
            }
          ),
          true
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'lista-gestores',
            {
              idCliente: '1',
            }
          ),
          true
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'produccion-gestor-hoy',
            {
              idCliente: '1',
              idUsuario: '3',
            }
          ),
          true
        );
      }
    ),
    test(
      'rechaza contextos incompletos o con identificadores inválidos',
      () => {
        assert.equal(
          isFichaDeudorPopupContext(
            'agenda-deudor',
            {
              ...baseContext,
              idCartera: '4',
            }
          ),
          false
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'lista-gestores',
            {
              idCliente: '0',
            }
          ),
          false
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'email-deudor',
            {
              ...baseContext,
              idUsuario: '1.5',
            }
          ),
          false
        );
      }
    ),
    test(
      'rechaza arreglos, valores nulos y propiedades de texto incorrectas',
      () => {
        assert.equal(
          isFichaDeudorPopupContext(
            'lista-gestores',
            null
          ),
          false
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'lista-gestores',
            ['1']
          ),
          false
        );
        assert.equal(
          isFichaDeudorPopupContext(
            'pago-deudor',
            {
              ...baseContext,
              nombre: 123,
              idCartera: '4',
            }
          ),
          false
        );
      }
    ),
  ]
);
