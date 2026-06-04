import { useState, useEffect, useCallback } from 'react';

interface UseModalFormOptions<T extends object> {
  initialForm: T;
  entity?: object | null;
  mapEntityToForm?: (entity: object) => T;
  onClose: () => void;
  onSubmit: (data: T) => void;
  resetOnClose?: boolean;
  validate?: (data: T) => Record<string, string>; // NUEVO: función de validación opcional
}

interface UseModalFormResult<T extends object> {
  form: T;
  handleChange: (field: keyof T, value: string) => void;
  handleSubmit: () => void;
  handleCancel: () => void;
  resetForm: () => void;
  isDirty: boolean;
  errors: Record<string, string>; // NUEVO: objeto de errores
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; // NUEVO: para limpiar errores
}

export function useModalForm<T extends object>({
  initialForm,
  entity,
  mapEntityToForm,
  onClose,
  onSubmit,
  resetOnClose = true,
  validate, // NUEVO: recibir función de validación
}: UseModalFormOptions<T>): UseModalFormResult<T> {
  const [form, setForm] = useState<T>(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({}); // NUEVO: estado de errores

  useEffect(() => {
    if (entity && mapEntityToForm) {
      const mapped = mapEntityToForm(entity);
      setForm(mapped);
      setInitialSnapshot(JSON.stringify(mapped));
    } else {
      setForm(initialForm);
      setInitialSnapshot(JSON.stringify(initialForm));
    }
    // Limpiar errores cuando cambia la entidad
    setErrors({});
  }, [entity, mapEntityToForm, initialForm]);

  const handleChange = useCallback((field: keyof T, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo específico cuando el usuario empieza a escribir
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setErrors({}); // NUEVO: limpiar errores al resetear
  }, [initialForm]);

  const handleSubmit = useCallback(() => {
    // NUEVO: Validar antes de enviar
    if (validate) {
      const validationErrors = validate(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return; // No continuar si hay errores
      }
    }
    
    // Si pasa la validación, proceder con el envío
    onSubmit(form);
    if (resetOnClose) resetForm();
    onClose();
  }, [form, onSubmit, onClose, resetOnClose, resetForm, validate]);

  const handleCancel = useCallback(() => {
    if (resetOnClose) resetForm();
    onClose();
  }, [onClose, resetOnClose, resetForm]);

  const isDirty = JSON.stringify(form) !== initialSnapshot;

  return {
    form,
    handleChange,
    handleSubmit,
    handleCancel,
    resetForm,
    isDirty,
    errors, // NUEVO: retornar errores
    setErrors, // NUEVO: retornar setErrors por si se necesita
  };
}