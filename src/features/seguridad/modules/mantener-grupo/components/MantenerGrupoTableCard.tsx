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
  Grupo,
} from '../../../types/grupo.types';

import {
  MANTENER_GRUPO_PAGE_SIZE_OPTIONS,
  MANTENER_GRUPO_TEXTS,
} from '../constants/mantenerGrupo.constants';

import {
  useMantenerGrupoColumns,
} from '../hooks/useMantenerGrupoColumns';

import {
  useMantenerGrupoTable,
} from '../hooks/useMantenerGrupoTable';

import {
  getMantenerGrupoPermissionMessage,
} from '../utils/mantenerGrupoPermissions';

import ModalEditarGrupo from './ModalEditarGrupo';

import ModalRegistrarGrupo from './ModalRegistrarGrupo';

export const MantenerGrupoTableCard =
  (): ReactNode => {
    const [
      isRegisterModalOpen,
      setIsRegisterModalOpen,
    ] =
      useState(
        false
      );

    const [
      selectedGrupo,
      setSelectedGrupo,
    ] =
      useState<
        Grupo | null
      >(
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

      registrarGrupo,
      actualizarGrupo,
    } =
      useMantenerGrupoTable();

    const handleEditGrupo =
      useCallback(
        (grupo: Grupo) => {
          setSelectedGrupo(
            grupo
          );
        },
        []
      );

    const columns =
      useMantenerGrupoColumns({
        onEditGrupo:
          handleEditGrupo,
      });

    const handleOpenRegisterModal =
      useCallback(
        () => {
          if (!canInsert) {
            return;
          }

          setIsRegisterModalOpen(
            true
          );
        },
        [canInsert]
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
          setSelectedGrupo(
            null
          );
        },
        []
      );

    return (
      <>
        <section
          className="mantener-grupo-card"
          aria-labelledby="mantener-grupo-list-title"
        >
          <header className="mantener-grupo-card__header">
            <div>
              <h1
                id="mantener-grupo-list-title"
                className="mantener-grupo-card__title"
              >
                {
                  MANTENER_GRUPO_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-grupo-card__description">
                {
                  MANTENER_GRUPO_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_GRUPO_TEXTS
                  .addAction
              }
              variant="primary"
              size="sm"
              icon="+"
              onClick={
                handleOpenRegisterModal
              }
              disabled={
                !canInsert
              }
              title={
                !canInsert
                  ? getMantenerGrupoPermissionMessage(
                      'insertar'
                    )
                  : undefined
              }
              className="mantener-grupo-card__add-button"
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
              MANTENER_GRUPO_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-grupo-table">
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
                    MANTENER_GRUPO_TEXTS
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
                <div className="mantener-grupo-card__pagination">
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
                      ...MANTENER_GRUPO_PAGE_SIZE_OPTIONS,
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

        <ModalRegistrarGrupo
          isOpen={
            isRegisterModalOpen
          }
          canInsert={
            canInsert
          }
          onClose={
            handleCloseRegisterModal
          }
          onRegistrar={
            registrarGrupo
          }
        />

        {selectedGrupo !==
          null && (
          <ModalEditarGrupo
            key={
              selectedGrupo.idGrupo
            }
            isOpen
            canEdit={
              canEdit
            }
            grupoId={
              selectedGrupo.idGrupo
            }
            clienteNombreActual={
              selectedGrupo.cliente
            }
            onClose={
              handleCloseEditModal
            }
            onGuardar={
              actualizarGrupo
            }
          />
        )}
      </>
    );
  };

export default MantenerGrupoTableCard;
