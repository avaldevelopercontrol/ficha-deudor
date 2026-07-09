import React from 'react';

import { useParams } from 'react-router-dom';

import { useAgendasByDeudor } from '../hooks/useAgendasByDeudor';
import { useAgendaDeudorColumns } from '../hooks/useAgendaDeudorColumns';
import { usePopupDeudorSearchParams } from '../../../shared/hooks/popups/usePopupDeudorSearchParams';
import {
  AGENDA_DEUDOR_POPUP_PAGE_SIZE_OPTIONS,
  AGENDA_DEUDOR_POPUP_TEXTS,
} from '../constants/agendaDeudorPopup.constants';
import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';

const AgendaDeudorPopup: React.FC = () => {
  const { id_cliente, id_cartera, id_deudor, id_usuario } = useParams<{
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
    id_usuario: string;
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
  } = useAgendasByDeudor(
    id_cliente ?? '',
    id_cartera ?? '',
    id_deudor ?? '',
    id_usuario ?? ''
  );

  const columns = useAgendaDeudorColumns();

  if (isLoading) {
    return <PopupLoadingState message={AGENDA_DEUDOR_POPUP_TEXTS.loading} />;
  }

  if (error) {
    return (
      <PopupErrorState
        title={AGENDA_DEUDOR_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={AGENDA_DEUDOR_POPUP_TEXTS.retryButton}
        closeLabel={AGENDA_DEUDOR_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <PopupPageLayout
      logoText={AGENDA_DEUDOR_POPUP_TEXTS.logoText}
      logoSub={AGENDA_DEUDOR_POPUP_TEXTS.logoSub}
      navSection={AGENDA_DEUDOR_POPUP_TEXTS.navSection}
      navActive={AGENDA_DEUDOR_POPUP_TEXTS.navActive}
      nombre={nombre}
      documento={documento}
    >
      <PopupPaginatedTableSection
        columns={columns}
        data={paginatedData}
        allData={allData}
        emptyMessage={AGENDA_DEUDOR_POPUP_TEXTS.tableEmptyMessage}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
        totalRecords={totalRecords}
        pageNumber={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={AGENDA_DEUDOR_POPUP_PAGE_SIZE_OPTIONS}
        countSuffix={AGENDA_DEUDOR_POPUP_TEXTS.toolbarCountSuffix}
        onPageNumberChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />
    </PopupPageLayout>
  );
};

export default AgendaDeudorPopup;