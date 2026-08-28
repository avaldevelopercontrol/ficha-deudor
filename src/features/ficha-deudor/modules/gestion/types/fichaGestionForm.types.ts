import type { OperationFeedback } from '@shared/feedback/operationFeedback';

interface GestionForm {
  nombreContacto: string;
  cargo: string;
  np0: string;
  np1: string;
  np2: string;
  estadoGestion: string;
  telefono: string;
  tipoGestion: string;
  gestorId: string;
  gestorNombre: string;
  fechaCompromisoPago: string;
  compromisoSoles: string;
  compromisoUSD: string;
  fechaNuevaGestion: string;
  horaNuevaGestion: string;
  fechaGestion: string;
  horaGestion: string;
  gestionTerminada: boolean;
  observaciones: string;
}

export type GestionFormClaro = GestionForm & {
  estadoGestionClaro: string;
  motivoNoPago: string;
};

export type SetGestionField = <K extends keyof GestionFormClaro>(
  field: K,
  value: GestionFormClaro[K]
) => void;

export type SetGestionFields = (fields: Partial<GestionFormClaro>) => void;

export type GestionFeedback = OperationFeedback;

export type FichaGestionValidationErrors = Partial<
  Record<keyof GestionFormClaro | 'montoCompromiso' | 'documentos', string>
>;
