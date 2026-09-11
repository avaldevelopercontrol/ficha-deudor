import React from 'react';

import Modal from '@shared/components/modals/Modal';

import type { DeudorInfo } from '../../../shared/types';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { useDocumentosActions } from '../hooks/useDocumentosActions';
import { useGestionBotones } from '../hooks/useGestionBotones';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';

interface Props {
  params: FichaDeudorDocumentosParams;
  data: DeudorInfo;
}

const GestionBotones: React.FC<Props> = ({ params, data }) => {
  const {
    botones,
    isLoading,
    error,
    refetch,
  } = useGestionBotones({
    idCliente: params.id_cliente,
    idContrato: params.id_contrato,
  });

  const {
    scrollRef,
    puedeScrollIzq,
    puedeScrollDer,
    scroll,
  } = useHorizontalScroll(botones.length);

  const {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  } = useDocumentosActions({ data, params });

  if (!params.id_cliente || !params.id_contrato) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="ficha-block botones-carrusel-wrapper"
        aria-busy="true"
        aria-label="Cargando botones de gestión"
      >
        <div className="botones-scroll-container">
          <div className="botones-estaticos">
            <button className="btn-est" type="button" disabled>
              CARGANDO BOTONES...
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="ficha-block botones-carrusel-wrapper"
        role="alert"
      >
        <div className="botones-scroll-container">
          <div className="botones-estaticos">
            <span>{error}</span>
            <button
              className="btn-est"
              type="button"
              onClick={() => void refetch()}
            >
              REINTENTAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (botones.length === 0) {
    return null;
  }

  return (
    <>
      <div className="ficha-block botones-carrusel-wrapper">
        {puedeScrollIzq && (
          <button
            type="button"
            className="carrusel-flecha carrusel-flecha-izq"
            onClick={() => scroll('izq')}
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
                onClick={() => handleBotonClick(boton)}
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
            onClick={() => scroll('der')}
            aria-label="Ver más botones"
          >
            &#8250;
          </button>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        onClose={closeModal}
      />
    </>
  );
};

export default GestionBotones;
