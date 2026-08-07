import type {
  ReactNode,
} from 'react';

import {
  SelectField,
} from '@shared/components/ui';

import type {
  SelectOption,
} from '@shared/types';

import {
  MODAL_REGISTRAR_MODULO_HELP,
  MODAL_REGISTRAR_MODULO_LABELS,
  MODAL_REGISTRAR_MODULO_PLACEHOLDERS,
  MODAL_REGISTRAR_MODULO_SECTIONS,
} from '../constants/modalRegistrarModulo.constants';

interface RegistrarModuloSourceSelectorProps {
  value: string;
  options: SelectOption<string>[];
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const RegistrarModuloSourceSelector = ({
  value,
  options,
  error,
  disabled = false,
  onChange,
}: RegistrarModuloSourceSelectorProps): ReactNode => {
  const hasOptions =
    options.length > 0;

  return (
    <section className="registrar-modulo-form__section">
      <h2 className="registrar-modulo-form__section-title">
        {
          MODAL_REGISTRAR_MODULO_SECTIONS
            .source
        }
      </h2>

      <SelectField<string>
        label={
          MODAL_REGISTRAR_MODULO_LABELS
            .applicationOption
        }
        layout="inline"
        value={value}
        options={options}
        onChange={onChange}
        placeholder={
          hasOptions
            ? MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .applicationOption
            : MODAL_REGISTRAR_MODULO_HELP
                .noApplicationOptions
        }
        error={error}
        disabled={
          disabled ||
          !hasOptions
        }
        required
      />

      <p className="registrar-modulo-form__help">
        {hasOptions
          ? MODAL_REGISTRAR_MODULO_HELP
              .applicationOption
          : MODAL_REGISTRAR_MODULO_HELP
              .noApplicationOptions}
      </p>
    </section>
  );
};

export default RegistrarModuloSourceSelector;
