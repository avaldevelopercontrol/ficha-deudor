import {
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import Table from '@shared/components/table/Table';
import TableResourceState from '@shared/components/table/TableResourceState';
import {
  ActionButton,
} from '@shared/components/ui';
import Paginacion from '@shared/components/ui/Paginacion';

import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  MANTENER_ACCESOS_USUARIO_PAGE_SIZE_OPTIONS,
  MANTENER_ACCESOS_USUARIO_TEXTS,
} from '../constants/mantenerAccesosUsuario.constants';

import {
  useMantenerAccesosUsuarioColumns,
} from '../hooks/useMantenerAccesosUsuarioColumns';
import {
  useMantenerAccesosUsuarioTable,
} from '../hooks/useMantenerAccesosUsuarioTable';
import {
  useAsignarAccesosUsuarioCatalog,
} from '../hooks/useAsignarAccesosUsuarioCatalog';

import {
  getMantenerAccesosUsuarioPermissionMessage,
} from '../utils/mantenerAccesosUsuarioPermissions';

import ModalAsignarAccesosUsuario from './ModalAsignarAccesosUsuario';
import ModalEditarAccesosUsuario from './ModalEditarAccesosUsuario';

export const MantenerAccesosUsuarioTableCard =
  (): ReactNode => {
    const [
      isAssignModalOpen,
      setIsAssignModalOpen,
    ] = useState(false);
    const [
      selectedAcceso,
      setSelectedAcceso,
    ] = useState<UsuarioGrupoOpcionListado | null>(
      null
    );

    const {
      allData,
      canInsert,
      canEdit,
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
      registrarAccesosUsuario,
      actualizarAccesosUsuario,
    } = useMantenerAccesosUsuarioTable();

    const assignCatalogResource =
      useAsignarAccesosUsuarioCatalog(
        canInsert
      );

    const handleEditAcceso =
      useCallback(
        (
          acceso: UsuarioGrupoOpcionListado
        ) => {
          setSelectedAcceso(acceso);
        },
        []
      );

    const columns =
      useMantenerAccesosUsuarioColumns({
        onEditAcceso: handleEditAcceso,
      });

    const handleOpenAssignModal =
      useCallback(() => {
        if (!canInsert) {
          return;
        }

        setIsAssignModalOpen(true);
      }, [canInsert]);

    const handleCloseAssignModal =
      useCallback(() => {
        setIsAssignModalOpen(false);
      }, []);

    const handleCloseEditModal =
      useCallback(() => {
        setSelectedAcceso(null);
      }, []);

    return (
      <>
        <section
          className="mantener-accesos-usuario-card"
          aria-labelledby="mantener-accesos-usuario-list-title"
        >
          <header className="mantener-accesos-usuario-card__header">
            <div>
              <h1
                id="mantener-accesos-usuario-list-title"
                className="mantener-accesos-usuario-card__title"
              >
                {
                  MANTENER_ACCESOS_USUARIO_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-accesos-usuario-card__description">
                {
                  MANTENER_ACCESOS_USUARIO_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_ACCESOS_USUARIO_TEXTS
                  .addAction
              }
              variant="primary"
              size="sm"
              icon="+"
              onClick={handleOpenAssignModal}
              disabled={!canInsert}
              title={
                !canInsert
                  ? getMantenerAccesosUsuarioPermissionMessage(
                      'insertar'
                    )
                  : undefined
              }
              className="mantener-accesos-usuario-card__add-button"
            />
          </header>

          <TableResourceState
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingMessage={
              MANTENER_ACCESOS_USUARIO_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-accesos-usuario-table">
                <Table
                  columns={columns}
                  data={paginatedData}
                  allData={allData}
                  emptyMessage={
                    MANTENER_ACCESOS_USUARIO_TEXTS
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
                <div className="mantener-accesos-usuario-card__pagination">
                  <Paginacion
                    paginaActual={pageNumber}
                    totalPaginas={totalPages}
                    totalRegistros={
                      totalRecords
                    }
                    indiceInicio={indiceInicio}
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
                      ...MANTENER_ACCESOS_USUARIO_PAGE_SIZE_OPTIONS,
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

        <ModalAsignarAccesosUsuario
          isOpen={isAssignModalOpen}
          catalogResource={
            assignCatalogResource
          }
          existingAccesses={allData}
          canInsert={canInsert}
          onClose={handleCloseAssignModal}
          onRegistrar={
            registrarAccesosUsuario
          }
        />

        {selectedAcceso && (
          <ModalEditarAccesosUsuario
            key={`${selectedAcceso.idUsuario}:${selectedAcceso.idGrupo}`}
            isOpen
            canEdit={canEdit}
            acceso={selectedAcceso}
            onClose={handleCloseEditModal}
            onGuardar={
              actualizarAccesosUsuario
            }
          />
        )}
      </>
    );
  };

export default MantenerAccesosUsuarioTableCard;
