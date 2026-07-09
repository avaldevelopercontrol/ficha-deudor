import React from 'react';

import Paginacion from '@shared/components/ui/Paginacion';

interface PopupTablePaginationProps {
  pageNumber: number;
  totalPages: number;
  totalRecords: number;
  indiceInicio: number;
  indiceFin: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageNumberChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PopupTablePagination: React.FC<PopupTablePaginationProps> = ({
  pageNumber,
  totalPages,
  totalRecords,
  indiceInicio,
  indiceFin,
  pageSize,
  pageSizeOptions,
  onPageNumberChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="popup-pagination">
      <Paginacion
        paginaActual={pageNumber}
        totalPaginas={totalPages}
        totalRegistros={totalRecords}
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        onPaginaAnterior={() => onPageNumberChange(Math.max(1, pageNumber - 1))}
        onPaginaSiguiente={() =>
          onPageNumberChange(Math.min(totalPages, pageNumber + 1))
        }
        onIrAPagina={onPageNumberChange}
        showPageSizeSelector={true}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};