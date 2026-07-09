import React from 'react';
import { useParams } from 'react-router-dom';

import { ActionButton } from '@shared/components/ui';
import { useEmailsByDeudor } from '../hooks/useEmailsByDeudor';
import { usePopupDeudorSearchParams } from '../../../shared/hooks/popups/usePopupDeudorSearchParams';
import { useEmailDeudorColumns } from '../hooks/useEmailDeudorColumns';
import { useEmailDeudorModalActions } from '../hooks/useEmailDeudorModalActions';
import ModalRegistrarEmail from './ModalRegistrarEmail';
import ModalEditarEmail from './ModalEditarEmail';
import {
  EMAIL_DEUDOR_POPUP_PAGE_SIZE_OPTIONS,
  EMAIL_DEUDOR_POPUP_TEXTS,
} from '../constants/emailDeudorPopup.constants';
import { buildEmailDeudorInfo } from '../utils/emailDeudorPopup.utils';
import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
  PopupPaginatedTableSection,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';

const EmailDeudorPopup: React.FC = () => {
  const { id_cliente, id_deudor, id_usuario } = useParams<{
    id_cliente: string;
    id_deudor: string;
    id_usuario: string;
  }>();

  const { nombre, documento } = usePopupDeudorSearchParams();

  const deudorData = buildEmailDeudorInfo(nombre, documento);

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
  } = useEmailsByDeudor(id_cliente ?? '', id_deudor ?? '');

  const {
    showRegistrar,
    showEditar,
    emailEditarId,
    handleNuevo,
    handleEdit,
    handleCloseRegistrar,
    handleCloseEditar,
    handleRegistrar,
    handleGuardarEdicion,
  } = useEmailDeudorModalActions({
    idCliente: id_cliente,
    idDeudor: id_deudor,
    idUsuario: id_usuario,
    refetch,
  });

  const columns = useEmailDeudorColumns({
    onEdit: handleEdit,
  });

  if (isLoading) {
    return <PopupLoadingState message={EMAIL_DEUDOR_POPUP_TEXTS.loading} />;
  }

  if (error) {
    return (
      <PopupErrorState
        title={EMAIL_DEUDOR_POPUP_TEXTS.errorTitle}
        message={error}
        retryLabel={EMAIL_DEUDOR_POPUP_TEXTS.retryButton}
        closeLabel={EMAIL_DEUDOR_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <>
      <PopupPageLayout
        logoText={EMAIL_DEUDOR_POPUP_TEXTS.logoText}
        logoSub={EMAIL_DEUDOR_POPUP_TEXTS.logoSub}
        navSection={EMAIL_DEUDOR_POPUP_TEXTS.navSection}
        navActive={EMAIL_DEUDOR_POPUP_TEXTS.navActive}
        nombre={nombre}
        documento={documento}
      >
        <PopupPaginatedTableSection
          columns={columns}
          data={paginatedData}
          allData={allData}
          emptyMessage={EMAIL_DEUDOR_POPUP_TEXTS.tableEmptyMessage}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
          totalRecords={totalRecords}
          pageNumber={pageNumber}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={EMAIL_DEUDOR_POPUP_PAGE_SIZE_OPTIONS}
          countSuffix={EMAIL_DEUDOR_POPUP_TEXTS.toolbarCountSuffix}
          onPageNumberChange={setPageNumber}
          onPageSizeChange={setPageSize}
          actions={
            <ActionButton
              label={EMAIL_DEUDOR_POPUP_TEXTS.addButton}
              variant="primary"
              size="sm"
              icon={EMAIL_DEUDOR_POPUP_TEXTS.addButtonIcon}
              onClick={handleNuevo}
            />
          }
        />
      </PopupPageLayout>

      <ModalRegistrarEmail
        isOpen={showRegistrar}
        onClose={handleCloseRegistrar}
        onRegistrar={handleRegistrar}
        deudorData={deudorData}
      />

      <ModalEditarEmail
        isOpen={showEditar}
        onClose={handleCloseEditar}
        emailId={emailEditarId}
        onGuardar={handleGuardarEdicion}
        deudorData={deudorData}
      />
    </>
  );
};

export default EmailDeudorPopup;