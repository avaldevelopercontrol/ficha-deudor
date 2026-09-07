interface ModalScrollLockSnapshot {
  overflow: string;
  paddingRight: string;
}

let lockDepth = 0;
let snapshot: ModalScrollLockSnapshot | null = null;

const getScrollbarWidth = (): number =>
  Math.max(0, window.innerWidth - document.documentElement.clientWidth);

const getBodyPaddingRight = (): number => {
  const computedPaddingRight = Number.parseFloat(
    window.getComputedStyle(document.body).paddingRight
  );

  return Number.isFinite(computedPaddingRight) ? computedPaddingRight : 0;
};

/**
 * Bloquea el scroll del documento sin reposicionar el body.
 *
 * Evitamos `position: fixed` porque cambia el containing block de elementos
 * `position: sticky` (por ejemplo, la cabecera de Ficha Deudor en Firefox) y
 * puede hacer que desaparezcan mientras el modal está abierto.
 */
export const lockModalScroll = (): void => {
  lockDepth += 1;

  if (lockDepth > 1) {
    return;
  }

  snapshot = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };

  const scrollbarWidth = getScrollbarWidth();

  document.body.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${
      getBodyPaddingRight() + scrollbarWidth
    }px`;
  }
};

/**
 * Libera un nivel de bloqueo. Solo restaura los estilos al cerrar el último
 * modal abierto, de modo que los modales anidados no reactiven el scroll antes
 * de tiempo.
 */
export const unlockModalScroll = (): void => {
  if (lockDepth === 0) {
    return;
  }

  lockDepth -= 1;

  if (lockDepth > 0 || !snapshot) {
    return;
  }

  document.body.style.overflow = snapshot.overflow;
  document.body.style.paddingRight = snapshot.paddingRight;
  snapshot = null;
};
