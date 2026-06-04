import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ColumnFilterProps {
  values: string[];
  selectedValues: string[];
  onSelectedChange: (selected: string[]) => void;
  textFilter: string;
  onTextFilterChange: (text: string) => void;
  label: string;
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({
  values,
  selectedValues,
  onSelectedChange,
  textFilter,
  onTextFilterChange,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const filteredValues = values.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheck = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectedChange(selectedValues.filter(v => v !== value));
    } else {
      onSelectedChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (filteredValues.length === selectedValues.length) {
      onSelectedChange([]);
    } else {
      onSelectedChange([...filteredValues]);
    }
  };

  const handleClear = () => onSelectedChange([]);

  const isAllSelected = filteredValues.length > 0 && filteredValues.length === selectedValues.length;

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
        onChange={(e) => setSearch(e.target.value)}
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
        {filteredValues.map(value => (
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#eef4ff')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
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
            <span style={{ color: '#333' }}>{value}</span>
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
      {/* INPUT + BOTÓN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', minWidth: 0 }}>
        <input
          type="text"
          placeholder={label}
          value={textFilter}
          onChange={(e) => onTextFilterChange(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '10px 6px',        // 🔥 antes: '8px 10px' → ahora más alto, menos ancho
            fontSize: '11px',            // 🔥 antes: '12px' → un poco más pequeño para que quepa
            borderRadius: '6px',
            border: '1px solid #cfd6e4',
            backgroundColor: '#ffffff',
            outline: 'none',
            height: '32px',              // 🔥 NUEVO: alto fijo para que sea visible
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: '0 6px',            // 🔥 antes: '8px 10px' → más compacto horizontal
            height: '32px',              // 🔥 NUEVO: mismo alto que el input
            borderRadius: '6px',
            border: '1px solid #cfd6e4',
            backgroundColor: selectedValues.length ? '#e8f0fe' : '#ffffff',
            cursor: 'pointer',
            fontSize: '11px',            // 🔥 antes: '12px' → igual que input
            fontWeight: 600,
            color: '#185FA5',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',            // 🔥 NUEVO: ancho mínimo para el botón
          }}
        >
          {selectedValues.length ? `${selectedValues.length}` : '▼'}
        </button>
      </div>

      {open && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default ColumnFilter;