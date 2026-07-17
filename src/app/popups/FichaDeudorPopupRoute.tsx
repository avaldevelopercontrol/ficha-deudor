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
        '@features/ficha-deudor/modules/emails/components/EmailDeudorPopup'
      )
  ),

  'agenda-deudor': lazy(
    () =>
      import(
        '@features/ficha-deudor/modules/agenda/components/AgendaDeudorPopup'
      )
  ),

  'pago-deudor': lazy(
    () =>
      import(
        '@features/ficha-deudor/modules/pago/components/PagoDeudorPopup'
      )
  ),

  'inf-deudor': lazy(
    () =>
      import(
        '@features/ficha-deudor/modules/inf-deudor/components/InfDeudorPopup'
      )
  ),

  'lista-gestores': lazy(
    () =>
      import(
        '@features/ficha-deudor/modules/lista-gestores/components/ListaGestoresPopup'
      )
  ),

  'estado-cuenta': lazy(
    () =>
      import(
        '@features/ficha-deudor/modules/estado-cuenta/components/EstadoCuentaPopup'
      )
  ),

  'produccion-gestor-hoy': lazy(
    () =>
      import(
        '@features/gestion-deudor/modules/produccion-gestor-hoy/components/ProduccionGestorHoyPopup'
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