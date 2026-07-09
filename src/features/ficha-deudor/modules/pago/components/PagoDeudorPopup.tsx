import React from 'react';

import { useParams } from 'react-router-dom';

import { usePagosByDeudor } from '../hooks/usePagosByDeudor';
import { usePagoDeudorColumns } from '../hooks/usePagoDeudorColumns';
import { usePopupDeudorSearchParams } from '../../../shared/hooks/popups/usePopupDeudorSearchParams';
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

const PagoDeudorPopup: React.FC = () => {
  const { id_cliente, id_cartera, id_deudor } = useParams<{
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
  }>();

  const { nombre, documento } = usePopupDeudorSearchParams();

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
  } = usePagosByDeudor(id_cliente ?? '', id_cartera ?? '', id_deudor ?? '');

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

export default PagoDeudorPopup;