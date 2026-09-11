import React from 'react';

import Table from '@shared/components/table/Table';
import type { DeudorInfo, DocumentoApi } from '../../../../shared/types';
import type { FichaDeudorDocumentosParams } from '../../../../shared/types/fichaDeudor.types';
import type { useDocumentosTableViewModel } from '../../hooks/useDocumentosTableViewModel';
import GestionBotones from '../GestionBotones';
import DocumentosHeader from './DocumentosHeader';
import DocumentosPagination from './DocumentosPagination';

type DocumentosTableViewModel = ReturnType<typeof useDocumentosTableViewModel>;

interface Props {
  viewModel: DocumentosTableViewModel;
  params: FichaDeudorDocumentosParams;
  data: DeudorInfo;
  onDocumentoClick?: (doc: DocumentoApi) => void;
}

const DocumentosTableContent: React.FC<Props> = ({
  viewModel,
  params,
  data,
  onDocumentoClick,
}) => {
  const {
    allData,
    paginatedData,
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

      <GestionBotones
        key={`${params.id_cliente}:${params.id_contrato}`}
        params={params}
        data={data}
      />
    </div>
  );
};

export default DocumentosTableContent;
