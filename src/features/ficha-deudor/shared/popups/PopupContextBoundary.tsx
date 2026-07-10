import type { ReactNode } from 'react';

import {
  PopupErrorState,
  PopupLoadingState,
} from '../components/popups/common';
import { closePopupWindow } from '../utils/popupWindow.utils';
import type {
  FichaDeudorPopupContext,
  FichaDeudorPopupType,
} from './popupContext.types';
import { usePopupContext } from './usePopupContext';

interface PopupContextBoundaryProps<
  T extends FichaDeudorPopupType,
> {
  popupType: T;
  children: (
    context: FichaDeudorPopupContext<T>
  ) => ReactNode;
}

export function PopupContextBoundary<
  T extends FichaDeudorPopupType,
>({
  popupType,
  children,
}: PopupContextBoundaryProps<T>) {
  const { context, isLoading, error } =
    usePopupContext(popupType);

  if (isLoading) {
    return (
      <PopupLoadingState message="Cargando contexto..." />
    );
  }

  if (!context || error) {
    return (
      <PopupErrorState
        title="No se pudo abrir el popup"
        message={
          error ?? 'No se encontró el contexto necesario.'
        }
        retryLabel="Reintentar"
        closeLabel="Cerrar"
        onRetry={() => window.location.reload()}
        onClose={closePopupWindow}
      />
    );
  }

  return <>{children(context)}</>;
}