import React from 'react';

import Modal from '@shared/components/modals/Modal';
import Table from '@shared/components/table/Table';
import type { DocumentoApi } from '../../../../shared/types';
import type { useDocumentosTableViewModel } from '../../hooks/useDocumentosTableViewModel';
import DocumentosActionsCarousel from './DocumentosActionsCarousel';
import DocumentosHeader from './DocumentosHeader';
import DocumentosPagination from './DocumentosPagination';

type DocumentosTableViewModel = ReturnType<typeof useDocumentosTableViewModel>;

interface Props {
  viewModel: DocumentosTableViewModel;
  onDocumentoClick?: (doc: DocumentoApi) => void;
}

const DocumentosTableContent: React.FC<Props> = ({
  viewModel,
  onDocumentoClick,
}) => {
  const {
    allData,
    paginatedData,
    botones,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
    scrollRef,
    puedeScrollIzq,
    puedeScrollDer,
    scroll,
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
    tableStyles,
    tableColumns,
  } = viewModel;

  return (
    <div className="ficha-card">
      <DocumentosHeader totalRecords={totalRecords} />

      <div className="documentos-table-compact">
        <style>{tableStyles}</style>

        <Table
          columns={tableColumns}
          data={paginatedData}
          onRowClick={onDocumentoClick}
          emptyMessage="No se encontraron documentos para este deudor."
          fitToPanel={false}
          enableColumnFilters={true}
          allData={allData}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
        />
      </div>

      <DocumentosPagination
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        onPageNumberChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />

      <DocumentosActionsCarousel
        botones={botones}
        puedeScrollIzq={puedeScrollIzq}
        puedeScrollDer={puedeScrollDer}
        scrollRef={scrollRef}
        onScroll={scroll}
        onBotonClick={handleBotonClick}
      />

      <Modal isOpen={modalOpen} title={modalTitle} onClose={closeModal} />
    </div>
  );
};

export default DocumentosTableContent;