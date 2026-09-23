import assert from 'node:assert/strict';
import type {
  ReactElement,
} from 'react';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  ModalRegistrarModuloProps,
} from '../../mantener-modulos/components/ModalRegistrarModulo';

import {
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

import {
  ModalRegistrarBi,
} from './ModalRegistrarBi';

export const suite = defineSuite(
  'ModalRegistrarBi',
  [
    test(
      'configura el registro como Power BI fijo y usa textos propios de Mantener BI',
      () => {
        const element = ModalRegistrarBi({
          isOpen: true,
          canInsert: true,
          modulosExistentes: [],
          onClose: () => undefined,
          onRegistrar: () => undefined,
        }) as ReactElement<ModalRegistrarModuloProps>;

        assert.equal(
          element.props.powerBiOnly,
          true
        );
        assert.equal(
          element.props.title,
          MANTENER_BI_TEXTS.registerTitle
        );
        assert.equal(
          element.props.submitLabel,
          MANTENER_BI_TEXTS.registerSubmitLabel
        );
        assert.equal(
          element.props.insertPermissionMessage,
          MANTENER_BI_TEXTS.addUnavailable
        );
      }
    ),
  ]
);
