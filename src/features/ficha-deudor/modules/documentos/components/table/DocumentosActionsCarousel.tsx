import type { BotonApi } from '../../../../shared/types';

type ScrollDirection = 'izq' | 'der';

interface Props {
  botones: BotonApi[];
  puedeScrollIzq: boolean;
  puedeScrollDer: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (direction: ScrollDirection) => void;
  onBotonClick: (boton: BotonApi) => void;
}

const DocumentosActionsCarousel: React.FC<Props> = ({
  botones,
  puedeScrollIzq,
  puedeScrollDer,
  scrollRef,
  onScroll,
  onBotonClick,
}) => {
  return (
    <div
      className="ficha-block botones-carrusel-wrapper"
      style={{ marginTop: 12, paddingBottom: 12 }}
    >
      {puedeScrollIzq && (
        <button
          type="button"
          className="carrusel-flecha carrusel-flecha-izq"
          onClick={() => onScroll('izq')}
          aria-label="Ver botones anteriores"
        >
          &#8249;
        </button>
      )}

      <div className="botones-scroll-container" ref={scrollRef}>
        <div className="botones-estaticos">
          {botones.map((boton) => (
            <button
              key={boton.id}
              className="btn-est"
              type="button"
              onClick={() => onBotonClick(boton)}
            >
              + {boton.label}
            </button>
          ))}
        </div>
      </div>

      {puedeScrollDer && (
        <button
          type="button"
          className="carrusel-flecha carrusel-flecha-der"
          onClick={() => onScroll('der')}
          aria-label="Ver mas botones"
        >
          &#8250;
        </button>
      )}
    </div>
  );
};

export default DocumentosActionsCarousel;