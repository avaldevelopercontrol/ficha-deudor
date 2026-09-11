import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from 'react';

export interface UsuarioSearchDropdownPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

const DEFAULT_DROPDOWN_MAX_HEIGHT = 300;
const MIN_DROPDOWN_HEIGHT = 180;
const VIEWPORT_MARGIN = 8;

export const useUsuarioSearchDropdownPosition = (
  containerRef: RefObject<HTMLDivElement | null>,
  isOpen: boolean
): UsuarioSearchDropdownPosition => {
  const [position, setPosition] =
    useState<UsuarioSearchDropdownPosition>({
      left: 0,
      top: 0,
      width: 0,
      maxHeight:
        DEFAULT_DROPDOWN_MAX_HEIGHT,
    });

  const updatePosition = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const availableBelow =
      window.innerHeight -
      rect.bottom -
      VIEWPORT_MARGIN;
    const availableAbove =
      rect.top - VIEWPORT_MARGIN;
    const shouldOpenAbove =
      availableBelow < MIN_DROPDOWN_HEIGHT &&
      availableAbove > availableBelow;
    const availableHeight = shouldOpenAbove
      ? availableAbove
      : availableBelow;
    const maxHeight = Math.max(
      MIN_DROPDOWN_HEIGHT,
      Math.min(
        DEFAULT_DROPDOWN_MAX_HEIGHT,
        availableHeight - 6
      )
    );
    const viewportWidth = window.innerWidth;
    const width = Math.min(
      Math.max(rect.width, 340),
      viewportWidth - VIEWPORT_MARGIN * 2
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

    setPosition({
      left,
      top,
      width,
      maxHeight,
    });
  }, [containerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const handleViewportChange = () => {
      updatePosition();
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
  }, [isOpen, updatePosition]);

  return position;
};

export default useUsuarioSearchDropdownPosition;
