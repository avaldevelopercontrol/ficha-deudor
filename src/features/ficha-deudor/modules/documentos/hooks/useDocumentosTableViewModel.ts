import { useEffect } from 'react';

import { useDocumentos } from './useDocumentos';
import { useDocumentosTableColumns } from './useDocumentosTableColumns';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import type { DocumentoApi, DeudorInfo } from '../../../shared/types';

interface UseDocumentosTableViewModelParams {
  params: FichaDeudorDocumentosParams;
  data: DeudorInfo;
  onFilteredDocumentosChange?: (documentos: DocumentoApi[]) => void;
}

export const useDocumentosTableViewModel = ({
  params,
  onFilteredDocumentosChange,
}: UseDocumentosTableViewModelParams) => {
  const documentos = useDocumentos(params);

  useEffect(() => {
    onFilteredDocumentosChange?.(documentos.filteredData);
  }, [documentos.filteredData, onFilteredDocumentosChange]);

  const {
    tableStyles,
    tableColumns,
  } = useDocumentosTableColumns({
    columns: documentos.columns,
    allData: documentos.allData,
  });

  return {
    ...documentos,
    tableStyles,
    tableColumns,
  };
};
