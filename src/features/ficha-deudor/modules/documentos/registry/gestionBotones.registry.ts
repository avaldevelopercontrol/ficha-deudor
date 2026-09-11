import { openFichaDeudorPopup } from '@app/popups';

import type { DeudorInfo } from '../../../shared/types';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';

interface GestionBotonActionContext {
  data: DeudorInfo;
  params: FichaDeudorDocumentosParams;
}

type GestionBotonHandler = (
  context: GestionBotonActionContext
) => void;

const normalizeNombreBoton = (nombre: string): string => {
  return nombre.trim().toLowerCase();
};

const GESTION_BOTONES_REGISTRY: Readonly<
  Record<string, GestionBotonHandler>
> = {
  estadocuenta: ({ data, params }) => {
    openFichaDeudorPopup('estado-cuenta', {
      idCliente: params.id_cliente,
      idCartera: params.id_cartera,
      idDeudor: params.id_deudor,
      nombre: data.nombreRazonSocial,
      documento: data.dniRuc,
    });
  },
  pagos: ({ data, params }) => {
    openFichaDeudorPopup('pago-deudor', {
      idCliente: params.id_cliente,
      idCartera: params.id_cartera,
      idDeudor: params.id_deudor,
      nombre: data.nombreRazonSocial,
      documento: data.dniRuc,
    });
  },
  email: ({ data, params }) => {
    openFichaDeudorPopup('email-deudor', {
      idCliente: params.id_cliente,
      idDeudor: params.id_deudor,
      idUsuario: params.id_usuario,
      nombre: data.nombreRazonSocial,
      documento: data.dniRuc,
    });
  },
  agendas: ({ data, params }) => {
    openFichaDeudorPopup('agenda-deudor', {
      idCliente: params.id_cliente,
      idCartera: params.id_cartera,
      idDeudor: params.id_deudor,
      idUsuario: params.id_usuario,
      nombre: data.nombreRazonSocial,
      documento: data.dniRuc,
    });
  },
  informaciondeudor: ({ data, params }) => {
    openFichaDeudorPopup('inf-deudor', {
      idCliente: params.id_cliente,
      idCartera: params.id_cartera,
      idDeudor: params.id_deudor,
      idUsuario: params.id_usuario,
      nombre: data.nombreRazonSocial,
      documento: data.dniRuc,
    });
  },
};

export const executeGestionBoton = (
  nombreBoton: string,
  context: GestionBotonActionContext
): boolean => {
  const handler =
    GESTION_BOTONES_REGISTRY[
      normalizeNombreBoton(nombreBoton)
    ];

  if (!handler) {
    return false;
  }

  handler(context);
  return true;
};

export const isGestionBotonImplemented = (
  nombreBoton: string
): boolean => {
  return Boolean(
    GESTION_BOTONES_REGISTRY[
      normalizeNombreBoton(nombreBoton)
    ]
  );
};
