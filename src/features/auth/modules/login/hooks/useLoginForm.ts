import { useCallback, useState, type FormEvent } from 'react';

import {
  LOGIN_FORM_INITIAL_TOUCHED,
  LOGIN_FORM_INITIAL_VALUES,
} from '../../../constants/loginForm.constants';
import type { LoginPayload } from '../../../types';
import {
  hasErrors,
  type LoginFormErrors,
  validateLoginForm,
} from '../../../validations';

interface UseLoginFormParams {
  onSubmit: (payload: LoginPayload) => void;
}

export const useLoginForm = ({ onSubmit }: UseLoginFormParams) => {
  const [values, setValues] = useState<LoginPayload>({
    ...LOGIN_FORM_INITIAL_VALUES,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof LoginPayload, boolean>>({
    ...LOGIN_FORM_INITIAL_TOUCHED,
  });

  const handleChange = useCallback(
    (field: keyof LoginPayload) => (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof LoginPayload) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      const validation = validateLoginForm(values);

      if (validation[field]) {
        setErrors((prev) => ({ ...prev, [field]: validation[field] }));
      }
    },
    [values]
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const validation = validateLoginForm(values);

      setErrors(validation);
      setTouched({ username: true, password: true });

      if (hasErrors(validation)) {
        return;
      }

      onSubmit(values);
    },
    [values, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
