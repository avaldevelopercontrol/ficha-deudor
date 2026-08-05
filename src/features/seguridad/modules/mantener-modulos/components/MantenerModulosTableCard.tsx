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
  Modulo,
} from '../../../types/opcion.types';

import {
  MANTENER_MODULOS_PAGE_SIZE_OPTIONS,
  MANTENER_MODULOS_TEXTS,
} from '../constants/mantenerModulos.constants';

import {
  useMantenerModulosColumns,
} from '../hooks/useMantenerModulosColumns';

import {
  useMantenerModulosTable,
} from '../hooks/useMantenerModulosTable';

import ModalEditarModulo from './ModalEditarModulo';

import ModalRegistrarModulo from './ModalRegistrarModulo';

export const MantenerModulosTableCard =
  (): ReactNode => {
    const [
      isRegisterModalOpen,
      setIsRegisterModalOpen,
    ] =
      useState(
        false
      );

    const [
      selectedModuloId,
      setSelectedModuloId,
    ] =
      useState<
        number | null
      >(
        null
      );

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

      registrarModulo,
      actualizarModulo,
    } =
      useMantenerModulosTable();

    const handleEditModulo =
      useCallback(
        (
          modulo: Modulo
        ) => {
          setSelectedModuloId(
            modulo.idModulo
          );
        },
        []
      );

    const columns =
      useMantenerModulosColumns({
        onEditModulo:
          handleEditModulo,
      });

    const handleOpenRegisterModal =
      useCallback(
        () => {
          setIsRegisterModalOpen(
            true
          );
        },
        []
      );

    const handleCloseRegisterModal =
      useCallback(
        () => {
          setIsRegisterModalOpen(
            false
          );
        },
        []
      );

    const handleCloseEditModal =
      useCallback(
        () => {
          setSelectedModuloId(
            null
          );
        },
        []
      );

    return (
      <>
        <section
          className="mantener-modulos-card"
          aria-labelledby="mantener-modulos-list-title"
        >
          <header className="mantener-modulos-card__header">
            <div>
              <h1
                id="mantener-modulos-list-title"
                className="mantener-modulos-card__title"
              >
                {
                  MANTENER_MODULOS_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-modulos-card__description">
                {
                  MANTENER_MODULOS_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_MODULOS_TEXTS
                  .addAction
              }
              variant="primary"
              size="sm"
              icon="+"
              onClick={
                handleOpenRegisterModal
              }
              disabled={
                isLoading ||
                allData.length === 0
              }
              className="mantener-modulos-card__add-button"
            />
          </header>

          <TableResourceState
            isLoading={
              isLoading
            }
            error={
              error
            }
            onRetry={
              refetch
            }
            loadingMessage={
              MANTENER_MODULOS_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-modulos-table">
                <Table
                  columns={
                    columns
                  }
                  data={
                    paginatedData
                  }
                  allData={
                    allData
                  }
                  emptyMessage={
                    MANTENER_MODULOS_TEXTS
                      .emptyMessage
                  }
                  enableColumnFilters
                  textFilters={
                    textFilters
                  }
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
                <div className="mantener-modulos-card__pagination">
                  <Paginacion
                    paginaActual={
                      pageNumber
                    }
                    totalPaginas={
                      totalPages
                    }
                    totalRegistros={
                      totalRecords
                    }
                    indiceInicio={
                      indiceInicio
                    }
                    indiceFin={
                      indiceFin
                    }
                    onPaginaAnterior={() => {
                      setPageNumber(
                        Math.max(
                          1,
                          pageNumber -
                            1
                        )
                      );
                    }}
                    onPaginaSiguiente={() => {
                      setPageNumber(
                        Math.min(
                          totalPages,
                          pageNumber +
                            1
                        )
                      );
                    }}
                    onIrAPagina={
                      setPageNumber
                    }
                    showPageSizeSelector
                    pageSize={
                      pageSize
                    }
                    pageSizeOptions={[
                      ...MANTENER_MODULOS_PAGE_SIZE_OPTIONS,
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

        {isRegisterModalOpen && (
          <ModalRegistrarModulo
            isOpen
            modulosExistentes={
              allData
            }
            onClose={
              handleCloseRegisterModal
            }
            onRegistrar={
              registrarModulo
            }
          />
        )}

        {selectedModuloId !==
          null && (
          <ModalEditarModulo
            key={
              selectedModuloId
            }
            isOpen
            moduloId={
              selectedModuloId
            }
            modulosExistentes={
              allData
            }
            onClose={
              handleCloseEditModal
            }
            onGuardar={
              actualizarModulo
            }
          />
        )}
      </>
    );
  };

export default MantenerModulosTableCard;
