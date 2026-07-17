import type React from 'react';

import {
  PopupContextBoundary,
  type FichaDeudorPopupContext,
} from '@app/popups';

import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupWideDataTable,
} from '@features/ficha-deudor/shared/components/popups/common';

import {
  closePopupWindow,
} from '@features/ficha-deudor/shared/utils/popupWindow.utils';

import {
  PRODUCCION_GESTOR_HOY_TABLE_TOTAL_WIDTH,
  PRODUCCION_GESTOR_HOY_TEXTS,
} from '../constants/produccionGestorHoy.constants';

import {
  useProduccionGestorHoy,
} from '../hooks/useProduccionGestorHoy';

import {
  useProduccionGestorHoyColumns,
} from '../hooks/useProduccionGestorHoyColumns';

interface ProduccionGestorHoyPopupContentProps {
  context:
    FichaDeudorPopupContext<
      'produccion-gestor-hoy'
    >;
}

const ProduccionGestorHoyPopupContent:
  React.FC<
    ProduccionGestorHoyPopupContentProps
  > = ({
    context,
  }) => {
    const {
      idCliente,
      idUsuario,
    } = context;

    const {
      rows,
      isLoading,
      error,
      refetch,
    } = useProduccionGestorHoy(
      idCliente,
      idUsuario
    );

    const columns =
      useProduccionGestorHoyColumns();

    if (isLoading) {
      return (
        <PopupLoadingState
          message={
            PRODUCCION_GESTOR_HOY_TEXTS
              .loading
          }
        />
      );
    }

    if (error) {
      return (
        <PopupErrorState
          title={
            PRODUCCION_GESTOR_HOY_TEXTS
              .errorTitle
          }
          message={error}
          retryLabel={
            PRODUCCION_GESTOR_HOY_TEXTS
              .retryButton
          }
          closeLabel={
            PRODUCCION_GESTOR_HOY_TEXTS
              .closeButton
          }
          onRetry={refetch}
          onClose={closePopupWindow}
        />
      );
    }

    return (
      <PopupPageLayout
        logoText={
          PRODUCCION_GESTOR_HOY_TEXTS
            .logoText
        }
        logoSub={
          PRODUCCION_GESTOR_HOY_TEXTS
            .logoSub
        }
        navSection={
          PRODUCCION_GESTOR_HOY_TEXTS
            .navSection
        }
        navActive={
          PRODUCCION_GESTOR_HOY_TEXTS
            .navActive
        }
      >
        <PopupWideDataTable
          columns={columns}
          data={rows}
          allData={rows}
          emptyMessage={
            PRODUCCION_GESTOR_HOY_TEXTS
              .tableEmptyMessage
          }
          totalWidth={
            PRODUCCION_GESTOR_HOY_TABLE_TOTAL_WIDTH
          }
        />
      </PopupPageLayout>
    );
  };

const ProduccionGestorHoyPopup:
  React.FC = () => {
    return (
      <PopupContextBoundary
        popupType="produccion-gestor-hoy"
      >
        {(context) => (
          <ProduccionGestorHoyPopupContent
            context={context}
          />
        )}
      </PopupContextBoundary>
    );
  };

export default ProduccionGestorHoyPopup;