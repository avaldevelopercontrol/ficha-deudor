import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGestoresByCliente } from '../hooks/useGestoresByCliente';
import { useListaGestoresColumns } from '../hooks/useListaGestoresColumns';
import {
  LISTA_GESTORES_POPUP_PAGE_SIZE_OPTIONS,
  LISTA_GESTORES_POPUP_TEXTS,
} from '../constants/listaGestoresPopup.constants';
import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';
import type {
  Gestor,
  GestorSeleccionadoMessage,
} from '../types/gestor.types';

const ListaGestoresPopup: React.FC = () => {
  const { id_cliente } = useParams<{
    id_cliente: string;
  }>();

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
  } = useGestoresByCliente(id_cliente ?? '');

  const handleSelect = useCallback((gestor: Gestor) => {
    const message: GestorSeleccionadoMessage = {
      type: 'GESTOR_SELECTED',
      payload: {
        id: gestor.id,
        nombre: gestor.nombre,
      },
    };

    window.opener?.postMessage(message, window.location.origin);
    closePopupWindow();
  }, []);

  const columns = useListaGestoresColumns({
    onSelect: handleSelect,
  });

  if (isLoading) {
    return (
      <PopupLoadingState
        message={LISTA_GESTORES_POPUP_TEXTS.loading}
      />
    );
  }

  if (error) {
    return (
      <PopupErrorState
        title={LISTA_GESTORES_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={LISTA_GESTORES_POPUP_TEXTS.retryButton}
        closeLabel={LISTA_GESTORES_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <PopupPageLayout
      logoText={LISTA_GESTORES_POPUP_TEXTS.logoText}
      logoSub={LISTA_GESTORES_POPUP_TEXTS.logoSub}
      navSection={LISTA_GESTORES_POPUP_TEXTS.navSection}
      navActive={LISTA_GESTORES_POPUP_TEXTS.navActive}
    >
      <PopupPaginatedTableSection
        columns={columns}
        data={paginatedData}
        allData={allData}
        emptyMessage={LISTA_GESTORES_POPUP_TEXTS.tableEmptyMessage}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
        totalRecords={totalRecords}
        pageNumber={pageNumber}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={LISTA_GESTORES_POPUP_PAGE_SIZE_OPTIONS}
        countSuffix={LISTA_GESTORES_POPUP_TEXTS.toolbarCountSuffix}
        onPageNumberChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />
    </PopupPageLayout>
  );
};

export default ListaGestoresPopup;