import type React from 'react';

import {
  PopupContextBoundary,
} from '@app/popups';
import {
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '@features/ficha-deudor/shared/components/popups/common';
import TableResourceState from '@shared/components/table/TableResourceState';
import {
  ActionButton,
  FeedbackMessage,
  LoadingState,
  SelectField,
} from '@shared/components/ui';

import {
  PRODUCCION_ONLINE_COLUMNS,
} from '../constants/produccionOnlineColumns.constants';
import {
  PRODUCCION_ONLINE_PAGE_SIZE_OPTIONS,
  PRODUCCION_ONLINE_TEXTS,
} from '../constants/produccionOnline.constants';
import {
  useProduccionOnline,
} from '../hooks/useProduccionOnline';

import '../styles/24-produccion-online.css';

const ProduccionOnlinePopupContent: React.FC = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    provinciaOptions,
    perfilOptions,
    clienteOptions,
    tipoLlamadaOptions,
    sortKey,
    sortDirection,
    sortFieldOptions,
    sortDirectionOptions,
    onSortKeyChange,
    onSortDirectionChange,
    catalogs,
    summary,
    allData,
    paginatedData,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    textFilters,
    selectedFilters,
    setPageNumber,
    setPageSize,
    onTextFilterChange,
    onSelectedFilterChange,
  } = useProduccionOnline();

  return (
    <PopupPageLayout
      logoText={PRODUCCION_ONLINE_TEXTS.logoText}
      logoSub={PRODUCCION_ONLINE_TEXTS.logoSub}
      navSection={PRODUCCION_ONLINE_TEXTS.navSection}
      navActive={PRODUCCION_ONLINE_TEXTS.navActive}
    >
      <div className="produccion-online">
        <section
          className="produccion-online__filters"
          aria-labelledby="produccion-online-filters-title"
        >
          <div className="produccion-online__section-heading">
            <div>
              <h1
                id="produccion-online-filters-title"
                className="produccion-online__section-title"
              >
                {PRODUCCION_ONLINE_TEXTS.filtersTitle}
              </h1>

              <p className="produccion-online__section-description">
                {PRODUCCION_ONLINE_TEXTS.filtersDescription}
              </p>
            </div>
          </div>

          {catalogs.isLoading && (
            <LoadingState
              message={PRODUCCION_ONLINE_TEXTS.loadingCatalogs}
              className="produccion-online__catalog-state"
            />
          )}

          {!catalogs.isLoading && catalogs.error && (
            <div className="produccion-online__catalog-error">
              <FeedbackMessage
                variant="error"
                title={PRODUCCION_ONLINE_TEXTS.catalogsErrorTitle}
                message={catalogs.error}
              />

              <ActionButton
                label={PRODUCCION_ONLINE_TEXTS.retry}
                variant="secondary"
                size="sm"
                onClick={() => {
                  void catalogs.refetch();
                }}
              />
            </div>
          )}

          {!catalogs.isLoading && !catalogs.error && (
            <div className="produccion-online__filter-grid">
              <SelectField<number>
                id="produccion-online-ciudad"
                label="Ciudad Gestor"
                options={provinciaOptions}
                value={filters.idUbigeo}
                onChange={(value) => {
                  setFilter('idUbigeo', value);
                }}
                hidePlaceholder
              />

              <SelectField<number>
                id="produccion-online-perfil"
                label="Perfil Gestor"
                options={perfilOptions}
                value={filters.idPerfil}
                onChange={(value) => {
                  setFilter('idPerfil', value);
                }}
                hidePlaceholder
              />

              <SelectField<number>
                id="produccion-online-tipo-llamada"
                label="Tipo Llamada"
                options={tipoLlamadaOptions}
                value={filters.idTipoLlamada}
                onChange={(value) => {
                  setFilter('idTipoLlamada', value);
                }}
                hidePlaceholder
              />

              <SelectField<number>
                id="produccion-online-cliente"
                label="Cliente Cartera"
                options={clienteOptions}
                value={filters.idCliente}
                onChange={(value) => {
                  setFilter('idCliente', value);
                }}
                hidePlaceholder
              />

              <div className="produccion-online__reset-action">
                <ActionButton
                  label={PRODUCCION_ONLINE_TEXTS.reset}
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  disabled={catalogs.isLoading}
                />
              </div>
            </div>
          )}
        </section>

        <section
          className="produccion-online__results"
          aria-label="Resumen de producción"
        >
          <TableResourceState
            isLoading={summary.isLoading}
            error={summary.error}
            onRetry={() => {
              void summary.refetch();
            }}
            loadingMessage={PRODUCCION_ONLINE_TEXTS.loadingSummary}
            errorTitle={PRODUCCION_ONLINE_TEXTS.summaryErrorTitle}
          >
            <PopupPaginatedTableSection
              columns={PRODUCCION_ONLINE_COLUMNS}
              data={paginatedData}
              allData={allData}
              emptyMessage={PRODUCCION_ONLINE_TEXTS.empty}
              textFilters={textFilters}
              selectedFilters={selectedFilters}
              onTextFilterChange={onTextFilterChange}
              onSelectedFilterChange={onSelectedFilterChange}
              totalRecords={totalRecords}
              pageNumber={pageNumber}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={[
                ...PRODUCCION_ONLINE_PAGE_SIZE_OPTIONS,
              ]}
              countSuffix={PRODUCCION_ONLINE_TEXTS.toolbarCountSuffix}
              showToolbarInfo={false}
              actions={(
                <div className="produccion-online__sort-controls">
                  <SelectField
                    id="produccion-online-sort-field"
                    label="Ordenar por"
                    layout="inline"
                    options={sortFieldOptions}
                    value={sortKey}
                    hidePlaceholder
                    disabled={summary.isLoading}
                    wrapperClassName="produccion-online__sort-field"
                    onChange={onSortKeyChange}
                  />

                  <SelectField
                    id="produccion-online-sort-direction"
                    label="Orden"
                    layout="inline"
                    options={sortDirectionOptions}
                    value={sortDirection}
                    hidePlaceholder
                    disabled={
                      summary.isLoading || !sortKey
                    }
                    wrapperClassName="produccion-online__sort-direction"
                    onChange={onSortDirectionChange}
                  />
                </div>
              )}
              onPageNumberChange={setPageNumber}
              onPageSizeChange={setPageSize}
            />
          </TableResourceState>
        </section>
      </div>
    </PopupPageLayout>
  );
};

const ProduccionOnlinePopup: React.FC = () => (
  <PopupContextBoundary popupType="produccion-online">
    {() => <ProduccionOnlinePopupContent />}
  </PopupContextBoundary>
);

export default ProduccionOnlinePopup;
