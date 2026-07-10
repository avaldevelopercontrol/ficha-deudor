import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { downloadBlobFile } from '@shared/utils/downloadFile.utils';

import { exportGestionEstadoCuenta } from '../api/estadoCuentaApi';
import { ESTADO_CUENTA_POPUP_TEXTS } from '../constants/estadoCuentaPopup.constants';

interface UseEstadoCuentaDownloadParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

type DownloadStatus =
  | 'idle'
  | 'downloading'
  | 'success'
  | 'error';

const buildFallbackFileName = (): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, '')
    .slice(0, 14);

  return `EstadoCuenta_${timestamp}.xlsx`;
};

const getDownloadErrorMessage = (
  error: unknown
): string => {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return ESTADO_CUENTA_POPUP_TEXTS.errorFallback;
};

export const useEstadoCuentaDownload = ({
  idCliente,
  idCartera,
  idDeudor,
}: UseEstadoCuentaDownloadParams) => {
  const [status, setStatus] =
    useState<DownloadStatus>('idle');

  const [error, setError] =
    useState<string | null>(null);

  const [downloadedFileName, setDownloadedFileName] =
    useState<string | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const downloadEstadoCuenta =
    useCallback(async (): Promise<void> => {
      if (status === 'downloading') {
        return;
      }

      abortControllerRef.current?.abort();

      const abortController =
        new AbortController();

      abortControllerRef.current =
        abortController;

      setStatus('downloading');
      setError(null);
      setDownloadedFileName(null);

      try {
        const result =
          await exportGestionEstadoCuenta({
            idCliente,
            idCartera,
            idDeudor,
          });

        const fileName =
          result.fileName ??
          buildFallbackFileName();

        downloadBlobFile(
          result.blob,
          fileName
        );

        setDownloadedFileName(fileName);
        setStatus('success');
      } catch (downloadError) {
        if (
          downloadError instanceof DOMException &&
          downloadError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          getDownloadErrorMessage(downloadError)
        );

        setStatus('error');
      } finally {
        if (
          abortControllerRef.current ===
          abortController
        ) {
          abortControllerRef.current = null;
        }
      }
    }, [
      idCartera,
      idCliente,
      idDeudor,
      status,
    ]);

  return {
    isDownloading: status === 'downloading',
    isSuccess: status === 'success',
    error,
    downloadedFileName,
    downloadEstadoCuenta,
  };
};