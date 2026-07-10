import React from 'react';


import { usePagosByDeudor } from '../hooks/usePagosByDeudor';
import { usePagoDeudorColumns } from '../hooks/usePagoDeudorColumns';
import {
  PAGO_DEUDOR_POPUP_PAGE_SIZE_OPTIONS,
  PAGO_DEUDOR_POPUP_TEXTS,
} from '../constants/pagoDeudorPopup.constants';
import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';
import { PopupContextBoundary } from '../../../shared/popups/PopupContextBoundary';
import type { FichaDeudorPopupContext } from '../../../shared/popups/popupContext.types';

interface PagoDeudorPopupContentProps {
  context: FichaDeudorPopupContext<'pago-deudor'>;
}

const PagoDeudorPopupContent: React.FC<
  PagoDeudorPopupContentProps
> = ({ context }) => {
  const {
    idCliente,
    idCartera,
    idDeudor,
    nombre,
    documento,
  } = context;

  const {
    allData,
    paginatedData,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
  } = usePagosByDeudor(
    idCliente,
    idCartera,
    idDeudor
  );

  const columns = usePagoDeudorColumns();

  if (isLoading) {
    return <PopupLoadingState message={PAGO_DEUDOR_POPUP_TEXTS.loading} />;
  }

  if (error) {
    return (
      <PopupErrorState
        title={PAGO_DEUDOR_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={PAGO_DEUDOR_POPUP_TEXTS.retryButton}
        closeLabel={PAGO_DEUDOR_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <PopupPageLayout
      logoText={PAGO_DEUDOR_POPUP_TEXTS.logoText}
      logoSub={PAGO_DEUDOR_POPUP_TEXTS.logoSub}
      navSection={PAGO_DEUDOR_POPUP_TEXTS.navSection}
      navActive={PAGO_DEUDOR_POPUP_TEXTS.navActive}
      nombre={nombre}
      documento={documento}
    >
      <PopupPaginatedTableSection
        columns={columns}
        data={paginatedData}
        allData={allData}
        emptyMessage={PAGO_DEUDOR_POPUP_TEXTS.tableEmptyMessage}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
        totalRecords={totalRecords}
        pageNumber={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={PAGO_DEUDOR_POPUP_PAGE_SIZE_OPTIONS}
        countSuffix={PAGO_DEUDOR_POPUP_TEXTS.toolbarCountSuffix}
        onPageNumberChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />
    </PopupPageLayout>
  );
};

const PagoDeudorPopup: React.FC = () => {
  return (
    <PopupContextBoundary popupType="pago-deudor">
      {(context) => (
        <PagoDeudorPopupContent context={context} />
      )}
    </PopupContextBoundary>
  );
};

export default PagoDeudorPopup;