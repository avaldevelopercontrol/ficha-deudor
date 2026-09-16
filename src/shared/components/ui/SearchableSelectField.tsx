import type { CSSProperties } from 'react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { SisgesIcon } from '../../icons/sisges';
import type { SelectOption } from '../../types';
import { filterSearchableSelectOptions } from './searchableSelectField.utils';

type SearchableSelectFieldProps<
  T extends string | number | boolean = string,
> = {
  label?: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

type DropdownPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

const MIN_DROPDOWN_SPACE = 150;
const MAX_DROPDOWN_HEIGHT = 260;
const VIEWPORT_GAP = 8;
const TRIGGER_GAP = 4;

export const SearchableSelectField = <
  T extends string | number | boolean = string,
>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay opciones que coincidan con la búsqueda.',
  disabled = false,
  error = '',
  required = false,
  wrapperClassName = '',
  className = '',
  id,
  ariaLabel,
}: SearchableSelectFieldProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);

  const generatedId = useId();
  const fieldId = id ?? `searchable-select-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const errorId = `${fieldId}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () =>
      options.find((option) => String(option.id) === String(value)) ?? null,
    [options, value]
  );

  const filteredOptions = useMemo(
    () => filterSearchableSelectOptions(options, search),
    [options, search]
  );

  const hasValue = String(value) !== '' && selectedOption !== null;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setDropdownPosition(null);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger || typeof window === 'undefined') {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const openBelow =
      spaceBelow >= MIN_DROPDOWN_SPACE || spaceBelow >= spaceAbove;

    const availableSpace = Math.max(
      100,
      openBelow ? spaceBelow : spaceAbove
    );

    const common = {
      left: Math.max(VIEWPORT_GAP, rect.left),
      width: Math.max(rect.width, 180),
      maxHeight: Math.min(MAX_DROPDOWN_HEIGHT, availableSpace),
    };

    setDropdownPosition(
      openBelow
        ? {
            ...common,
            top: rect.bottom + TRIGGER_GAP,
          }
        : {
            ...common,
            bottom: window.innerHeight - rect.top + TRIGGER_GAP,
          }
    );
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      closeDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [closeDropdown, isOpen, updateDropdownPosition]);


  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) {
      return;
    }

    onChange(option.id);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleClear = () => {
    onChange('' as T);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const dropdownStyle: CSSProperties | undefined = dropdownPosition
    ? {
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        maxHeight: dropdownPosition.maxHeight,
        top: dropdownPosition.top,
        bottom: dropdownPosition.bottom,
      }
    : undefined;

  const dropdown =
    isOpen && dropdownPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={dropdownRef}
            className="searchable-select-field__dropdown"
            style={dropdownStyle}
          >
            <div className="searchable-select-field__search-wrap">
              <span
                className="searchable-select-field__search-icon"
                aria-hidden="true"
              >
                <SisgesIcon name="search" width={13} height={13} />
              </span>
              <input
                type="search"
                className="form-input searchable-select-field__search"
                value={search}
                autoFocus
                autoComplete="off"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div
              id={listboxId}
              className="searchable-select-field__options"
              role="listbox"
              aria-labelledby={label ? labelId : undefined}
              style={{ maxHeight: Math.max(70, dropdownPosition.maxHeight - 46) }}
            >
              {!search.trim() && (
                <button
                  type="button"
                  role="option"
                  aria-selected={!hasValue}
                  className={`searchable-select-field__option${
                    !hasValue ? ' is-selected' : ''
                  }`}
                  onClick={handleClear}
                >
                  <span className="searchable-select-field__option-label">
                    {placeholder}
                  </span>
                  {!hasValue && (
                    <span
                      className="searchable-select-field__option-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected =
                    String(option.id) === String(value);

                  return (
                    <button
                      key={String(option.id)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      className={`searchable-select-field__option${
                        isSelected ? ' is-selected' : ''
                      }`}
                      onClick={() => handleSelect(option)}
                    >
                      <span className="searchable-select-field__option-label">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span
                          className="searchable-select-field__option-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="searchable-select-field__empty">
                  {emptyMessage}
                </p>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={containerRef}
      className={`form-group searchable-select-field ${wrapperClassName}`.trim()}
    >
      {label && (
        <label className="form-label" id={labelId} htmlFor={fieldId}>
          {label}
          {required && (
            <span className="searchable-select-field__required">*</span>
          )}
        </label>
      )}

      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        className={`form-select searchable-select-field__trigger ${
          hasValue ? 'form-select--has-value' : 'form-select--placeholder'
        } ${error ? 'form-select--error' : ''} ${className}`.trim()}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !isOpen && !disabled) {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className="searchable-select-field__value">
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          className={`searchable-select-field__chevron${
            isOpen ? ' is-open' : ''
          }`}
          aria-hidden="true"
        >
          <SisgesIcon name="chevron-right" width={11} height={11} />
        </span>
      </button>

      {error && (
        <span id={errorId} className="form-error">
          {error}
        </span>
      )}

      {dropdown}
    </div>
  );
};

export default SearchableSelectField;
