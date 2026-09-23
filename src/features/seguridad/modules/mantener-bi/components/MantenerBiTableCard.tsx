import {
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import Table from '@shared/components/table/Table';

import TableResourceState from '@shared/components/table/TableResourceState';

import {
  ActionButton,
  OperationFeedbackMessage,
} from '@shared/components/ui';

import Paginacion from '@shared/components/ui/Paginacion';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  MANTENER_BI_PAGE_SIZE_OPTIONS,
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

import {
  useMantenerBiColumns,
} from '../hooks/useMantenerBiColumns';

import {
  useMantenerBiTable,
} from '../hooks/useMantenerBiTable';

import ModalEditarBi from './ModalEditarBi';
import ModalRegistrarBi from './ModalRegistrarBi';

export const MantenerBiTableCard =
  (): ReactNode => {
    const [
      isRegisterModalOpen,
      setIsRegisterModalOpen,
    ] =
      useState(
        false
      );

    const [
      selectedBiId,
      setSelectedBiId,
    ] =
      useState<
        number | null
      >(
        null
      );

    const {
      modulos,
      allData,
      paginatedData,

      canInsert,
      canEdit,
      powerBiParentAvailable,

      feedback,
      clearFeedback,

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

      registrarBi,
      actualizarBi,
    } =
      useMantenerBiTable();

    const handleEditBi =
      useCallback(
        (bi: Modulo) => {
          clearFeedback();
          setSelectedBiId(
            bi.idModulo
          );
        },
        [clearFeedback]
      );

    const columns =
      useMantenerBiColumns({
        onEditBi: handleEditBi,
      });

    const handleOpenRegisterModal =
      useCallback(
        () => {
          if (
            !canInsert ||
            !powerBiParentAvailable
          ) {
            return;
          }

          clearFeedback();
          setIsRegisterModalOpen(
            true
          );
        },
        [
          canInsert,
          clearFeedback,
          powerBiParentAvailable,
        ]
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
          setSelectedBiId(
            null
          );
        },
        []
      );

    const addButtonTitle =
      !canInsert
        ? MANTENER_BI_TEXTS.addUnavailable
        : !powerBiParentAvailable
          ? MANTENER_BI_TEXTS.powerBiParentUnavailable
          : undefined;

    return (
      <>
        <section
          className="mantener-bi-card"
          aria-labelledby="mantener-bi-list-title"
        >
          <header className="mantener-bi-card__header">
            <div>
              <h1
                id="mantener-bi-list-title"
                className="mantener-bi-card__title"
              >
                {
                  MANTENER_BI_TEXTS
                    .sectionTitle
                }
              </h1>

              <p className="mantener-bi-card__description">
                {
                  MANTENER_BI_TEXTS
                    .sectionDescription
                }
              </p>
            </div>

            <ActionButton
              label={
                MANTENER_BI_TEXTS
                  .addAction
              }
              variant="primary"
              size="sm"
              icon="+"
              onClick={
                handleOpenRegisterModal
              }
              disabled={
                !canInsert ||
                isLoading ||
                !powerBiParentAvailable
              }
              title={addButtonTitle}
              className="mantener-bi-card__add-button"
            />
          </header>

          <OperationFeedbackMessage
            feedback={feedback}
            onClose={clearFeedback}
          />

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
              MANTENER_BI_TEXTS
                .loadingMessage
            }
          >
            <>
              <div className="mantener-bi-table">
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
                    MANTENER_BI_TEXTS
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
                <div className="mantener-bi-card__pagination">
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
                      ...MANTENER_BI_PAGE_SIZE_OPTIONS,
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
          <ModalRegistrarBi
            isOpen
            canInsert={canInsert}
            modulosExistentes={
              modulos
            }
            onClose={
              handleCloseRegisterModal
            }
            onRegistrar={
              registrarBi
            }
          />
        )}

        {selectedBiId !==
          null && (
          <ModalEditarBi
            key={selectedBiId}
            isOpen
            canEdit={canEdit}
            moduloId={
              selectedBiId
            }
            modulosExistentes={
              modulos
            }
            onClose={
              handleCloseEditModal
            }
            onGuardar={
              actualizarBi
            }
          />
        )}
      </>
    );
  };

export default MantenerBiTableCard;
