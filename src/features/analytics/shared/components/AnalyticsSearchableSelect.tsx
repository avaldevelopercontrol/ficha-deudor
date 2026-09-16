import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { InputField } from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import {
  filterAnalyticsSearchableOptions,
} from './analyticsSearchableSelect.utils';

import '../styles/analytics-primitives.css';

export interface AnalyticsSearchableSelectOption {
  id: number;
  label: string;
}

interface AnalyticsSearchableSelectProps {
  id: string;
  label: string;
  options: readonly AnalyticsSearchableSelectOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage?: string;
  disabled?: boolean;
  disabledReason?: string;
  wrapperClassName?: string;
}

export const AnalyticsSearchableSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage = 'No hay opciones que coincidan con la búsqueda.',
  disabled = false,
  disabledReason,
  wrapperClassName = '',
}: AnalyticsSearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-listbox`;
  const labelId = `${id}-${generatedId}-label`;
  const valueId = `${id}-${generatedId}-value`;
  const descriptionId = `${id}-${generatedId}-description`;

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value]
  );
  const filteredOptions = useMemo(
    () => filterAnalyticsSearchableOptions(options, search),
    [options, search]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const close = () => {
      setIsOpen(false);
      setSearch('');
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const closeAndSelect = (nextValue: number | null) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearch('');
  };

  const buttonDescription = disabledReason
    ? descriptionId
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`analytics-searchable-select form-group${isOpen ? ' is-open' : ''} ${wrapperClassName}`.trim()}
    >
      <span className="form-label" id={labelId}>
        {label}
      </span>

      <button
        id={id}
        type="button"
        className={`analytics-searchable-select__trigger${
          isOpen ? ' is-open' : ''
        }`}
        disabled={disabled}
        title={disabledReason}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={buttonDescription}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span
          id={valueId}
          className={`analytics-searchable-select__value${
            selectedOption === null ? ' is-placeholder' : ''
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          className="analytics-searchable-select__chevron"
          aria-hidden="true"
        >
          <SisgesIcon name="chevron-right" width={14} height={14} />
        </span>
      </button>

      {disabledReason && (
        <span
          id={descriptionId}
          className="analytics-searchable-select__sr-only"
        >
          {disabledReason}
        </span>
      )}

      {isOpen && !disabled && (
        <div className="analytics-searchable-select__dropdown">
          <div className="analytics-searchable-select__search-wrap">
            <span
              className="analytics-searchable-select__search-icon"
              aria-hidden="true"
            >
              <SisgesIcon name="search" width={15} height={15} />
            </span>
            <InputField
              type="search"
              value={search}
              autoFocus
              autoComplete="off"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              wrapperClassName="analytics-searchable-select__search-field"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div
            id={listboxId}
            className="analytics-searchable-select__options"
            role="listbox"
            aria-labelledby={labelId}
          >
            {!search.trim() && (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                className={`analytics-searchable-select__option${
                  value === null ? ' is-selected' : ''
                }`}
                onClick={() => closeAndSelect(null)}
              >
                <span className="analytics-searchable-select__option-label">
                  {placeholder}
                </span>
                {value === null && (
                  <span
                    className="analytics-searchable-select__option-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.id === value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`analytics-searchable-select__option${
                      isSelected ? ' is-selected' : ''
                    }`}
                    onClick={() => closeAndSelect(option.id)}
                  >
                    <span className="analytics-searchable-select__option-label">
                      {option.label}
                    </span>
                    {isSelected && (
                      <span
                        className="analytics-searchable-select__option-check"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="analytics-searchable-select__empty">
                {emptyMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSearchableSelect;
