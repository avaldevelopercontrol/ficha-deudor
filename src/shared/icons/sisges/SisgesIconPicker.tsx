import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  SISGES_ICON_CATALOG,
} from './sisgesIcon.catalog';

import {
  getSisgesIconDefinition,
  isSisgesIconName,
  normalizeSisgesIconName,
  searchSisgesIcons,
} from './sisgesIcon.utils';

import type {
  SisgesIconCategory,
} from './sisgesIcon.types';

import SisgesIcon from './SisgesIcon';

type SisgesIconCategoryFilter =
  | 'all'
  | SisgesIconCategory;

interface SisgesIconPickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  allowEmpty?: boolean;
  layout?: 'vertical' | 'inline';
}

const CATEGORY_OPTIONS: readonly {
  id: SisgesIconCategoryFilter;
  label: string;
}[] = [
  { id: 'all', label: 'Todos' },
  { id: 'existentes', label: 'Iconos existentes' },
  { id: 'datos', label: 'Datos' },
  { id: 'cobranza', label: 'Cobranza' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'movil', label: 'Móvil' },
  { id: 'comunicaciones', label: 'Comunicaciones' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'generales', label: 'Generales' },
];

export const SisgesIconPicker = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Seleccionar icono',
  error,
  disabled = false,
  required = false,
  allowEmpty = true,
  layout = 'vertical',
}: SisgesIconPickerProps): ReactNode => {
  const generatedId = useId();
  const controlId = id ?? `sisges-icon-picker-${generatedId}`;
  const panelId = `${controlId}-panel`;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] =
    useState<SisgesIconCategoryFilter>('all');

  const normalizedValue = value.trim();

  const selectedName = normalizedValue
    ? normalizeSisgesIconName(normalizedValue)
    : null;

  const selectedDefinition = selectedName
    ? getSisgesIconDefinition(selectedName)
    : null;

  const hasLegacyValue =
    Boolean(normalizedValue) &&
    !isSisgesIconName(normalizedValue);

  const filteredIcons = useMemo(
    () =>
      searchSisgesIcons(query).filter(
        (icon) =>
          category === 'all' ||
          icon.category === category
      ),
    [category, query]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !containerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );
    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen]);

  const selectIcon = (
    iconName: string
  ) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const picker = (
    <div
      ref={containerRef}
      className="sisges-icon-picker"
    >
      <button
        id={controlId}
        type="button"
        className={[
          'sisges-icon-picker__trigger',
          error
            ? 'sisges-icon-picker__trigger--error'
            : '',
          isOpen
            ? 'sisges-icon-picker__trigger--open'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
      >
        <span className="sisges-icon-picker__selection-icon">
          {selectedDefinition ? (
            <SisgesIcon
              name={selectedDefinition.name}
              width={23}
              height={23}
            />
          ) : (
            <span
              aria-hidden="true"
              className="sisges-icon-picker__empty-symbol"
            >
              +
            </span>
          )}
        </span>

        <span className="sisges-icon-picker__selection-copy">
          <span className="sisges-icon-picker__selection-label">
            {selectedDefinition?.label ?? placeholder}
          </span>

          <span className="sisges-icon-picker__selection-help">
            {hasLegacyValue
              ? 'Icono anterior compatible'
              : selectedDefinition
                ? 'Icono seleccionado'
                : `${SISGES_ICON_CATALOG.length} iconos disponibles`}
          </span>
        </span>

        <span
          className="sisges-icon-picker__chevron"
          aria-hidden="true"
        >
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="sisges-icon-picker__panel"
        >
          <div className="sisges-icon-picker__filters">
            <label className="sisges-icon-picker__search">
              <input
                aria-label="Buscar icono"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="Buscar por nombre o tema"
                autoComplete="off"
              />
            </label>

            <label className="sisges-icon-picker__category">
              <select
                aria-label="Categoría de icono"
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target
                      .value as SisgesIconCategoryFilter
                  );
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className="sisges-icon-picker__grid"
            role="listbox"
            aria-label="Catálogo de iconos SISGES"
          >
            {allowEmpty &&
              !query.trim() &&
              category === 'all' && (
                <button
                  type="button"
                  role="option"
                  aria-selected={!normalizedValue}
                  className={[
                    'sisges-icon-picker__option',
                    !normalizedValue
                      ? 'sisges-icon-picker__option--selected'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    selectIcon('');
                  }}
                >
                  <span className="sisges-icon-picker__option-icon sisges-icon-picker__option-icon--empty">
                    —
                  </span>
                  <span className="sisges-icon-picker__option-label">
                    Sin icono
                  </span>
                </button>
              )}

            {filteredIcons.map((icon) => {
              const isSelected =
                selectedName === icon.name;

              return (
                <button
                  key={icon.name}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'sisges-icon-picker__option',
                    isSelected
                      ? 'sisges-icon-picker__option--selected'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    selectIcon(icon.name);
                  }}
                  title={icon.label}
                >
                  <span className="sisges-icon-picker__option-icon">
                    <SisgesIcon
                      name={icon.name}
                      width={25}
                      height={25}
                    />
                  </span>
                  <span className="sisges-icon-picker__option-label">
                    {icon.label}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <p className="sisges-icon-picker__empty-message">
              No se encontraron iconos para la búsqueda realizada.
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (layout === 'inline' && label) {
    return (
      <div className="form-row-inline">
        <label
          className="form-label form-label--inline"
          htmlFor={controlId}
        >
          {label}
          {required && (
            <span className="sisges-icon-picker__required">
              *
            </span>
          )}
        </label>

        <div className="sisges-icon-picker__field-content">
          {picker}
          {error && (
            <span className="form-error">
              {error}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && (
        <label
          className="form-label"
          htmlFor={controlId}
        >
          {label}
          {required && (
            <span className="sisges-icon-picker__required">
              *
            </span>
          )}
        </label>
      )}

      {picker}

      {error && (
        <span className="form-error">
          {error}
        </span>
      )}
    </div>
  );
};

export default SisgesIconPicker;
