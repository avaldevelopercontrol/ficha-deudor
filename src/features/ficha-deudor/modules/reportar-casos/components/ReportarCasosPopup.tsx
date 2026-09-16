import React from 'react';

import {
  PopupContextBoundary,
  type FichaDeudorPopupContext,
} from '@app/popups';
import {
  ActionButton,
  OperationFeedbackMessage,
} from '@shared/components/ui';

import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';
import {
  REPORTAR_CASOS_POPUP_PAGE_SIZE_OPTIONS,
  REPORTAR_CASOS_POPUP_TEXTS,
} from '../constants/reportarCasosPopup.constants';
import { useReportarCasos } from '../hooks/useReportarCasos';
import { useReportarCasosColumns } from '../hooks/useReportarCasosColumns';
import { useReportarCasosModalActions } from '../hooks/useReportarCasosModalActions';
import { buildReportarCasoDeudorInfo } from '../utils/reportarCasosPopup.utils';
import ModalCrearReportarCaso from './ModalCrearReportarCaso';
import ModalEditarReportarCaso from './ModalEditarReportarCaso';

interface ReportarCasosPopupContentProps {
  context: FichaDeudorPopupContext<'reportar-caso'>;
}

const ReportarCasosPopupContent: React.FC<
  ReportarCasosPopupContentProps
> = ({ context }) => {
  const {
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    nombre,
    documento,
  } = context;

  const deudorData = buildReportarCasoDeudorInfo(
    nombre,
    documento
  );

  const {
    allData,
    paginatedData,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
  } = useReportarCasos(idCliente, idCartera, idDeudor);

  const {
    feedback,
    clearFeedback,
    showRegistrar,
    showEditar,
    casoEditarId,
    handleNuevo,
    handleEdit,
    handleCloseRegistrar,
    handleCloseEditar,
    handleRegistrar,
    handleGuardarEdicion,
  } = useReportarCasosModalActions({
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    refetch,
  });

  const columns = useReportarCasosColumns({ onEdit: handleEdit });

  if (isLoading) {
    return (
      <PopupLoadingState
        message={REPORTAR_CASOS_POPUP_TEXTS.loading}
      />
    );
  }

  if (error) {
    return (
      <PopupErrorState
        title={REPORTAR_CASOS_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={REPORTAR_CASOS_POPUP_TEXTS.retryButton}
        closeLabel={REPORTAR_CASOS_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <>
      <PopupPageLayout
        logoText={REPORTAR_CASOS_POPUP_TEXTS.logoText}
        logoSub={REPORTAR_CASOS_POPUP_TEXTS.logoSub}
        navSection={REPORTAR_CASOS_POPUP_TEXTS.navSection}
        navActive={REPORTAR_CASOS_POPUP_TEXTS.navActive}
        nombre={nombre}
        documento={documento}
      >
        <OperationFeedbackMessage
          feedback={feedback}
          onClose={clearFeedback}
        />

        <PopupPaginatedTableSection
          columns={columns}
          data={paginatedData}
          allData={allData}
          emptyMessage={REPORTAR_CASOS_POPUP_TEXTS.tableEmptyMessage}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
          totalRecords={totalRecords}
          pageNumber={pageNumber}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={REPORTAR_CASOS_POPUP_PAGE_SIZE_OPTIONS}
          countSuffix={REPORTAR_CASOS_POPUP_TEXTS.toolbarCountSuffix}
          onPageNumberChange={setPageNumber}
          onPageSizeChange={setPageSize}
          actions={
            <ActionButton
              label={REPORTAR_CASOS_POPUP_TEXTS.addButton}
              variant="primary"
              size="sm"
              icon={REPORTAR_CASOS_POPUP_TEXTS.addButtonIcon}
              onClick={handleNuevo}
            />
          }
        />
      </PopupPageLayout>

      {showRegistrar && (
        <ModalCrearReportarCaso
          isOpen
          onClose={handleCloseRegistrar}
          onRegistrar={handleRegistrar}
          deudorData={deudorData}
        />
      )}

      {showEditar && (
        <ModalEditarReportarCaso
          isOpen
          casoId={casoEditarId}
          onClose={handleCloseEditar}
          onGuardar={handleGuardarEdicion}
          deudorData={deudorData}
        />
      )}
    </>
  );
};

const ReportarCasosPopup: React.FC = () => {
  return (
    <PopupContextBoundary popupType="reportar-caso">
      {(context) => (
        <ReportarCasosPopupContent context={context} />
      )}
    </PopupContextBoundary>
  );
};

export default ReportarCasosPopup;
