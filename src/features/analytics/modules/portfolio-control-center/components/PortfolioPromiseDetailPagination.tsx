import type React from 'react';

import Paginacion from '@shared/components/ui/Paginacion';

import type {
  PortfolioPagination,
} from '../domain/portfolioPromises.types';
import {
  resolvePortfolioPromisePagination,
} from '../utils/portfolioPromiseDetail.utils';

interface PortfolioPromiseDetailPaginationProps {
  className: string;
  pagination: PortfolioPagination | null | undefined;
  requestedPage: number;
  requestedPageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const PortfolioPromiseDetailPagination: React.FC<
  PortfolioPromiseDetailPaginationProps
> = ({
  className,
  pagination,
  requestedPage,
  requestedPageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const view = resolvePortfolioPromisePagination(
    pagination,
    requestedPage,
    requestedPageSize
  );

  if (view.totalRecords <= 0) {
    return null;
  }

  return (
    <div className={className}>
      <Paginacion
        paginaActual={view.currentPage}
        totalPaginas={view.totalPages}
        totalRegistros={view.totalRecords}
        indiceInicio={view.startIndex}
        indiceFin={view.endIndex}
        onPaginaAnterior={() => {
          onPageChange(Math.max(1, requestedPage - 1));
        }}
        onPaginaSiguiente={() => {
          onPageChange(Math.min(view.totalPages, requestedPage + 1));
        }}
        onIrAPagina={onPageChange}
        showPageSizeSelector
        pageSize={view.pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default PortfolioPromiseDetailPagination;
