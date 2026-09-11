import {
  useCallback,
  useEffect,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';

import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';

interface UseUsuarioSearchKeyboardNavigationOptions {
  isOpen: boolean;
  listboxId: string;
  visibleOptions: readonly UsuarioSearchOption[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  openDropdown: () => void;
  closeDropdown: () => void;
  selectOption: (option: UsuarioSearchOption) => void;
}

export const useUsuarioSearchKeyboardNavigation = ({
  isOpen,
  listboxId,
  visibleOptions,
  activeIndex,
  setActiveIndex,
  openDropdown,
  closeDropdown,
  selectOption,
}: UseUsuarioSearchKeyboardNavigationOptions) => {
  const safeActiveIndex =
    visibleOptions.length === 0
      ? -1
      : Math.min(
          Math.max(activeIndex, 0),
          visibleOptions.length - 1
        );

  useEffect(() => {
    if (!isOpen || safeActiveIndex < 0) {
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
      setActiveIndex,
      visibleOptions,
    ]
  );

  return {
    safeActiveIndex,
    handleKeyDown,
  };
};

export default useUsuarioSearchKeyboardNavigation;
