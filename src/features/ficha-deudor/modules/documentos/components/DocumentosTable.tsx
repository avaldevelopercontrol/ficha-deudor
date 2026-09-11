import React from 'react';

import type { DocumentoApi, DeudorInfo } from '../../../shared/types';
import { useDocumentosTableViewModel } from '../hooks/useDocumentosTableViewModel';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import DocumentosErrorState from './table/DocumentosErrorState';
import DocumentosLoadingState from './table/DocumentosLoadingState';
import DocumentosTableContent from './table/DocumentosTableContent';

interface Props {
  params: FichaDeudorDocumentosParams;
  data: DeudorInfo;
  onDocumentoClick?: (doc: DocumentoApi) => void;
  onFilteredDocumentosChange?: (documentos: DocumentoApi[]) => void;
}

const DocumentosTable: React.FC<Props> = ({
  params,
  data,
  onDocumentoClick,
  onFilteredDocumentosChange,
}) => {
  const viewModel = useDocumentosTableViewModel({
    params,
    data,
    onFilteredDocumentosChange,
  });

  const { isLoading, error, refetch } = viewModel;

  if (isLoading) {
    return <DocumentosLoadingState />;
  }

  if (error) {
    return <DocumentosErrorState error={error} onRetry={refetch} />;
  }

  return (
    <DocumentosTableContent
      viewModel={viewModel}
      params={params}
      data={data}
      onDocumentoClick={onDocumentoClick}
    />
  );
};

export default DocumentosTable;