import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  useAsyncMutation,
} from '@shared/hooks/useAsyncMutation';
import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  resetearClaveUsuario,
} from '../../../api/cambiarClaveApi';

import {
  CAMBIAR_CLAVE_INITIAL_FORM,
  CAMBIAR_CLAVE_TEXTS,
} from '../../constants/cambiarClave.constants';

import type {
  CambiarClaveField,
  CambiarClaveFormData,
} from '../../../types/cambiarClave.types';

import {
  getCambiarClaveRequirementStatus,
  validateCambiarClaveForm,
} from '../validations/cambiarClave.validation';

const ALL_FIELDS: CambiarClaveField[] = [
  'claveActual',
  'claveNueva',
  'confirmarClaveNueva',
];

const createTouchedFields = () =>
  ALL_FIELDS.reduce<
    Partial<Record<CambiarClaveField, boolean>>
  >((result, field) => {
    result[field] = true;
    return result;
  }, {});

interface UseCambiarClaveFormControllerParams {
  userId?: string | null;
  canEdit: boolean;
  invalidSessionMessage?: string;
  editPermissionDeniedMessage?: string;
  onSuccess?: (message: string) => void;
}

export const useCambiarClaveFormController = ({
  userId,
  canEdit,
  invalidSessionMessage = CAMBIAR_CLAVE_TEXTS.invalidSession,
  editPermissionDeniedMessage = CAMBIAR_CLAVE_TEXTS.editPermissionDenied,
  onSuccess,
}: UseCambiarClaveFormControllerParams) => {
  const [form, setForm] = useState<CambiarClaveFormData>(
    CAMBIAR_CLAVE_INITIAL_FORM
  );

  const [touched, setTouched] = useState<
    Partial<Record<CambiarClaveField, boolean>>
  >({});

  const [submitError, setSubmitError] = useState<string | null>(
    null
  );
  const {
    feedback: successFeedback,
    clearFeedback: clearSuccessFeedback,
    showSuccess,
  } = useOperationFeedback();

  const hasSuccessFeedback =
    successFeedback?.variant === 'success';

  const {
    isPending: isSubmitting,
    execute: executeSubmit,
  } = useAsyncMutation();

  const errors = useMemo(
    () => validateCambiarClaveForm(form),
    [form]
  );

  const requirementStatus = useMemo(
    () => getCambiarClaveRequirementStatus(form.claveNueva),
    [form.claveNueva]
  );

  const canSubmit = useMemo(
    () => canEdit && Object.keys(errors).length === 0,
    [canEdit, errors]
  );

  const handleChange = useCallback(
    (
      field: CambiarClaveField,
      value: string
    ) => {
      if (hasSuccessFeedback) {
        setTouched({});
      }

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setSubmitError(null);
      clearSuccessFeedback();
    },
    [clearSuccessFeedback, hasSuccessFeedback]
  );

  const handleBlur = useCallback(
    (field: CambiarClaveField) => {
      if (hasSuccessFeedback) {
        return;
      }

      setTouched((current) => ({
        ...current,
        [field]: true,
      }));
    },
    [hasSuccessFeedback]
  );

  const getFieldError = useCallback(
    (
      field: CambiarClaveField
    ): string | undefined => {
      if (hasSuccessFeedback) {
        return undefined;
      }

      return touched[field]
        ? errors[field]
        : undefined;
    },
    [errors, hasSuccessFeedback, touched]
  );

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    clearSuccessFeedback();

    if (!canEdit) {
      setSubmitError(editPermissionDeniedMessage);
      return;
    }

    setTouched(createTouchedFields());

    if (Object.keys(errors).length > 0) {
      return;
    }

    const normalizedUserId = userId?.trim();

    if (!normalizedUserId) {
      setSubmitError(invalidSessionMessage);
      return;
    }

    const result = await executeSubmit(
      () => resetearClaveUsuario(
        form,
        normalizedUserId
      )
    );

    if (result.status === 'skipped') {
      return;
    }

    if (result.status === 'error') {
      const error = result.error;

      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : CAMBIAR_CLAVE_TEXTS.apiErrorFallback
      );

      return;
    }

    setForm(CAMBIAR_CLAVE_INITIAL_FORM);
    setTouched({});
    showSuccess({
      entity: {
        label: 'Clave',
        gender: 'feminine',
      },
      action: 'update',
      message: result.data,
    });
    onSuccess?.(result.data);
  }, [
    canEdit,
    clearSuccessFeedback,
    editPermissionDeniedMessage,
    errors,
    executeSubmit,
    form,
    invalidSessionMessage,
    onSuccess,
    showSuccess,
    userId,
  ]);

  return {
    form,
    requirementStatus,
    canEdit,
    canSubmit,
    isSubmitting,
    submitError,
    successFeedback,
    clearSuccessFeedback,
    getFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
