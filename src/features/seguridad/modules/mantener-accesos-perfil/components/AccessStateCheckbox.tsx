import {
  useEffect,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from 'react';

import type {
  PerfilOpcionCheckState,
} from '../types/asignarAccesosPerfil.types';

interface AccessStateCheckboxProps {
  state: PerfilOpcionCheckState;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onChange: (checked: boolean) => void;
}

export const AccessStateCheckbox = ({
  state,
  disabled = false,
  className,
  ariaLabel,
  onChange,
}: AccessStateCheckboxProps): ReactNode => {
  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate =
        state === 'mixed';
    }
  }, [state]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    onChange(event.target.checked);
  };

  return (
    <input
      ref={inputRef}
      type="checkbox"
      className={className}
      checked={state === 'checked'}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-checked={
        state === 'mixed'
          ? 'mixed'
          : state === 'checked'
      }
      onChange={handleChange}
    />
  );
};

export default AccessStateCheckbox;
