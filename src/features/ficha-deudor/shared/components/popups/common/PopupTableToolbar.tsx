import React, { type ReactNode } from 'react';

interface PopupTableToolbarProps {
  indiceInicio: number;
  indiceFin: number;
  totalRecords: number;
  pageNumber: number;
  totalPages: number;
  countSuffix: string;
  actions?: ReactNode;
  showInfo?: boolean;
}

export const PopupTableToolbar: React.FC<PopupTableToolbarProps> = ({
  indiceInicio,
  indiceFin,
  totalRecords,
  pageNumber,
  totalPages,
  countSuffix,
  actions,
  showInfo = true,
}) => {
  return (
    <div
      className={
        showInfo
          ? 'popup-toolbar'
          : 'popup-toolbar popup-toolbar--actions-only'
      }
    >
      {showInfo && (
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
      )}

      {actions}
    </div>
  );
};