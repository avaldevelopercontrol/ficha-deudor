import {
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import Table from '@shared/components/table/Table';
import TableResourceState from '@shared/components/table/TableResourceState';
import Paginacion from '@shared/components/ui/Paginacion';

import {
  OperationFeedbackMessage,
} from '@shared/components/ui';

import {
  ASIGNAR_USUARIO_PAGE_SIZE_OPTIONS,
  ASIGNAR_USUARIO_TEXTS,
} from '../constants/asignarUsuario.constants';

import {
  useAsignarUsuarioColumns,
} from '../hooks/useAsignarUsuarioColumns';

import {
  useAsignarUsuarioTable,
} from '../hooks/useAsignarUsuarioTable';

import type {
  UsuarioAsignable,
} from '../types/asignarUsuario.types';

import ModalAsignarUsuarioZonas from './ModalAsignarUsuarioZonas';

interface AsignarUsuarioTableCardProps {
  onSelectUsuario?: (
    usuario: UsuarioAsignable
  ) => void;
}

export const AsignarUsuarioTableCard = ({
  onSelectUsuario,
}: AsignarUsuarioTableCardProps): ReactNode => {
  const [
    selectedUsuario,
    setSelectedUsuario,
  ] = useState<UsuarioAsignable | null>(null);

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

    idCliente,
    clienteNombre,
    canInsert,
    canEdit,
    canManage,
    guardarUsuarioZonas,
    feedback,
    clearFeedback,
  } = useAsignarUsuarioTable();

  const handleSelectUsuario =
    useCallback(
      (usuario: UsuarioAsignable) => {
        if (!canManage || idCliente === null) {
          return;
        }

        clearFeedback();
        setSelectedUsuario(usuario);
        onSelectUsuario?.(usuario);
      },
      [
        canManage,
        clearFeedback,
        idCliente,
        onSelectUsuario,
      ]
    );

  const handleCloseModal =
    useCallback(() => {
      setSelectedUsuario(null);
    }, []);

  const selectDisabled =
    !canManage || idCliente === null;

  const selectDisabledReason =
    idCliente === null
      ? 'Seleccione un cliente activo antes de asignar zonas.'
      : !canManage
        ? 'No tiene permiso para crear o editar asignaciones de zonas.'
        : undefined;

  const columns =
    useAsignarUsuarioColumns({
      onSelect: handleSelectUsuario,
      disabled: selectDisabled,
      disabledReason:
        selectDisabledReason,
    });

  return (
    <>
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

        <OperationFeedbackMessage
          feedback={feedback}
          onClose={clearFeedback}
        />

        <TableResourceState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          loadingMessage="Cargando usuarios disponibles..."
          errorTitle="No se pudieron cargar los usuarios"
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
        </TableResourceState>
      </section>

      {selectedUsuario && (
        <ModalAsignarUsuarioZonas
          isOpen
          usuario={selectedUsuario}
          idCliente={idCliente}
          clienteNombre={clienteNombre}
          canInsert={canInsert}
          canEdit={canEdit}
          onClose={handleCloseModal}
          onGuardar={
            guardarUsuarioZonas
          }
        />
      )}
    </>
  );
};

export default AsignarUsuarioTableCard;
