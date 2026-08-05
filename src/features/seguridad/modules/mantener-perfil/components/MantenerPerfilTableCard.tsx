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
  Perfil,
} from '../../../types/perfil.types';

import {
  MANTENER_PERFIL_PAGE_SIZE_OPTIONS,
  MANTENER_PERFIL_TEXTS,
} from '../constants/mantenerPerfil.constants';

import {
  useMantenerPerfilColumns,
} from '../hooks/useMantenerPerfilColumns';

import {
  useMantenerPerfilTable,
} from '../hooks/useMantenerPerfilTable';

import ModalEditarPerfil from './ModalEditarPerfil';

import ModalRegistrarPerfil from './ModalRegistrarPerfil';

import {
  getMantenerPerfilPermissionMessage,
} from '../utils/mantenerPerfilPermissions';

export const MantenerPerfilTableCard =
  (): ReactNode => {
    const [
      isRegisterModalOpen,
      setIsRegisterModalOpen,
    ] =
      useState(
        false
      );

    const [
      selectedPerfilId,
      setSelectedPerfilId,
    ] =
      useState<
        number | null
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

      registrarPerfil,
      actualizarPerfil,
    } =
      useMantenerPerfilTable();

    const handleEditPerfil =
      useCallback(
        (
          perfil:
            Perfil
        ) => {
          setSelectedPerfilId(
            perfil.idPerfil
          );
        },
        []
      );

    const columns =
      useMantenerPerfilColumns({
        onEditPerfil:
          handleEditPerfil,
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
          setSelectedPerfilId(
            null
          );
        },
        []
      );

    return (
      <>
        <section
          className="mantener-perfil-card"
          aria-labelledby="mantener-perfil-list-title"
        >
          <header className="mantener-perfil-card__header">
            <div>
              <h1
                id="mantener-perfil-list-title"
                className="mantener-perfil-card__title"
              >
                {
                  MANTENER_PERFIL_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-perfil-card__description">
                {
                  MANTENER_PERFIL_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_PERFIL_TEXTS
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
                  ? getMantenerPerfilPermissionMessage(
                      'insertar'
                    )
                  : undefined
              }
              className="mantener-perfil-card__add-button"
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
              MANTENER_PERFIL_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-perfil-table">
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
                    MANTENER_PERFIL_TEXTS
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
                <div className="mantener-perfil-card__pagination">
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
                      ...MANTENER_PERFIL_PAGE_SIZE_OPTIONS,
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

        <ModalRegistrarPerfil
          isOpen={
            isRegisterModalOpen
          }
          canInsert={
            canInsert
          }
          perfilesExistentes={
            allData
          }
          onClose={
            handleCloseRegisterModal
          }
          onRegistrar={
            registrarPerfil
          }
        />

        {selectedPerfilId !==
          null && (
          <ModalEditarPerfil
            key={
              selectedPerfilId
            }
            isOpen
            canEdit={
              canEdit
            }
            perfilId={
              selectedPerfilId
            }
            perfilesExistentes={
              allData
            }
            onClose={
              handleCloseEditModal
            }
            onGuardar={
              actualizarPerfil
            }
          />
        )}
      </>
    );
  };

export default MantenerPerfilTableCard;