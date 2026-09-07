import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

import {
  createTelefono,
  updateTelefono,
} from './modules/telefonos-referenciados/api/telefonosReferenciadosApi';
import type {
  TelefonoFormData,
} from './modules/telefonos-referenciados/types/telefono.types';
import {
  createDireccion,
  updateDireccion,
} from './modules/direcciones-referenciadas/api/direccionesReferenciadasApi';
import type {
  DireccionEditFormData,
  DireccionFormData,
} from './modules/direcciones-referenciadas/types/direccion.types';
import {
  createEmail,
  updateEmail,
} from './modules/emails/api/emailsApi';
import type {
  EmailEditFormData,
  EmailFormData,
} from './modules/emails/types/email.types';
import {
  createAgenda,
  createGestionOpeGesContratos,
} from './modules/gestion/api/fichaGestionApi';
import type {
  CreateAgendaPayload,
  CreateGestionOpeGesContratosPayload,
} from './modules/gestion/types/fichaGestionApi.types';

const createBusinessErrorResponse = (
  messageUser: string
): Response =>
  new Response(
    JSON.stringify({
      code: '052',
      message: 'Error de negocio',
      messageUser,
      statusCode: 200,
      response: {},
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

const withBusinessErrorFetch = async (
  messageUser: string,
  run: () => Promise<unknown>
): Promise<void> => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    createBusinessErrorResponse(messageUser);

  try {
    await assert.rejects(
      run,
      new RegExp(messageUser)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
};

const telefonoForm: TelefonoFormData = {
  id: 9,
  numero: '987654321',
  anexo: '',
  resultado: '1',
  operadorTelefonico: '2',
  ubicacion: '3',
  prioridad: '4',
  horarioGestion: '5',
  comentario: 'Teléfono principal',
  fuenteBusqueda: '6',
  referencia: 7,
  reclamoIndecopi: false,
  bEstado: true,
  dFecCarga_PersTelef:
    '2026-08-01T10:00:00.000Z',
};

const direccionForm: DireccionFormData = {
  direccion: 'Av. Principal 123',
  departamento: '15',
  provincia: '1501',
  distrito: '150101',
  refUbicacion: '1',
  comentario: 'Referencia',
  llegoDeBase: false,
  tipoDeudor: 'TITULAR',
};

const direccionEditForm: DireccionEditFormData = {
  ...direccionForm,
  id: '9',
  nombreAval: '',
  estado: true,
};

const emailForm: EmailFormData = {
  email: 'deudor@example.com',
  contacto: 'Ana Torres',
  comentario: 'Correo principal',
  prioridad: '2',
  estado: true,
  status: '1',
};

const emailEditForm: EmailEditFormData = {
  ...emailForm,
  id: '9',
  dFecRegistro:
    '2026-08-01T10:00:00.000Z',
};

const agendaPayload: CreateAgendaPayload = {
  nid_agenda: 0,
  dFechNuevaGestion:
    '2026-09-08T10:00:00.000',
  nid_PersDeudor: 3,
  nombre: 'Deudor prueba',
  cartera: 'Cartera prueba',
  nid_Cartera: 2,
  nid_Cliente: 1,
  nid_UsuOpe: 5,
  dFecRegistro:
    '2026-09-07T11:00:00.000',
  cUsr_Login: 'jperez',
  nId_TipoOpeCodCliOut: 2,
  cRespuestaOpe: 'Compromiso',
  nId_OpeCodCliOut: 30,
};

const gestionPayload: CreateGestionOpeGesContratosPayload = {
  nId_DocxCobrarOpe: 0,
  nId_Cliente: 1,
  nId_Contrato: 4,
  nId_Cartera: 2,
  nId_DocxCobrars: '101',
  nId_PersDeudor: 3,
  nId_Usuario: 5,
  cNOMBRECONTACTO: 'Ana Torres',
  cCARGO: 'Titular',
  nNP0: 10,
  nNP1: 20,
  nNP2: 30,
  nESTADOGESTION: 40,
  cTELEFONO: '987654321',
  nTIPOGESTION: 3,
  nASIGNARGESTOR: null,
  dFECHACOMPROMISO: null,
  nMONTOSOLES: 0,
  nMONTODOLARES: 0,
  dFECHANUEVAGESTION: null,
  cHORANUEVAGESTION: '',
  cMINUTONUEVAGESTION: '',
  dFECHAGESTION:
    '2026-09-07T11:00:00.000',
  cHORAGESTION: '11',
  cMINUTOGESTION: '00',
  cOBSERVACION: 'Gestión de prueba',
  cSISTEMA: 'WEB',
  nESTADOGESTIONCLARO: 0,
  nMOTIVONOPAGO: 0,
  dFechaInicioGestion:
    '2026-09-07T10:55:00.000',
  dFechaFinGestion:
    '2026-09-07T11:00:00.000',
  bEstado: true,
};

export const suite = defineSuite(
  'Ficha Deudor mutation API business success',
  [
    test(
      'crear teléfono rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar el teléfono desde la API.',
          () =>
            createTelefono({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              data: telefonoForm,
            })
        );
      }
    ),
    test(
      'editar teléfono rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo actualizar el teléfono desde la API.',
          () =>
            updateTelefono({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              idTelefono: 9,
              data: telefonoForm,
            })
        );
      }
    ),
    test(
      'crear dirección rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar la dirección desde la API.',
          () =>
            createDireccion({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              data: direccionForm,
            })
        );
      }
    ),
    test(
      'editar dirección rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo actualizar la dirección desde la API.',
          () =>
            updateDireccion({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              idDireccion: '9',
              data: direccionEditForm,
            })
        );
      }
    ),
    test(
      'crear email rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar el email desde la API.',
          () =>
            createEmail({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              data: emailForm,
            })
        );
      }
    ),
    test(
      'editar email rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo actualizar el email desde la API.',
          () =>
            updateEmail({
              idCliente: '1',
              idDeudor: '3',
              idUsuario: '5',
              idEmail: '9',
              data: emailEditForm,
              fechaRegistroOriginal:
                emailEditForm.dFecRegistro,
            })
        );
      }
    ),
    test(
      'agendar gestión rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo agendar la gestión desde la API.',
          () =>
            createAgenda({
              payload: agendaPayload,
            })
        );
      }
    ),
    test(
      'guardar gestión rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo guardar la gestión desde la API.',
          () =>
            createGestionOpeGesContratos({
              payload: gestionPayload,
            })
        );
      }
    ),
  ]
);
