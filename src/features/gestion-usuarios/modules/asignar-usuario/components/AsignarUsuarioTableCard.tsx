import type React from 'react';

import Table from '@shared/components/table/Table';
import Paginacion from '@shared/components/ui/Paginacion';

import UsuariosTableResourceState from '../../../components/UsuariosTableResourceState';
import {
  ASIGNAR_USUARIO_PAGE_SIZE_OPTIONS,
  ASIGNAR_USUARIO_TEXTS,
} from '../constants/asignarUsuario.constants';
import { useAsignarUsuarioColumns } from '../hooks/useAsignarUsuarioColumns';
import { useAsignarUsuarioTable } from '../hooks/useAsignarUsuarioTable';
import type { UsuarioAsignable } from '../types/asignarUsuario.types';

interface AsignarUsuarioTableCardProps {
  onSelectUsuario?: (
    usuario: UsuarioAsignable
  ) => void;
}

export const AsignarUsuarioTableCard: React.FC<
  AsignarUsuarioTableCardProps
> = ({
  onSelectUsuario,
}) => {
  const columns =
    useAsignarUsuarioColumns({
      onSelect: onSelectUsuario,
    });

  const {
    allData,
    paginatedData,

    isLoading,
    error,
    refetch,

    pageNumber,
    pageSize,
    totalRecords,
    totalPages,

    indiceInicio,
    indiceFin,

    textFilters,
    selectedFilters,

    setPageNumber,
    setPageSize,

    onTextFilterChange,
    onSelectedFilterChange,
  } = useAsignarUsuarioTable();

  return (
    <section
      className="asignar-usuario-card"
      aria-labelledby="asignar-usuario-list-title"
    >
      <header className="asignar-usuario-card__header">
        <div>
          <h1
            id="asignar-usuario-list-title"
            className="asignar-usuario-card__title"
          >
            {
              ASIGNAR_USUARIO_TEXTS
                .sectionTitle
            }
          </h1>

          <p className="asignar-usuario-card__description">
            {
              ASIGNAR_USUARIO_TEXTS
                .sectionDescription
            }
          </p>
        </div>

        <span className="asignar-usuario-card__count">
          {totalRecords} usuario(s)
        </span>
      </header>

      <UsuariosTableResourceState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      >
        <>
          <div className="asignar-usuario-table">
            <Table
              columns={columns}
              data={paginatedData}
              allData={allData}
              emptyMessage={
                ASIGNAR_USUARIO_TEXTS
                  .emptyMessage
              }
              enableColumnFilters
              textFilters={textFilters}
              selectedFilters={
                selectedFilters
              }
              onTextFilterChange={
                onTextFilterChange
              }
              onSelectedFilterChange={
                onSelectedFilterChange
              }
              fitToPanel
            />
          </div>

          {totalRecords > 0 && (
            <div className="asignar-usuario-card__pagination">
              <Paginacion
                paginaActual={pageNumber}
                totalPaginas={totalPages}
                totalRegistros={
                  totalRecords
                }
                indiceInicio={
                  indiceInicio
                }
                indiceFin={indiceFin}
                onPaginaAnterior={() => {
                  setPageNumber(
                    Math.max(
                      1,
                      pageNumber - 1
                    )
                  );
                }}
                onPaginaSiguiente={() => {
                  setPageNumber(
                    Math.min(
                      totalPages,
                      pageNumber + 1
                    )
                  );
                }}
                onIrAPagina={
                  setPageNumber
                }
                showPageSizeSelector
                pageSize={pageSize}
                pageSizeOptions={[
                  ...ASIGNAR_USUARIO_PAGE_SIZE_OPTIONS,
                ]}
                onPageSizeChange={
                  setPageSize
                }
              />
            </div>
          )}
        </>
      </UsuariosTableResourceState>
    </section>
  );
};

export default AsignarUsuarioTableCard;