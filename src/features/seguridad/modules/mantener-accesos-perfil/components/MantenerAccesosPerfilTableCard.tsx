import {
  useCallback,
  useMemo,
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
  PerfilOpcionCount,
} from '../../../types/perfilOpcion.types';

import {
  MANTENER_ACCESOS_PERFIL_PAGE_SIZE_OPTIONS,
  MANTENER_ACCESOS_PERFIL_TEXTS,
} from '../constants/mantenerAccesosPerfil.constants';

import {
  useMantenerAccesosPerfilColumns,
} from '../hooks/useMantenerAccesosPerfilColumns';

import {
  useMantenerAccesosPerfilTable,
} from '../hooks/useMantenerAccesosPerfilTable';

import ModalAsignarAccesosPerfil from './ModalAsignarAccesosPerfil';

import ModalEditarAccesosPerfil from './ModalEditarAccesosPerfil';

import {
  getMantenerAccesosPerfilPermissionMessage,
} from '../utils/mantenerAccesosPerfilPermissions';

export const MantenerAccesosPerfilTableCard =
  (): ReactNode => {
    const [
      isAssignModalOpen,
      setIsAssignModalOpen,
    ] = useState(false);

    const [
      selectedPerfil,
      setSelectedPerfil,
    ] = useState<PerfilOpcionCount | null>(
      null
    );

    const {
      allData,
      paginatedData,

      canInsert,
      canEdit,

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
      registrarAccesosPerfil,
      actualizarAccesosPerfil,
    } = useMantenerAccesosPerfilTable();

    const handleEditPerfil =
      useCallback(
        (perfil: PerfilOpcionCount) => {
          setSelectedPerfil(perfil);
        },
        []
      );

    const columns =
      useMantenerAccesosPerfilColumns({
        onEditPerfil: handleEditPerfil,
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
        setSelectedPerfil(null);
      }, []);

    const assignedPerfilIds = useMemo(
      () =>
        allData.map(
          (perfil) => perfil.idPerfil
        ),
      [allData]
    );

    return (
      <>
        <section
          className="mantener-accesos-perfil-card"
          aria-labelledby="mantener-accesos-perfil-list-title"
        >
          <header className="mantener-accesos-perfil-card__header">
            <div>
              <h1
                id="mantener-accesos-perfil-list-title"
                className="mantener-accesos-perfil-card__title"
              >
                {
                  MANTENER_ACCESOS_PERFIL_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-accesos-perfil-card__description">
                {
                  MANTENER_ACCESOS_PERFIL_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_ACCESOS_PERFIL_TEXTS
                  .addAction
              }
              variant="primary"
              size="sm"
              icon="+"
              onClick={handleOpenAssignModal}
              disabled={!canInsert}
              title={
                !canInsert
                  ? getMantenerAccesosPerfilPermissionMessage(
                      'insertar'
                    )
                  : undefined
              }
              className="mantener-accesos-perfil-card__add-button"
            />
          </header>

          <TableResourceState
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingMessage={
              MANTENER_ACCESOS_PERFIL_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-accesos-perfil-table">
                <Table
                  columns={columns}
                  data={paginatedData}
                  allData={allData}
                  emptyMessage={
                    MANTENER_ACCESOS_PERFIL_TEXTS
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
                <div className="mantener-accesos-perfil-card__pagination">
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
                    onIrAPagina={setPageNumber}
                    showPageSizeSelector
                    pageSize={pageSize}
                    pageSizeOptions={[
                      ...MANTENER_ACCESOS_PERFIL_PAGE_SIZE_OPTIONS,
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

        <ModalAsignarAccesosPerfil
          isOpen={isAssignModalOpen}
          canInsert={canInsert}
          assignedPerfilIds={
            assignedPerfilIds
          }
          onClose={handleCloseAssignModal}
          onRegistrar={
            registrarAccesosPerfil
          }
        />

        {selectedPerfil && (
          <ModalEditarAccesosPerfil
            key={selectedPerfil.idPerfil}
            isOpen
            canEdit={canEdit}
            perfil={selectedPerfil}
            onClose={handleCloseEditModal}
            onGuardar={
              actualizarAccesosPerfil
            }
          />
        )}
      </>
    );
  };

export default MantenerAccesosPerfilTableCard;
