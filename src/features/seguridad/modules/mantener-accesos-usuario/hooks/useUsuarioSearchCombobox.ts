import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';
import {
  searchUsuarioOptions,
} from '../utils/usuarioSearch.utils';

import {
  useUsuarioSearchDropdownPosition,
} from './useUsuarioSearchDropdownPosition';
import {
  useUsuarioSearchKeyboardNavigation,
} from './useUsuarioSearchKeyboardNavigation';

interface UseUsuarioSearchComboboxOptions {
  options: UsuarioSearchOption[];
  value: number | '';
  onChange: (value: number | '') => void;
  disabled: boolean;
}

export const useUsuarioSearchCombobox = ({
  options,
  value,
  onChange,
  disabled,
}: UseUsuarioSearchComboboxOptions) => {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const containerRef =
    useRef<HTMLDivElement>(null);
  const dropdownRef =
    useRef<HTMLDivElement>(null);
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] =
    useState(-1);

  const selectedOption = useMemo(
    () =>
      value === ''
        ? null
        : options.find(
            (option) => option.id === value
          ) ?? null,
    [options, value]
  );

  const searchResult = useMemo(
    () => searchUsuarioOptions(options, query),
    [options, query]
  );
  const visibleOptions = searchResult.options;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }

    setQuery('');
    setIsOpen(true);
    setActiveIndex(0);
  }, [disabled]);

  const dropdownPosition =
    useUsuarioSearchDropdownPosition(
      containerRef,
      isOpen
    );

  const selectOption = useCallback(
    (option: UsuarioSearchOption) => {
      onChange(option.id);
      closeDropdown();
      inputRef.current?.focus();
    },
    [closeDropdown, onChange]
  );

  const {
    safeActiveIndex,
    handleKeyDown,
  } = useUsuarioSearchKeyboardNavigation({
    isOpen,
    listboxId,
    visibleOptions,
    activeIndex,
    setActiveIndex,
    openDropdown,
    closeDropdown,
    selectOption,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
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

  const selectedDisplayValue = selectedOption
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

  const resultSummary = query.trim()
    ? searchResult.totalMatches === 1
      ? '1 usuario encontrado'
      : `${searchResult.totalMatches} usuarios encontrados`
    : `Mostrando ${visibleOptions.length} de ${searchResult.totalMatches} usuarios`;

  return {
    inputId,
    listboxId,
    containerRef,
    dropdownRef,
    inputRef,
    isOpen,
    query,
    dropdownPosition,
    visibleOptions,
    totalMatches: searchResult.totalMatches,
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
  };
};

export default useUsuarioSearchCombobox;
