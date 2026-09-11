import type {
  RefObject,
  ReactNode,
} from 'react';

import type {
  UsuarioSearchDropdownPosition,
} from '../hooks/useUsuarioSearchDropdownPosition';
import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';

interface UsuarioSearchDropdownProps {
  dropdownRef: RefObject<HTMLDivElement | null>;
  listboxId: string;
  position: UsuarioSearchDropdownPosition;
  query: string;
  resultSummary: string;
  totalMatches: number;
  visibleOptions: readonly UsuarioSearchOption[];
  value: number | '';
  activeIndex: number;
  emptyMessage: string;
  onSelect: (option: UsuarioSearchOption) => void;
  onActiveIndexChange: (index: number) => void;
}

export const UsuarioSearchDropdown = ({
  dropdownRef,
  listboxId,
  position,
  query,
  resultSummary,
  totalMatches,
  visibleOptions,
  value,
  activeIndex,
  emptyMessage,
  onSelect,
  onActiveIndexChange,
}: UsuarioSearchDropdownProps): ReactNode => (
  <div
    ref={dropdownRef}
    className="usuario-search-combobox__dropdown"
    style={{
      left: position.left,
      top: position.top,
      width: position.width,
      maxHeight: position.maxHeight,
    }}
  >
    <div className="usuario-search-combobox__summary">
      <span>{resultSummary}</span>
      {!query.trim() &&
        totalMatches > visibleOptions.length && (
          <span>
            Escriba nombre o usuario para filtrar.
          </span>
        )}
    </div>

    <div
      id={listboxId}
      className="usuario-search-combobox__options"
      role="listbox"
      aria-label="Resultados de usuarios"
    >
      {visibleOptions.map((option, index) => {
        const isSelected = option.id === value;
        const isActive = index === activeIndex;

        return (
          <div
            id={`${listboxId}-option-${option.id}`}
            key={option.id}
            className={[
              'usuario-search-combobox__option',
              isSelected
                ? 'usuario-search-combobox__option--selected'
                : '',
              isActive
                ? 'usuario-search-combobox__option--active'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="option"
            aria-selected={isSelected}
            onMouseDown={(event) => {
              // Seleccionamos en mouseDown para que el click no se
              // pierda si el foco del input cambia antes del click.
              event.preventDefault();
              onSelect(option);
            }}
            onMouseEnter={() => {
              onActiveIndexChange(index);
            }}
          >
            <span className="usuario-search-combobox__option-name">
              {option.label}
            </span>

            {option.login && (
              <span className="usuario-search-combobox__option-login">
                {option.login}
              </span>
            )}
          </div>
        );
      })}

      {visibleOptions.length === 0 && (
        <div className="usuario-search-combobox__empty">
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

export default UsuarioSearchDropdown;
