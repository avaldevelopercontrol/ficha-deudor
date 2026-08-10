import type {
  ReactNode,
} from 'react';

import {
  ActionButton,
  SelectField,
} from '@shared/components/ui';

import type {
  SelectOption,
} from '@shared/types';

import type {
  OrderPreviewItem,
} from '../utils/editarModulo.utils';

interface ModuloOrderControlProps {
  value: number;
  options: SelectOption<number>[];
  previewItems: readonly OrderPreviewItem[];
  error?: string;
  helpText: string;
  previewTitle: string;
  disabled?: boolean;
  onChange: (
    value: number
  ) => void;
}

export const ModuloOrderControl = ({
  value,
  options,
  previewItems,
  error,
  helpText,
  previewTitle,
  disabled = false,
  onChange,
}: ModuloOrderControlProps): ReactNode => {
  const currentIndex =
    options.findIndex(
      (option) =>
        option.id === value
    );

  const canMoveUp =
    !disabled &&
    currentIndex > 0;

  const canMoveDown =
    !disabled &&
    currentIndex >= 0 &&
    currentIndex <
      options.length - 1;

  const moveBy = (
    displacement: number
  ): void => {
    const nextOption =
      options[
        currentIndex +
          displacement
      ];

    if (nextOption) {
      onChange(nextOption.id);
    }
  };

  return (
    <div className="editar-modulo-order">
      <div className="editar-modulo-order__field">
        <SelectField<number>
          label="Orden"
          layout="inline"
          value={value}
          options={options}
          onChange={onChange}
          error={error}
          disabled={disabled}
          hidePlaceholder
        />

        <div className="editar-modulo-order__actions">
          <ActionButton
            label="Subir"
            ariaLabel="Mover el módulo una posición hacia arriba"
            title="Subir una posición"
            icon="↑"
            variant="secondary"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => {
              moveBy(-1);
            }}
          />

          <ActionButton
            label="Bajar"
            ariaLabel="Mover el módulo una posición hacia abajo"
            title="Bajar una posición"
            icon="↓"
            variant="secondary"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => {
              moveBy(1);
            }}
          />
        </div>
      </div>

      <p className="editar-modulo-order__help">
        {helpText}
      </p>

      <div className="editar-modulo-order__preview">
        <h3 className="editar-modulo-order__preview-title">
          {previewTitle}
        </h3>

        <ol className="editar-modulo-order__list">
          {previewItems.map(
            (item) => (
              <li
                key={item.id}
                className={[
                  'editar-modulo-order__item',

                  item.isCurrent
                    ? 'editar-modulo-order__item--current'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="editar-modulo-order__position">
                  {item.position}
                </span>

                <span className="editar-modulo-order__name">
                  {item.label}
                </span>

                {item.isCurrent && (
                  <span className="editar-modulo-order__current-badge">
                    Módulo actual
                  </span>
                )}
              </li>
            )
          )}
        </ol>
      </div>
    </div>
  );
};

export default ModuloOrderControl;
