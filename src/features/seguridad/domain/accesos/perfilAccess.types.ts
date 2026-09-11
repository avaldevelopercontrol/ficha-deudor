import type {
  Modulo,
} from '../../types/opcion.types';

import type {
  AccessAssignment,
  AccessOptionsFormData,
} from './access.types';

export interface PerfilAccesoOption {
  idPerfil: number;
  nombrePerfil: string;
  estadoActivo: boolean;
}

export interface AsignarAccesosPerfilFormData extends AccessOptionsFormData {
  perfilId: number | '';
}

export interface AsignarAccesosPerfilCatalog {
  perfiles: PerfilAccesoOption[];
  opciones: Modulo[];
}

export type PerfilOpcionAssignment = AccessAssignment;

export interface RegistrarPerfilOpcionesData {
  perfilId: number;
  assignments: PerfilOpcionAssignment[];
}
