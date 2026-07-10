import React from 'react';

import { FeedbackMessage } from '@shared/components/ui';

import { PopupPageLayout } from '../../../shared/components/popups/common';
import { PopupContextBoundary } from '../../../shared/popups/PopupContextBoundary';
import type { FichaDeudorPopupContext } from '../../../shared/popups/popupContext.types';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';

import { ESTADO_CUENTA_POPUP_TEXTS } from '../constants/estadoCuentaPopup.constants';
import { useEstadoCuentaDownload } from '../hooks/useEstadoCuentaDownload';

interface EstadoCuentaPopupContentProps {
  context: FichaDeudorPopupContext<'estado-cuenta'>;
}

const ExcelFileIcon: React.FC = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="estado-cuenta-download-icon-svg"
    >
      <path
        d="M6 2.75h8.4L19.25 7.6V21.25H6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M14 2.75V8h5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="m8.5 11 4 6m0-6-4 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

const EstadoCuentaPopupContent: React.FC<
  EstadoCuentaPopupContentProps
> = ({ context }) => {
  const {
    idCliente,
    idCartera,
    idDeudor,
    nombre,
    documento,
  } = context;

  const {
    isDownloading,
    isSuccess,
    error,
    downloadedFileName,
    downloadEstadoCuenta,
  } = useEstadoCuentaDownload({
    idCliente,
    idCartera,
    idDeudor,
  });

  const handleDownload = (): void => {
    void downloadEstadoCuenta();
  };

  return (
    <PopupPageLayout
      logoText={ESTADO_CUENTA_POPUP_TEXTS.logoText}
      logoSub={ESTADO_CUENTA_POPUP_TEXTS.logoSub}
      navSection={ESTADO_CUENTA_POPUP_TEXTS.navSection}
      navActive={ESTADO_CUENTA_POPUP_TEXTS.navActive}
      nombre={nombre}
      documento={documento}
    >
      <section className="estado-cuenta-download-card">
        <div className="estado-cuenta-download-heading">
          <div className="estado-cuenta-download-icon">
            <ExcelFileIcon />
          </div>

          <div>
            <span className="estado-cuenta-download-badge">
              ARCHIVO EXCEL
            </span>

            <h2>{ESTADO_CUENTA_POPUP_TEXTS.title}</h2>

            <p>
              {ESTADO_CUENTA_POPUP_TEXTS.description}
            </p>
          </div>
        </div>

        <div className="estado-cuenta-download-details">
          <div className="estado-cuenta-download-detail">
            <span>
              {ESTADO_CUENTA_POPUP_TEXTS.formatLabel}
            </span>

            <strong>
              {ESTADO_CUENTA_POPUP_TEXTS.formatValue}
            </strong>
          </div>

          <div className="estado-cuenta-download-detail">
            <span>
              {ESTADO_CUENTA_POPUP_TEXTS.contentLabel}
            </span>

            <strong>
              {ESTADO_CUENTA_POPUP_TEXTS.contentValue}
            </strong>
          </div>
        </div>

        {error && (
          <FeedbackMessage
            variant="error"
            title={ESTADO_CUENTA_POPUP_TEXTS.errorTitle}
            message={error}
          />
        )}

        {isSuccess && (
          <FeedbackMessage
            variant="success"
            title={ESTADO_CUENTA_POPUP_TEXTS.successTitle}
            message={
              downloadedFileName
                ? `El archivo "${downloadedFileName}" se descargó correctamente.`
                : ESTADO_CUENTA_POPUP_TEXTS.successMessage
            }
          />
        )}

        <div className="estado-cuenta-download-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span
                className="estado-cuenta-download-spinner"
                aria-hidden="true"
              />
            ) : (
              <span aria-hidden="true">↓</span>
            )}

            {isDownloading
              ? ESTADO_CUENTA_POPUP_TEXTS.downloadingButton
              : ESTADO_CUENTA_POPUP_TEXTS.downloadButton}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={closePopupWindow}
            disabled={isDownloading}
          >
            {ESTADO_CUENTA_POPUP_TEXTS.closeButton}
          </button>
        </div>

        <p className="estado-cuenta-download-note">
          {ESTADO_CUENTA_POPUP_TEXTS.note}
        </p>
      </section>
    </PopupPageLayout>
  );
};

const EstadoCuentaPopup: React.FC = () => {
  return (
    <PopupContextBoundary popupType="estado-cuenta">
      {(context) => (
        <EstadoCuentaPopupContent context={context} />
      )}
    </PopupContextBoundary>
  );
};

export default EstadoCuentaPopup;