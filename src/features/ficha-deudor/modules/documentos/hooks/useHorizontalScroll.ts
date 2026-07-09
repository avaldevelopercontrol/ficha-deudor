import { useCallback, useEffect, useRef, useState } from 'react';

import { DOCUMENTOS_CARRUSEL_SCROLL_PX } from '../constants/documentosTable.constants';

type ScrollDirection = 'izq' | 'der';

export const useHorizontalScroll = (watchKey?: unknown) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [puedeScrollIzq, setPuedeScrollIzq] = useState(false);
  const [puedeScrollDer, setPuedeScrollDer] = useState(false);

  const verificarScroll = useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    setPuedeScrollIzq(element.scrollLeft > 0);
    setPuedeScrollDer(
      element.scrollLeft < element.scrollWidth - element.clientWidth - 1
    );
  }, []);

  useEffect(() => {
    verificarScroll();

    const element = scrollRef.current;

    if (!element) return;

    element.addEventListener('scroll', verificarScroll);
    window.addEventListener('resize', verificarScroll);

    return () => {
      element.removeEventListener('scroll', verificarScroll);
      window.removeEventListener('resize', verificarScroll);
    };
  }, [verificarScroll, watchKey]);

  const scroll = useCallback((direction: ScrollDirection) => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollBy({
      left:
        direction === 'izq'
          ? -DOCUMENTOS_CARRUSEL_SCROLL_PX
          : DOCUMENTOS_CARRUSEL_SCROLL_PX,
      behavior: 'smooth',
    });
  }, []);

  return {
    scrollRef,
    puedeScrollIzq,
    puedeScrollDer,
    scroll,
  };
};