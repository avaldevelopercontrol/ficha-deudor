import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface ColumnFilterProps {
  values: string[];
  selectedValues: string[];
  onSelectedChange: (selected: string[]) => void;
  textFilter: string;
  onTextFilterChange: (text: string) => void;
  label: string;
  getOptionLabel?: (value: string) => string;
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({
  values,
  selectedValues,
  onSelectedChange,
  textFilter,
  onTextFilterChange,
  label,
  getOptionLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setOpen((prev) => {
      const nextOpen = !prev;

      if (!nextOpen) {
        setSearch('');
      }

      return nextOpen;
    });
  }, []);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      setDropdownPosition({
        top: rect.bottom + scrollY + 6,
        left: rect.left + scrollX,
        width: Math.max(rect.width, 240),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;

      closeDropdown();
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, closeDropdown]);

  const getDisplayValue = useCallback(
    (value: string) => {
      return getOptionLabel?.(value) ?? value;
    },
    [getOptionLabel]
  );

  const filteredValues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return values;
    }

    return values.filter((value) => {
      const displayValue =
        getDisplayValue(value).toLowerCase();

      return displayValue.includes(
        normalizedSearch
      );
    });
  }, [
    getDisplayValue,
    search,
    values,
  ]);

  const handleCheck = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectedChange(selectedValues.filter((selected) => selected !== value));
    } else {
      onSelectedChange([...selectedValues, value]);
    }
  };

  const isAllSelected =
    filteredValues.length > 0 &&
    filteredValues.every((value) =>
      selectedValues.includes(value)
    );

  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredValueSet =
        new Set(filteredValues);

      onSelectedChange(
        selectedValues.filter(
          (value) =>
            !filteredValueSet.has(value)
        )
      );

      return;
    }

    onSelectedChange(
      Array.from(
        new Set([
          ...selectedValues,
          ...filteredValues,
        ])
      )
    );
  };

  const handleClear = () => {
    onSelectedChange([]);
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 99999,
        minWidth: '240px',
        backgroundColor: '#f9fafc',
        border: '1px solid #d6dbe6',
        borderRadius: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        padding: '10px',
      }}
    >
      <input
        type="text"
        placeholder="Buscar opciones..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{
          width: '100%',
          padding: '7px 9px',
          marginBottom: '10px',
          fontSize: '12px',
          borderRadius: '6px',
          border: '1px solid #cfd6e4',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button
          onClick={handleSelectAll}
          style={{
            flexShrink: 0,
            fontSize: '11px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #185FA5',
            backgroundColor: isAllSelected ? '#e0e7ff' : '#185FA5',
            color: isAllSelected ? '#185FA5' : '#fff',
            cursor: 'pointer',
          }}
          type="button"
        >
          {isAllSelected ? 'Todos ✓' : 'Todo'}
        </button>

        <button
          onClick={handleClear}
          style={{
            fontSize: '11px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #cfd6e4',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
          type="button"
        >
          Limpiar
        </button>
      </div>

      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {filteredValues.map((value) => (
          <label
            key={value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 6px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = '#eef4ff';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(value)}
              onChange={() => handleCheck(value)}
              style={{
                accentColor: '#185FA5',
                cursor: 'pointer',
              }}
            />

            <span style={{ color: '#333' }}>{getDisplayValue(value)}</span>
          </label>
        ))}

        {filteredValues.length === 0 && (
          <div style={{ fontSize: '12px', color: '#999', padding: '10px' }}>
            Sin opciones
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          minWidth: 0,
        }}
      >
        <input
          type="text"
          placeholder={label}
          value={textFilter}
          onChange={(event) => onTextFilterChange(event.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '10px 6px',
            fontSize: '11px',
            borderRadius: '6px',
            border: '1px solid #cfd6e4',
            backgroundColor: '#ffffff',
            outline: 'none',
            height: '32px',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={handleToggleDropdown}
          style={{
            padding: '0 6px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #cfd6e4',
            backgroundColor: selectedValues.length ? '#e8f0fe' : '#ffffff',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            color: '#185FA5',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',
          }}
          type="button"
        >
          {selectedValues.length ? `${selectedValues.length}` : '▼'}
        </button>
      </div>

      {open && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default ColumnFilter;