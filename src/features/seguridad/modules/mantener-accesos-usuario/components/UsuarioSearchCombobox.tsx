import {
  memo,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import {
  useUsuarioSearchCombobox,
} from '../hooks/useUsuarioSearchCombobox';
import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';

import UsuarioSearchDropdown from './UsuarioSearchDropdown';

interface UsuarioSearchComboboxProps {
  label: string;
  options: UsuarioSearchOption[];
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  emptyMessage?: string;
}

const UsuarioSearchComboboxComponent = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Buscar usuario...',
  disabled = false,
  error,
  required = false,
  emptyMessage =
    'No se encontraron usuarios con esa búsqueda.',
}: UsuarioSearchComboboxProps): ReactNode => {
  const {
    inputId,
    listboxId,
    containerRef,
    dropdownRef,
    inputRef,
    isOpen,
    query,
    dropdownPosition,
    visibleOptions,
    totalMatches,
    safeActiveIndex,
    inputValue,
    activeDescendant,
    resultSummary,
    setActiveIndex,
    selectOption,
    handleKeyDown,
    handleInputFocus,
    handleInputChange,
    handleToggle,
  } = useUsuarioSearchCombobox({
    options,
    value,
    onChange,
    disabled,
  });

  const dropdown = isOpen ? (
    <UsuarioSearchDropdown
      dropdownRef={dropdownRef}
      listboxId={listboxId}
      position={dropdownPosition}
      query={query}
      resultSummary={resultSummary}
      totalMatches={totalMatches}
      visibleOptions={visibleOptions}
      value={value}
      activeIndex={safeActiveIndex}
      emptyMessage={emptyMessage}
      onSelect={selectOption}
      onActiveIndexChange={setActiveIndex}
    />
  ) : null;

  return (
    <div className="form-row-inline">
      <label
        className="form-label form-label--inline"
        htmlFor={inputId}
      >
        {label}
        {required && (
          <span className="usuario-search-combobox__required">
            *
          </span>
        )}
      </label>

      <div className="usuario-search-combobox__field">
        <div
          ref={containerRef}
          className="usuario-search-combobox"
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className={[
              'form-input',
              'form-input--inline-field',
              'usuario-search-combobox__input',
              error ? 'form-input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-invalid={Boolean(error)}
            onFocus={handleInputFocus}
            onChange={(event) => {
              handleInputChange(event.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            className="usuario-search-combobox__toggle"
            aria-label={
              isOpen
                ? 'Cerrar lista de usuarios'
                : 'Abrir lista de usuarios'
            }
            aria-expanded={isOpen}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={handleToggle}
          >
            <span aria-hidden="true">
              {isOpen ? '▴' : '▾'}
            </span>
          </button>
        </div>

        {error && (
          <span className="form-error">
            {error}
          </span>
        )}
      </div>

      {typeof document !== 'undefined' &&
        dropdown &&
        createPortal(dropdown, document.body)}
    </div>
  );
};

export const UsuarioSearchCombobox = memo(
  UsuarioSearchComboboxComponent
);

export default UsuarioSearchCombobox;
