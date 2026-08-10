import {
  getCurrentPeruDateTime,
  toRequiredPeruApiDateTime,
} from '../../../shared/utils/date.utils';
import { toRequiredId } from '../../../shared/utils/number.utils';
import type {
  CreateEmailRequest,
  EmailEditFormData,
  EmailFormData,
  UpdateEmailRequest,
} from '../types/email.types';

export const buildCreateEmailRequest = (
  idCliente: string,
  idDeudor: string,
  idUsuario: string,
  data: EmailFormData,
  currentDate = new Date()
): CreateEmailRequest => {
  const currentDateIso =
    getCurrentPeruDateTime(
      currentDate
    );

  return {
    nId_PersDeudor: toRequiredId(
      idDeudor,
      'nId_PersDeudor'
    ),
    cPers_Email: data.email,
    bEstado: data.estado,
    cEmail_Coment: data.comentario,
    cEmail_Contacto: data.contacto,
    nId_Cliente: toRequiredId(idCliente, 'nId_Cliente'),
    bBaseCliente: false,
    nId_UsuarioAct: toRequiredId(
      idUsuario,
      'nId_UsuarioAct'
    ),
    dFecRegistro: currentDateIso,
    dFecActualizacion: currentDateIso,
    nEmail_Prioridad: toRequiredId(
      data.prioridad,
      'nEmail_Prioridad'
    ),
    nId_PersEmailOpe: toRequiredId(
      data.status,
      'nId_PersEmailOpe'
    ),
  };
};

export const buildUpdateEmailRequest = (
  idCliente: string,
  idDeudor: string,
  idUsuario: string,
  idEmail: string,
  data: EmailEditFormData,
  registrationDate: string,
  currentDate = new Date()
): UpdateEmailRequest => {
  return {
    nId_PersEmail: toRequiredId(idEmail, 'nId_PersEmail'),
    nId_PersDeudor: toRequiredId(
      idDeudor,
      'nId_PersDeudor'
    ),
    cPers_Email: data.email,
    bEstado: data.estado,
    cEmail_Coment: data.comentario,
    cEmail_Contacto: data.contacto,
    nId_Cliente: toRequiredId(idCliente, 'nId_Cliente'),
    bBaseCliente: false,
    nId_UsuarioAct: toRequiredId(
      idUsuario,
      'nId_UsuarioAct'
    ),
    dFecRegistro:
      toRequiredPeruApiDateTime(
        registrationDate,
        'dFecRegistro'
      ),
    dFecActualizacion:
      getCurrentPeruDateTime(
        currentDate
      ),
    nEmail_Prioridad: toRequiredId(
      data.prioridad,
      'nEmail_Prioridad'
    ),
    nId_PersEmailOpe: toRequiredId(
      data.status,
      'nId_PersEmailOpe'
    ),
  };
};
