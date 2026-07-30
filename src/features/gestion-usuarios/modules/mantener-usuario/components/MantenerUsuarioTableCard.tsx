import {
  useCallback,
  useState,
  type ReactNode,
} from 'react';

import Table from '@shared/components/table/Table';

import {
  ActionButton,
} from '@shared/components/ui';

import Paginacion from '@shared/components/ui/Paginacion';

import UsuariosTableResourceState from '../../../components/UsuariosTableResourceState';

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

  const columns =
    useMantenerUsuarioColumns({
      onEditUsuario,
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

    registrarUsuario,
  } = useMantenerUsuarioTable();

  const handleOpenRegisterModal =
    useCallback(() => {
      setIsRegisterModalOpen(
        true
      );
    }, []);

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
            className="mantener-usuario-card__add-button"
          />
        </header>

        <UsuariosTableResourceState
          isLoading={
            isLoading
          }
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
        </UsuariosTableResourceState>
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
    </>
  );
};

export default MantenerUsuarioTableCard;