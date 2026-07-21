import type React from 'react';

import Table from '@shared/components/table/Table';
import Paginacion from '@shared/components/ui/Paginacion';

import {
  ActionButton,
} from '@shared/components/ui';

import type {
  Column,
} from '@shared/types';

import {
  GESTION_DEUDOR_PAGE_SIZE_OPTIONS,
} from '../../../constants/gestionDeudorSearch.constants';

import type {
  DeudorGestionDeudor,
} from '../../../types/gestionDeudor.types';

import {
  PRODUCCION_GESTOR_HOY_TEXTS,
} from '../../produccion-gestor-hoy/constants/produccionGestorHoy.constants';

interface GestionDeudorResultsCardProps {
  columns:
    Column<DeudorGestionDeudor>[];

  data:
    DeudorGestionDeudor[];

  isLoading: boolean;

  pageNumber: number;
  pageSize: number;

  totalRecords: number;
  totalPages: number;

  indiceInicio: number;
  indiceFin: number;

  onRowClick: (
    row: DeudorGestionDeudor
  ) => void;

  onPageNumberChange: (
    pageNumber: number
  ) => void;

  onPageSizeChange: (
    pageSize: number
  ) => void;

  onOpenProduccionGestorHoy:
    () => void;

  isProduccionGestorHoyDisabled:
    boolean;
}

export const GestionDeudorResultsCard:
  React.FC<
    GestionDeudorResultsCardProps
  > = ({
    columns,
    data,
    isLoading,

    pageNumber,
    pageSize,

    totalRecords,
    totalPages,

    indiceInicio,
    indiceFin,

    onRowClick,
    onPageNumberChange,
    onPageSizeChange,

    onOpenProduccionGestorHoy,
    isProduccionGestorHoyDisabled,
  }) => {
    return (
      <section className="gestion-deudor-card gestion-deudor-card--results">
        <div className="gestion-deudor-results-header">
          <div>
            <h2 className="gestion-deudor-card__title">
              Listado de Gestión
            </h2>

            <p className="gestion-deudor-card__subtitle">
              Seleccione un registro para
              abrir la ficha del deudor.
            </p>
          </div>

          <span className="gestion-deudor-results-count">
            {totalRecords} registro(s)
          </span>
        </div>

        {isLoading ? (
          <p className="gestion-deudor-message">
            Buscando deudores...
          </p>
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              onRowClick={onRowClick}
              emptyMessage="Sin registros para mostrar"
              fitToPanel
            />

            {totalRecords > 0 && (
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
                onPaginaAnterior={() =>
                  onPageNumberChange(
                    Math.max(
                      1,
                      pageNumber - 1
                    )
                  )
                }
                onPaginaSiguiente={() =>
                  onPageNumberChange(
                    Math.min(
                      totalPages,
                      pageNumber + 1
                    )
                  )
                }
                onIrAPagina={
                  onPageNumberChange
                }
                showPageSizeSelector
                pageSize={pageSize}
                pageSizeOptions={[
                  ...GESTION_DEUDOR_PAGE_SIZE_OPTIONS,
                ]}
                onPageSizeChange={
                  onPageSizeChange
                }
              />
            )}
          </>
        )}

        <div className="gestion-deudor-results-actions">
          <ActionButton
            label={
              PRODUCCION_GESTOR_HOY_TEXTS
                .button
            }
            variant="primary"
            size="sm"
            className="gestion-deudor-produccion-button"
            ariaLabel={
              PRODUCCION_GESTOR_HOY_TEXTS
                .button
            }
            title={
              PRODUCCION_GESTOR_HOY_TEXTS
                .button
            }
            disabled={
              isProduccionGestorHoyDisabled
            }
            onClick={
              onOpenProduccionGestorHoy
            }
          />
        </div>
      </section>
    );
  };