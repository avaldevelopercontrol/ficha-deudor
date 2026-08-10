import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type {
  Modulo,
} from '../../../types/opcion.types';

import type {
  ModuloFormData,
} from '../types/registrarModulo.types';

import {
  validateModuloAvailabilityTransition,
} from '../utils/moduloAvailability.utils';

interface UseModuloAvailabilityControlsParams {
  form: ModuloFormData;
  moduloId?: number;
  modulos: readonly Modulo[];
  onChange: (
    field: 'visible' | 'estado',
    value: boolean
  ) => void;
  setErrors: Dispatch<
    SetStateAction<
      Record<string, string>
    >
  >;
}

const AVAILABILITY_FIELDS = [
  'estado',
  'visible',
] as const;

export const useModuloAvailabilityControls = ({
  form,
  moduloId,
  modulos,
  onChange,
  setErrors,
}: UseModuloAvailabilityControlsParams) => {
  const replaceAvailabilityErrors =
    useCallback(
      (
        nextErrors: {
          estado?: string;
          visible?: string;
        }
      ) => {
        setErrors(
          (previousErrors) => {
            const updatedErrors = {
              ...previousErrors,
            };

            AVAILABILITY_FIELDS.forEach(
              (field) => {
                delete updatedErrors[
                  field
                ];
              }
            );

            return {
              ...updatedErrors,
              ...nextErrors,
            };
          }
        );
      },
      [setErrors]
    );

  const resolveTransitionErrors =
    useCallback(
      (
        estado: boolean,
        visible: boolean
      ) => {
        if (moduloId === undefined) {
          return {};
        }

        return validateModuloAvailabilityTransition(
          {
            estado,
            visible,
          },
          moduloId,
          modulos
        );
      },
      [moduloId, modulos]
    );

  const onVisibleChange =
    useCallback(
      (
        value: boolean
      ) => {
        if (!value) {
          const errors =
            resolveTransitionErrors(
              form.estado,
              false
            );

          if (errors.visible) {
            replaceAvailabilityErrors({
              visible:
                errors.visible,
            });
            return;
          }
        }

        onChange(
          'visible',
          value
        );
      },
      [
        form.estado,
        onChange,
        replaceAvailabilityErrors,
        resolveTransitionErrors,
      ]
    );

  const onEstadoChange =
    useCallback(
      (
        value: boolean
      ) => {
        if (!value) {
          const errors =
            resolveTransitionErrors(
              false,
              false
            );

          if (
            errors.estado ||
            errors.visible
          ) {
            replaceAvailabilityErrors(
              errors
            );
            return;
          }

          onChange(
            'visible',
            false
          );
        }

        onChange(
          'estado',
          value
        );
      },
      [
        onChange,
        replaceAvailabilityErrors,
        resolveTransitionErrors,
      ]
    );

  return {
    visibleDisabled:
      !form.estado,

    onVisibleChange,
    onEstadoChange,
  };
};
