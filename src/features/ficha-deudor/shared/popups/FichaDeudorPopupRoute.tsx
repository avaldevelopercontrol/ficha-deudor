import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { useParams } from 'react-router-dom';

import {
  isFichaDeudorPopupType,
  type FichaDeudorPopupType,
} from './popupContext.types';

const POPUP_COMPONENTS = {
  'email-deudor': lazy(
    () =>
      import(
        '../../modules/emails/components/EmailDeudorPopup'
      )
  ),

  'agenda-deudor': lazy(
    () =>
      import(
        '../../modules/agenda/components/AgendaDeudorPopup'
      )
  ),

  'pago-deudor': lazy(
    () =>
      import(
        '../../modules/pago/components/PagoDeudorPopup'
      )
  ),

  'inf-deudor': lazy(
    () =>
      import(
        '../../modules/inf-deudor/components/InfDeudorPopup'
      )
  ),

  'lista-gestores': lazy(
    () =>
      import(
        '../../modules/lista-gestores/components/ListaGestoresPopup'
      )
  ),

  'estado-cuenta': lazy(
    () =>
      import(
        '../../modules/estado-cuenta/components/EstadoCuentaPopup'
      )
  ),
} satisfies Record<
  FichaDeudorPopupType,
  LazyExoticComponent<ComponentType>
>;

export const FichaDeudorPopupRoute = () => {
  const { popupType } = useParams<{
    popupType: string;
  }>();

  if (!isFichaDeudorPopupType(popupType)) {
    return (
      <main>
        <h1>Popup no válido</h1>
        <button
          type="button"
          onClick={() => window.close()}
        >
          Cerrar
        </button>
      </main>
    );
  }

  const PopupComponent =
    POPUP_COMPONENTS[popupType];

  return (
    <Suspense fallback={<div>Cargando popup...</div>}>
      <PopupComponent />
    </Suspense>
  );
};