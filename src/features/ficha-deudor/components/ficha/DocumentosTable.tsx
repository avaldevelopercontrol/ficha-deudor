import React, { useEffect } from 'react';
import Table from '../../../../shared/components/table/Table';
import Modal from '../../../../shared/components/modals/Modal';
import { useDocumentos } from '../../hooks/useDocumentos';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import DocumentosPagination from './documentos/DocumentosPagination';
import { useDocumentosTableColumns } from '../../hooks/useDocumentosTableColumns';
import DocumentosActionsCarousel from './documentos/DocumentosActionsCarousel';
import DocumentosErrorState from './documentos/DocumentosErrorState';
import DocumentosHeader from './documentos/DocumentosHeader';
import DocumentosLoadingState from './documentos/DocumentosLoadingState';
import { useDocumentosActions } from '../../hooks/useDocumentosActions';
import type {
  DocumentoApi,
  DeudorInfo,
} from '../../../../shared/types/indexApi';

interface Props {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
  data: DeudorInfo;
  onDocumentoClick?: (doc: DocumentoApi) => void;
  onFilteredDocumentosChange?: (documentos: DocumentoApi[]) => void;
}

const DocumentosTable: React.FC<Props> = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_contrato,
  id_usuario,
  data,
  onDocumentoClick,
  onFilteredDocumentosChange,
}) => {
  const {
    columns,
    allData,
    filteredData,
    paginatedData,
    botones,
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
  } = useDocumentos(id_cliente, id_cartera, id_deudor, id_contrato, id_usuario);

  const {
    scrollRef,
    puedeScrollIzq,
    puedeScrollDer,
    scroll,
  } = useHorizontalScroll(botones.length);

  const {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  } = useDocumentosActions({ data });

  useEffect(() => {
    onFilteredDocumentosChange?.(filteredData);
  }, [filteredData, onFilteredDocumentosChange]);

  const { tableStyles, tableColumns } = useDocumentosTableColumns({
    columns,
    allData,
    paginatedData,
  });

  if (isLoading) {
    return <DocumentosLoadingState />;
  }

  if (error) {
    return <DocumentosErrorState error={error} onRetry={refetch} />;
  }

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

export default DocumentosTable;