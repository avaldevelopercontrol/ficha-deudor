import React from 'react';


import { useInfDeudor } from '../hooks/useInfDeudor';
import { useInfDeudorColumns } from '../hooks/useInfDeudorColumns';
import { INF_DEUDOR_POPUP_TEXTS } from '../constants/infDeudorPopup.constants';
import { POPUP_WIDE_MAIN_STYLE } from '../../../shared/constants/popupCommon.constants';
import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupWideDataTable,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';
import { PopupContextBoundary } from '../../../shared/popups/PopupContextBoundary';
import type { FichaDeudorPopupContext } from '../../../shared/popups/popupContext.types';

interface InfDeudorPopupContentProps {
  context: FichaDeudorPopupContext<'inf-deudor'>;
}

const InfDeudorPopupContent: React.FC<
  InfDeudorPopupContentProps
> = ({ context }) => {
  const { idDeudor, nombre, documento } = context;

  const { rows, isLoading, error, refetch } = useInfDeudor(idDeudor);

  const { columns, totalWidth } = useInfDeudorColumns(rows);

  if (isLoading) {
    return <PopupLoadingState message={INF_DEUDOR_POPUP_TEXTS.loading} />;
  }

  if (error) {
    return (
      <PopupErrorState
        title={INF_DEUDOR_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={INF_DEUDOR_POPUP_TEXTS.retryButton}
        closeLabel={INF_DEUDOR_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <PopupPageLayout
      logoText={INF_DEUDOR_POPUP_TEXTS.logoText}
      logoSub={INF_DEUDOR_POPUP_TEXTS.logoSub}
      navSection={INF_DEUDOR_POPUP_TEXTS.navSection}
      navActive={INF_DEUDOR_POPUP_TEXTS.navActive}
      nombre={nombre}
      documento={documento}
      mainStyle={POPUP_WIDE_MAIN_STYLE}
    >
      <PopupWideDataTable
        columns={columns}
        data={rows}
        allData={rows}
        emptyMessage={INF_DEUDOR_POPUP_TEXTS.tableEmptyMessage}
        totalWidth={totalWidth}
      />
    </PopupPageLayout>
  );
};

const InfDeudorPopup: React.FC = () => {
  return (
    <PopupContextBoundary popupType="inf-deudor">
      {(context) => (
        <InfDeudorPopupContent context={context} />
      )}
    </PopupContextBoundary>
  );
};

export default InfDeudorPopup;