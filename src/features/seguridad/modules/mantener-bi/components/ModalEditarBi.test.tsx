import assert from 'node:assert/strict';
import type {
  ReactElement,
} from 'react';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  ModalEditarModuloProps,
} from '../../mantener-modulos/components/ModalEditarModulo';

import {
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

import {
  ModalEditarBi,
} from './ModalEditarBi';

export const suite = defineSuite(
  'ModalEditarBi',
  [
    test(
      'reutiliza el editor de módulos en modo Power BI fijo y con permisos propios',
      () => {
        const element = ModalEditarBi({
          isOpen: true,
          canEdit: true,
          moduloId: 60,
          modulosExistentes: [],
          onClose: () => undefined,
          onGuardar: () => undefined,
        }) as ReactElement<ModalEditarModuloProps>;

        assert.equal(
          element.props.powerBiOnly,
          true
        );
        assert.equal(
          element.props.title,
          MANTENER_BI_TEXTS.editTitle
        );
        assert.equal(
          element.props.submitLabel,
          MANTENER_BI_TEXTS.editSubmitLabel
        );
        assert.equal(
          element.props.editPermissionMessage,
          'No tiene permiso para editar BI.'
        );
      }
    ),
    test(
      'mantiene el id 27 dentro del mismo flujo compartido para conservar publicaciones por cartera',
      () => {
        const element = ModalEditarBi({
          isOpen: true,
          canEdit: true,
          moduloId: 27,
          modulosExistentes: [],
          onClose: () => undefined,
          onGuardar: () => undefined,
        }) as ReactElement<ModalEditarModuloProps>;

        assert.equal(
          element.props.moduloId,
          27
        );
        assert.equal(
          element.props.powerBiOnly,
          true
        );
      }
    ),
  ]
);
