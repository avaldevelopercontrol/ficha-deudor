import {
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import Table from '@shared/components/table/Table';

import {
  ActionButton,
  OperationFeedbackMessage,
} from '@shared/components/ui';

import Paginacion from '@shared/components/ui/Paginacion';

import TableResourceState from '@shared/components/table/TableResourceState';

import {
  MANTENER_USUARIO_PAGE_SIZE_OPTIONS,
  MANTENER_USUARIO_TEXTS,
} from '../constants/mantenerUsuario.constants';

import {
  useMantenerUsuarioColumns,
} from '../hooks/useMantenerUsuarioColumns';

import {
  useMantenerUsuarioTable,
} from '../hooks/useMantenerUsuarioTable';

import type {
  UsuarioMantenible,
} from '../types/mantenerUsuario.types';

import ModalEditarUsuario from './ModalEditarUsuario';
import ModalRegistrarUsuario from './ModalRegistrarUsuario';

interface MantenerUsuarioTableCardProps {
  onEditUsuario?: (
    usuario:
      UsuarioMantenible
  ) => void;
}

export const MantenerUsuarioTableCard = ({
  onEditUsuario,
}: MantenerUsuarioTableCardProps): ReactNode => {
  const [
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  ] = useState(false);

  const [
    selectedEditUsuario,
    setSelectedEditUsuario,
  ] = useState<UsuarioMantenible | null>(null);

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

    canInsert,
    canEdit,
    registrarUsuario,
    editarUsuario,
    feedback,
    clearFeedback,
  } = useMantenerUsuarioTable();

  const handleOpenEditModal =
    useCallback(
      (usuario: UsuarioMantenible) => {
        if (!canEdit) {
          return;
        }

        clearFeedback();
        setSelectedEditUsuario(usuario);
        onEditUsuario?.(usuario);
      },
      [
        canEdit,
        clearFeedback,
        onEditUsuario,
      ]
    );

  const handleCloseEditModal =
    useCallback(() => {
      setSelectedEditUsuario(null);
    }, []);

  const columns =
    useMantenerUsuarioColumns({
      onEditUsuario:
        handleOpenEditModal,
      canEdit,
    });

  const handleOpenRegisterModal =
    useCallback(() => {
      if (!canInsert) {
        return;
      }

      clearFeedback();

      setIsRegisterModalOpen(
        true
      );
    }, [
      canInsert,
      clearFeedback,
    ]);

  const handleCloseRegisterModal =
    useCallback(() => {
      setIsRegisterModalOpen(
        false
      );
    }, []);

  return (
    <>
      <section
        className="mantener-usuario-card"
        aria-labelledby="mantener-usuario-list-title"
      >
        <header className="mantener-usuario-card__header">
          <div>
            <h1
              id="mantener-usuario-list-title"
              className="mantener-usuario-card__title"
            >
              {
                MANTENER_USUARIO_TEXTS
                  .sectionTitle
              }
            </h1>

            <p className="mantener-usuario-card__description">
              {
                MANTENER_USUARIO_TEXTS
                  .sectionDescription
              }
            </p>
          </div>

          <ActionButton
            label={
              MANTENER_USUARIO_TEXTS
                .addAction
            }
            variant="primary"
            size="sm"
            icon="+"
            onClick={
              handleOpenRegisterModal
            }
            disabled={!canInsert}
            title={
              canInsert
                ? undefined
                : 'No tiene permiso para agregar usuarios.'
            }
            className="mantener-usuario-card__add-button"
          />
        </header>

        <OperationFeedbackMessage
          feedback={feedback}
          onClose={clearFeedback}
        />

        <TableResourceState
          loadingMessage="Cargando usuarios..."
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        >
          <>
            <div className="mantener-usuario-table">
              <Table
                columns={columns}
                data={
                  paginatedData
                }
                allData={allData}
                emptyMessage={
                  MANTENER_USUARIO_TEXTS
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

            {totalRecords >
              0 && (
              <div className="mantener-usuario-card__pagination">
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
                    ...MANTENER_USUARIO_PAGE_SIZE_OPTIONS,
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

      <ModalRegistrarUsuario
        isOpen={
          isRegisterModalOpen
        }
        onClose={
          handleCloseRegisterModal
        }
        onRegistrar={
          registrarUsuario
        }
      />

      {selectedEditUsuario && (
        <ModalEditarUsuario
          isOpen
          idUsuario={
            selectedEditUsuario.id
          }
          onClose={
            handleCloseEditModal
          }
          onGuardar={editarUsuario}
        />
      )}
    </>
  );
};

export default MantenerUsuarioTableCard;