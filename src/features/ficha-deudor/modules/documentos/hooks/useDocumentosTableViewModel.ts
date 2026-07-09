import { useEffect } from 'react';

import { useDocumentos } from './useDocumentos';
import { useDocumentosActions } from './useDocumentosActions';
import { useDocumentosTableColumns } from './useDocumentosTableColumns';
import { useHorizontalScroll } from './useHorizontalScroll';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import type { DocumentoApi, DeudorInfo } from '../../../shared/types';

interface UseDocumentosTableViewModelParams {
  params: FichaDeudorDocumentosParams;
  data: DeudorInfo;
  onFilteredDocumentosChange?: (documentos: DocumentoApi[]) => void;
}

export const useDocumentosTableViewModel = ({
  params,
  data,
  onFilteredDocumentosChange,
}: UseDocumentosTableViewModelParams) => {
  const documentos = useDocumentos(params);

  const {
    scrollRef,
    puedeScrollIzq,
    puedeScrollDer,
    scroll,
  } = useHorizontalScroll(documentos.botones.length);

  const {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  } = useDocumentosActions({ data });

  useEffect(() => {
    onFilteredDocumentosChange?.(documentos.filteredData);
  }, [documentos.filteredData, onFilteredDocumentosChange]);

  const {
    tableStyles,
    tableColumns,
  } = useDocumentosTableColumns({
    columns: documentos.columns,
    allData: documentos.allData,
    paginatedData: documentos.paginatedData,
  });

  return {
    ...documentos,
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
  };
};