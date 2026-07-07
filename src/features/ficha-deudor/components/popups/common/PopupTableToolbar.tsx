import React, { type ReactNode } from 'react';

interface PopupTableToolbarProps {
  indiceInicio: number;
  indiceFin: number;
  totalRecords: number;
  pageNumber: number;
  totalPages: number;
  countSuffix: string;
  actions?: ReactNode;
}

export const PopupTableToolbar: React.FC<PopupTableToolbarProps> = ({
  indiceInicio,
  indiceFin,
  totalRecords,
  pageNumber,
  totalPages,
  countSuffix,
  actions,
}) => {
  return (
    <div className="popup-toolbar">
      <div className="toolbar-info">
        <span className="toolbar-count">
          Mostrando{' '}
          <strong>
            {indiceInicio + 1}-{indiceFin}
          </strong>{' '}
          de <strong>{totalRecords}</strong> {countSuffix}
        </span>

        <span className="toolbar-page">
          Página {pageNumber} de {totalPages}
        </span>
      </div>

      {actions}
    </div>
  );
};