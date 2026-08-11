import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';
import {
  searchUsuarioOptions,
} from '../utils/usuarioSearch.utils';

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

interface DropdownPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

const DEFAULT_DROPDOWN_MAX_HEIGHT = 300;
const MIN_DROPDOWN_HEIGHT = 180;
const VIEWPORT_MARGIN = 8;

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
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const containerRef =
    useRef<HTMLDivElement>(null);
  const dropdownRef =
    useRef<HTMLDivElement>(null);
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] =
    useState(false);
  const [query, setQuery] =
    useState('');
  const [activeIndex, setActiveIndex] =
    useState(-1);
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition>({
      left: 0,
      top: 0,
      width: 0,
      maxHeight:
        DEFAULT_DROPDOWN_MAX_HEIGHT,
    });

  const selectedOption = useMemo(
    () =>
      value === ''
        ? null
        : options.find(
            (option) =>
              option.id === value
          ) ?? null,
    [options, value]
  );

  const searchResult = useMemo(
    () =>
      searchUsuarioOptions(
        options,
        query
      ),
    [options, query]
  );

  const visibleOptions =
    searchResult.options;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const updateDropdownPosition =
    useCallback(() => {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      const rect =
        container.getBoundingClientRect();
      const availableBelow =
        window.innerHeight -
        rect.bottom -
        VIEWPORT_MARGIN;
      const availableAbove =
        rect.top - VIEWPORT_MARGIN;
      const shouldOpenAbove =
        availableBelow <
          MIN_DROPDOWN_HEIGHT &&
        availableAbove > availableBelow;
      const availableHeight =
        shouldOpenAbove
          ? availableAbove
          : availableBelow;
      const maxHeight = Math.max(
        MIN_DROPDOWN_HEIGHT,
        Math.min(
          DEFAULT_DROPDOWN_MAX_HEIGHT,
          availableHeight - 6
        )
      );
      const viewportWidth =
        window.innerWidth;
      const width = Math.min(
        Math.max(rect.width, 340),
        viewportWidth -
          VIEWPORT_MARGIN * 2
      );
      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(
          rect.left,
          viewportWidth -
            width -
            VIEWPORT_MARGIN
        )
      );
      const top = shouldOpenAbove
        ? Math.max(
            VIEWPORT_MARGIN,
            rect.top - maxHeight - 6
          )
        : rect.bottom + 6;

      setDropdownPosition({
        left,
        top,
        width,
        maxHeight,
      });
    }, []);

  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }

    setQuery('');
    setIsOpen(true);
    setActiveIndex(0);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    const handleViewportChange = () => {
      updateDropdownPosition();
    };

    window.addEventListener(
      'resize',
      handleViewportChange
    );
    window.addEventListener(
      'scroll',
      handleViewportChange,
      true
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleViewportChange
      );
      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true
      );
    };
  }, [
    isOpen,
    updateDropdownPosition,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        containerRef.current?.contains(
          target
        ) ||
        dropdownRef.current?.contains(
          target
        )
      ) {
        return;
      }

      closeDropdown();
    };

    document.addEventListener(
      'mousedown',
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      );
    };
  }, [closeDropdown, isOpen]);

  const safeActiveIndex =
    visibleOptions.length === 0
      ? -1
      : Math.min(
          Math.max(activeIndex, 0),
          visibleOptions.length - 1
        );

  useEffect(() => {
    if (
      !isOpen ||
      safeActiveIndex < 0
    ) {
      return;
    }

    const activeOption =
      visibleOptions[safeActiveIndex];

    if (!activeOption) {
      return;
    }

    document
      .getElementById(
        `${listboxId}-option-${activeOption.id}`
      )
      ?.scrollIntoView({
        block: 'nearest',
      });
  }, [
    isOpen,
    safeActiveIndex,
    listboxId,
    visibleOptions,
  ]);

  const selectOption = useCallback(
    (option: UsuarioSearchOption) => {
      onChange(option.id);
      closeDropdown();
      inputRef.current?.focus();
    },
    [closeDropdown, onChange]
  );

  const handleKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Escape') {
        if (isOpen) {
          event.preventDefault();
          closeDropdown();
        }

        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();

        if (!isOpen) {
          openDropdown();
          return;
        }

        setActiveIndex((previous) =>
          visibleOptions.length === 0
            ? -1
            : Math.min(
                previous + 1,
                visibleOptions.length - 1
              )
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        if (!isOpen) {
          openDropdown();
          return;
        }

        setActiveIndex((previous) =>
          visibleOptions.length === 0
            ? -1
            : Math.max(previous - 1, 0)
        );
        return;
      }

      if (
        event.key === 'Enter' &&
        isOpen &&
        safeActiveIndex >= 0
      ) {
        const option =
          visibleOptions[safeActiveIndex];

        if (option) {
          event.preventDefault();
          selectOption(option);
        }
      }
    },
    [
      closeDropdown,
      safeActiveIndex,
      isOpen,
      openDropdown,
      selectOption,
      visibleOptions,
    ]
  );

  const handleInputFocus = useCallback(() => {
    if (!isOpen) {
      openDropdown();
    }
  }, [isOpen, openDropdown]);

  const handleInputChange = useCallback(
    (valueText: string) => {
      if (!isOpen) {
        setIsOpen(true);
      }

      setQuery(valueText);
      setActiveIndex(0);
    },
    [isOpen]
  );

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    if (isOpen) {
      closeDropdown();
      return;
    }

    openDropdown();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [
    closeDropdown,
    disabled,
    isOpen,
    openDropdown,
  ]);

  const selectedDisplayValue =
    selectedOption
      ? selectedOption.login
        ? `${selectedOption.label} (${selectedOption.login})`
        : selectedOption.label
      : '';

  const inputValue = isOpen
    ? query
    : selectedDisplayValue;

  const activeDescendant =
    isOpen && safeActiveIndex >= 0
      ? visibleOptions[safeActiveIndex]
        ? `${listboxId}-option-${visibleOptions[safeActiveIndex].id}`
        : undefined
      : undefined;

  const resultSummary =
    query.trim()
      ? searchResult.totalMatches === 1
        ? '1 usuario encontrado'
        : `${searchResult.totalMatches} usuarios encontrados`
      : `Mostrando ${visibleOptions.length} de ${searchResult.totalMatches} usuarios`;

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      className="usuario-search-combobox__dropdown"
      style={{
        left: dropdownPosition.left,
        top: dropdownPosition.top,
        width: dropdownPosition.width,
        maxHeight:
          dropdownPosition.maxHeight,
      }}
    >
      <div className="usuario-search-combobox__summary">
        <span>{resultSummary}</span>
        {!query.trim() &&
          searchResult.totalMatches >
            visibleOptions.length && (
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
        {visibleOptions.map(
          (option, index) => {
            const isSelected =
              option.id === value;
            const isActive =
              index === safeActiveIndex;

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
                  selectOption(option);
                }}
                onMouseEnter={() => {
                  setActiveIndex(index);
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
          }
        )}

        {visibleOptions.length === 0 && (
          <div className="usuario-search-combobox__empty">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
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
              error
                ? 'form-input--error'
                : '',
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
            aria-activedescendant={
              activeDescendant
            }
            aria-invalid={Boolean(error)}
            onFocus={handleInputFocus}
            onChange={(event) => {
              handleInputChange(
                event.target.value
              );
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
        createPortal(
          dropdown,
          document.body
        )}
    </div>
  );
};

export const UsuarioSearchCombobox = memo(
  UsuarioSearchComboboxComponent
);

export default UsuarioSearchCombobox;
