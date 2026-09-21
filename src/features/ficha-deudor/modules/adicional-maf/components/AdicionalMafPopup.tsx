import React from 'react';

import {
  PopupContextBoundary,
  type FichaDeudorPopupContext,
} from '@app/popups';

import {
  PopupErrorState,
  PopupLoadingState,
  PopupPageLayout,
} from '../../../shared/components/popups/common';
import { closePopupWindow } from '../../../shared/utils/popupWindow.utils';
import { ADICIONAL_MAF_POPUP_TEXTS } from '../constants/adicionalMafPopup.constants';
import { useAdicionalMaf } from '../hooks/useAdicionalMaf';
import { AdicionalMafSummary } from './AdicionalMafSummary';

interface AdicionalMafPopupContentProps {
  context: FichaDeudorPopupContext<'adicional-maf'>;
}

const AdicionalMafPopupContent: React.FC<
  AdicionalMafPopupContentProps
> = ({ context }) => {
  const {
    idCliente,
    idCartera,
    idDeudor,
    nombre,
    documento,
  } = context;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useAdicionalMaf({
    idCliente,
    idCartera,
    idDeudor,
  });

  if (isLoading) {
    return (
      <PopupLoadingState
        message={ADICIONAL_MAF_POPUP_TEXTS.loading}
      />
    );
  }

  if (error || !data) {
    return (
      <PopupErrorState
        title={ADICIONAL_MAF_POPUP_TEXTS.errorTitle}
        message={
          error ??
          'El servicio no devolvió información adicional MAF.'
        }
        retryLabel={ADICIONAL_MAF_POPUP_TEXTS.retryButton}
        closeLabel={ADICIONAL_MAF_POPUP_TEXTS.closeButton}
        onRetry={refetch}
        onClose={closePopupWindow}
      />
    );
  }

  return (
    <PopupPageLayout
      logoText={ADICIONAL_MAF_POPUP_TEXTS.logoText}
      logoSub={ADICIONAL_MAF_POPUP_TEXTS.logoSub}
      navSection={ADICIONAL_MAF_POPUP_TEXTS.navSection}
      navActive={ADICIONAL_MAF_POPUP_TEXTS.navActive}
      nombre={nombre}
      documento={documento}
    >
      <AdicionalMafSummary data={data} />
    </PopupPageLayout>
  );
};

const AdicionalMafPopup: React.FC = () => {
  return (
    <PopupContextBoundary popupType="adicional-maf">
      {(context) => (
        <AdicionalMafPopupContent context={context} />
      )}
    </PopupContextBoundary>
  );
};

export default AdicionalMafPopup;
