import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

const DEFAULT_SUBMIT_ERROR_MESSAGE =
  'No se pudo completar la operación. Intente nuevamente.';

const resolveSubmitErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

interface UseModalFormOptions<TForm, TEntity = object> {
  initialForm: TForm;
  entity?: TEntity | null;
  mapEntityToForm?: (entity: TEntity) => TForm;
  onClose: () => void;
  onSubmit: (data: TForm) => Promise<void> | void;
  resetOnClose?: boolean;
  validate?: (data: TForm) => Record<string, string>;
  submitErrorMessage?: string;
}

interface UseModalFormResult<TForm> {
  form: TForm;

  handleChange: <K extends keyof TForm>(
    field: K,
    value: TForm[K]
  ) => void;

  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  resetForm: () => void;
  clearSubmitError: () => void;

  isDirty: boolean;
  isSubmitting: boolean;
  submitError: string | null;

  errors: Record<string, string>;

  setErrors: Dispatch<
    SetStateAction<Record<string, string>>
  >;
}

export function useModalForm<
  TForm extends object,
  TEntity = object,
>({
  initialForm,
  entity,
  mapEntityToForm,
  onClose,
  onSubmit,
  resetOnClose = true,
  validate,
  submitErrorMessage = DEFAULT_SUBMIT_ERROR_MESSAGE,
}: UseModalFormOptions<
  TForm,
  TEntity
>): UseModalFormResult<TForm> {
  const initialFormRef = useRef(initialForm);
  const isSubmittingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initialFormRef.current = initialForm;
  }, [initialForm]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [form, setForm] = useState<TForm>(() => {
    if (entity && mapEntityToForm) {
      return mapEntityToForm(entity);
    }

    return initialForm;
  });

  const [initialSnapshot, setInitialSnapshot] =
    useState<string>(() => {
      if (entity && mapEntityToForm) {
        return JSON.stringify(
          mapEntityToForm(entity)
        );
      }

      return JSON.stringify(initialForm);
    });

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] = useState<
    string | null
  >(null);

  const lastEntityKeyRef = useRef<string | null>(
    null
  );

  useEffect(() => {
    if (!entity || !mapEntityToForm) {
      if (lastEntityKeyRef.current !== null) {
        setForm(initialFormRef.current);

        setInitialSnapshot(
          JSON.stringify(initialFormRef.current)
        );

        setErrors({});
        setSubmitError(null);

        lastEntityKeyRef.current = null;
      }

      return;
    }

    const currentKey = JSON.stringify(entity);

    if (currentKey === lastEntityKeyRef.current) {
      return;
    }

    lastEntityKeyRef.current = currentKey;

    const mapped = mapEntityToForm(entity);

    setForm(mapped);
    setInitialSnapshot(JSON.stringify(mapped));
    setErrors({});
    setSubmitError(null);
  }, [entity, mapEntityToForm]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const handleChange = useCallback(
    <K extends keyof TForm>(
      field: K,
      value: TForm[K]
    ) => {
      setForm((previousForm) => ({
        ...previousForm,
        [field]: value,
      }));

      setSubmitError(null);

      setErrors((previousErrors) => {
        const fieldName = field as string;

        if (!previousErrors[fieldName]) {
          return previousErrors;
        }

        const newErrors = {
          ...previousErrors,
        };

        delete newErrors[fieldName];

        return newErrors;
      });
    },
    []
  );

  const resetForm = useCallback(() => {
    if (entity && mapEntityToForm) {
      const mapped = mapEntityToForm(entity);

      setForm(mapped);
      setInitialSnapshot(
        JSON.stringify(mapped)
      );
    } else {
      setForm(initialFormRef.current);

      setInitialSnapshot(
        JSON.stringify(initialFormRef.current)
      );
    }

    setErrors({});
    setSubmitError(null);
  }, [entity, mapEntityToForm]);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }

    if (validate) {
      const validationErrors = validate(form);

      if (
        Object.keys(validationErrors).length > 0
      ) {
        setErrors(validationErrors);
        setSubmitError(null);

        return;
      }
    }

    isSubmittingRef.current = true;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(form);

      if (
        resetOnClose &&
        isMountedRef.current
      ) {
        resetForm();
      }

      onClose();
    } catch (error) {
      if (isMountedRef.current) {
        setSubmitError(
          resolveSubmitErrorMessage(
            error,
            submitErrorMessage
          )
        );
      }
    } finally {
      isSubmittingRef.current = false;

      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    form,
    onSubmit,
    onClose,
    resetOnClose,
    resetForm,
    submitErrorMessage,
    validate,
  ]);

  const handleCancel = useCallback(() => {
    if (isSubmittingRef.current) {
      return;
    }

    if (resetOnClose) {
      resetForm();
    } else {
      setSubmitError(null);
    }

    onClose();
  }, [onClose, resetOnClose, resetForm]);

  const isDirty =
    JSON.stringify(form) !== initialSnapshot;

  return {
    form,
    handleChange,
    handleSubmit,
    handleCancel,
    resetForm,
    clearSubmitError,
    isDirty,
    isSubmitting,
    submitError,
    errors,
    setErrors,
  };
}