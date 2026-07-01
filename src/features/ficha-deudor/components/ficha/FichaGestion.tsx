import React, { useState } from 'react';
import { SelectField, TextAreaField, CheckboxField } from '../../../../shared/components/ui';
import {
  useGestionEstados,
  useGestionTipos,
  useGestionPaletaRespuesta,
  useGestionEstadoGestionClaro,
  useGestionMotivoNoPago,
} from '../../hooks/useFichaGestion';
import type { GestionForm } from '../../../../shared/types/indexApi';
import Modal from '../../../../shared/components/modals/Modal';

interface Props {
  idCliente: string;
  idCartera: string;
  idContrato: string;
  onSubmit?: (data: GestionFormClaro) => void;
}

type GestionFormClaro = GestionForm & {
  estadoGestionClaro: string;
  motivoNoPago: string;
};

const ID_CLIENTE_CLARO = '95';
const TIPO_GESTION_PALETA = '3';

const initialForm: GestionFormClaro = {
  nombreContacto: '',
  cargo: '',
  np0: '',
  np1: '',
  np2: '',
  estadoGestion: '',
  telefono: '',
  tipoGestion: '',
  gestorId: '',
  gestorNombre: '',
  fechaCompromisoPago: '',
  compromisoSoles: '',
  compromisoUSD: '',
  fechaNuevaGestion: '',
  horaNuevaGestion: '',
  fechaGestion: '',
  horaGestion: '',
  gestionTerminada: false,
  observaciones: '',
  estadoGestionClaro: '',
  motivoNoPago: '',
};

const FichaGestion: React.FC<Props> = ({
  idCliente,
  idCartera,
  idContrato,
  onSubmit,
}) => {
  const [form, setForm] = useState<GestionFormClaro>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle] = useState('');

  const usuarioActual = 'CARLOS R. (Gestor)';
  const mostrarCamposClaro = String(idCliente) === ID_CLIENTE_CLARO;

  const set = <K extends keyof GestionFormClaro>(
    field: K,
    value: GestionFormClaro[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNP0Change = (val: string) => {
    set('np0', val);
    set('np1', '');
    set('np2', '');
  };

  const handleNP1Change = (val: string) => {
    set('np1', val);
    set('np2', '');
  };

  const handleAgendar = () => {
    if (form.fechaNuevaGestion && form.horaNuevaGestion) {
      const mensaje = `Gestión agendada para: ${form.fechaNuevaGestion} a las ${form.horaNuevaGestion} por ${usuarioActual}`;
      console.log(mensaje);
      alert(mensaje);
      set('fechaGestion', form.fechaNuevaGestion);
      set('horaGestion', form.horaNuevaGestion);
    } else {
      alert('Por favor seleccione fecha y hora para agendar');
    }
  };

  const {
    data: estadosData,
    isLoading: isLoadingEstados,
    error: errorEstados,
  } = useGestionEstados(idCliente);

  const estadosOptions = estadosData?.map((e) => ({
    id: e.id,
    label: e.nombre,
  })) ?? [];

  const {
    data: tiposData,
    isLoading: isLoadingTipos,
    error: errorTipos,
  } = useGestionTipos();

  const tiposOptions = tiposData?.map((t) => ({
    id: t.id,
    label: t.nombre,
  })) ?? [];

  const {
    data: np0Data,
    isLoading: isLoadingNP0,
    error: errorNP0,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    0,
    '0',
    TIPO_GESTION_PALETA
  );

  const {
    data: np1Data,
    isLoading: isLoadingNP1,
    error: errorNP1,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    1,
    form.np0,
    TIPO_GESTION_PALETA
  );

  const {
    data: np2Data,
    isLoading: isLoadingNP2,
    error: errorNP2,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    2,
    form.np1,
    TIPO_GESTION_PALETA
  );

  const np0Options = np0Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const np1Options = np1Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const np2Options = np2Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const {
    data: estadoGestionClaroData,
    isLoading: isLoadingEstadoGestionClaro,
    error: errorEstadoGestionClaro,
  } = useGestionEstadoGestionClaro(idCliente, idCartera);

  const estadoGestionClaroOptions = estadoGestionClaroData?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const {
    data: motivoNoPagoData,
    isLoading: isLoadingMotivoNoPago,
    error: errorMotivoNoPago,
  } = useGestionMotivoNoPago(idCliente, idCartera);

  const motivoNoPagoOptions = motivoNoPagoData?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const handleLimpiar = () => {
    setForm(initialForm);
  };

  const handleGuardar = () => {
    onSubmit?.(form);
  };

  return (
    <div className="ficha-card">
      <div className="ficha-gestion-header">
        <span className="fg-title">FICHA DE GESTIÓN</span>
      </div>

      {/* BLOQUE 1: DATOS PRINCIPALES */}
      <div className="ficha-block ficha-block--with-side-title" style={{ minHeight: 'auto' }}>
        <div className="block-side-title-wrapper">
          <div className="block-side-title">DATOS PRINCIPALES</div>
        </div>

        <div className="block-content">
          <div className="form-grid g2 form-grid--inline" style={{ marginBottom: '12px' }}>
            <div className="form-row-inline">
              <label className="form-label form-label--inline">Nombre Contacto:</label>
              <input
                type="text"
                className="form-input form-input--inline-field"
                placeholder="Ingresar nombre..."
                value={form.nombreContacto}
                onChange={(e) => set('nombreContacto', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Cargo:</label>
              <input
                type="text"
                className="form-input form-input--inline-field"
                placeholder="Ingresar cargo..."
                value={form.cargo}
                onChange={(e) => set('cargo', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid g3" style={{ marginBottom: '12px' }}>
            <SelectField
              label="NP0"
              options={np0Options}
              value={form.np0}
              onChange={handleNP0Change}
              placeholder={isLoadingNP0 ? 'Cargando NP0...' : 'Seleccionar NP0...'}
              disabled={isLoadingNP0}
              error={errorNP0 || ''}
            />

            <SelectField
              label="NP1"
              options={np1Options}
              value={form.np1}
              onChange={handleNP1Change}
              placeholder={
                !form.np0
                  ? 'Primero seleccione NP0'
                  : isLoadingNP1
                    ? 'Cargando NP1...'
                    : 'Seleccionar NP1...'
              }
              disabled={!form.np0 || isLoadingNP1}
              error={form.np0 ? errorNP1 || '' : ''}
            />

            <SelectField
              label="NP2"
              options={np2Options}
              value={form.np2}
              onChange={(val) => set('np2', val)}
              placeholder={
                !form.np1
                  ? 'Primero seleccione NP1'
                  : isLoadingNP2
                    ? 'Cargando NP2...'
                    : 'Seleccionar NP2...'
              }
              disabled={!form.np1 || isLoadingNP2}
              error={form.np1 ? errorNP2 || '' : ''}
            />
          </div>

          <div className="form-grid g3" style={{ marginBottom: '12px' }}>
            <SelectField
              label="Estado de Gestión"
              options={estadosOptions}
              value={form.estadoGestion}
              onChange={(val) => set('estadoGestion', val)}
              placeholder={isLoadingEstados ? 'Cargando...' : 'Seleccionar estado...'}
              disabled={isLoadingEstados}
              error={errorEstados || ''}
            />

            <SelectField
              label="Tipo de Gestión"
              options={tiposOptions}
              value={form.tipoGestion}
              onChange={(val) => set('tipoGestion', val)}
              placeholder={isLoadingTipos ? 'Cargando...' : 'Seleccionar tipo...'}
              disabled={isLoadingTipos}
              error={errorTipos || ''}
            />

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div className="tel-input-group">
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Ingresar teléfono..."
                  value={form.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-whatsapp btn-whatsapp--compact"
                  onClick={() => {
                    const telefono = form.telefono.replace(/\D/g, '');

                    if (!telefono) {
                      alert('Por favor ingrese un número de teléfono');
                      return;
                    }

                    const mensaje = encodeURIComponent(
                      'Hola, me comunico de [Empresa] respecto a su gestión.'
                    );

                    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
                  }}
                  disabled={!form.telefono}
                  title="Abrir WhatsApp"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="gestor-row gestor-row--compact">
            <button className="btn btn-info btn-xs" type="button">
              🔍 Buscar Gestor
            </button>

            <input
              type="text"
              className="form-input form-input--xs"
              placeholder="ID Gestor"
              value={form.gestorId}
              onChange={(e) => set('gestorId', e.target.value)}
              readOnly
              style={{ width: '70px' }}
            />

            <input
              type="text"
              className="form-input form-input--xs"
              placeholder="Nombre del gestor"
              value={form.gestorNombre}
              onChange={(e) => set('gestorNombre', e.target.value)}
              readOnly
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* BLOQUE 2: ACCIONES A TOMAR */}
      <div className="ficha-block ficha-block--with-side-title">
        <div className="block-side-title-wrapper">
          <div className="block-side-title">ACCIONES A TOMAR</div>
        </div>

        <div className="block-content">
          <div className="form-grid g3 form-grid--inline" style={{ marginBottom: '12px' }}>
            <div className="form-row-inline">
              <label className="form-label form-label--inline">Fecha Compromiso:</label>
              <input
                type="date"
                className="form-input form-input--inline-field"
                value={form.fechaCompromisoPago}
                onChange={(e) => set('fechaCompromisoPago', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Compromiso S/.:</label>
              <input
                type="number"
                className="form-input form-input--inline-field"
                placeholder="0.00"
                value={form.compromisoSoles}
                onChange={(e) => set('compromisoSoles', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Compromiso $US:</label>
              <input
                type="number"
                className="form-input form-input--inline-field"
                placeholder="0.00"
                value={form.compromisoUSD}
                onChange={(e) => set('compromisoUSD', e.target.value)}
              />
            </div>
          </div>

          <div
            className="agendar-gestion-row agendar-gestion-row--compact agendar-gestion-row--inline"
            style={{ marginBottom: '12px' }}
          >
            <div className="form-row-inline">
              <label className="form-label form-label--inline">Fecha Nueva Gestión:</label>
              <input
                type="date"
                className="form-input form-input--inline-field"
                value={form.fechaNuevaGestion}
                onChange={(e) => set('fechaNuevaGestion', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Hora:</label>
              <input
                type="time"
                className="form-input form-input--inline-field"
                value={form.horaNuevaGestion}
                onChange={(e) => set('horaNuevaGestion', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Usuario:</label>
              <input
                type="text"
                className="form-input form-input--inline-field"
                value={usuarioActual}
                readOnly
                disabled
              />
            </div>

            <button
              className="btn btn-primary btn-xs agendar-btn"
              type="button"
              onClick={handleAgendar}
            >
              Agendar
            </button>
          </div>

          <div className="fecha-gestion-row fecha-gestion-row--compact fecha-gestion-row--inline">
            <div className="form-row-inline">
              <label className="form-label form-label--inline">Fecha de Gestión:</label>
              <input
                type="date"
                className="form-input form-input--inline-field"
                value={form.fechaGestion}
                onChange={(e) => set('fechaGestion', e.target.value)}
              />
            </div>

            <div className="form-row-inline">
              <label className="form-label form-label--inline">Hora:</label>
              <input
                type="time"
                className="form-input form-input--inline-field"
                value={form.horaGestion}
                onChange={(e) => set('horaGestion', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: RESULTADOS DE LA LLAMADA */}
      <div className="ficha-block ficha-block--with-side-title">
        <div className="block-side-title-wrapper">
          <div className="block-side-title">RESULTADOS DE LA LLAMADA</div>
        </div>

        <div className="block-content">
          {mostrarCamposClaro ? (
            <>
              <div className="resultados-row">
                <CheckboxField
                  label="Gestión Terminada"
                  checked={form.gestionTerminada}
                  onChange={(val) => set('gestionTerminada', val)}
                />

                <TextAreaField
                  label="Observaciones"
                  placeholder="Ingresar observaciones..."
                  value={form.observaciones}
                  onChange={(e) => set('observaciones', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-grid g2" style={{ marginTop: '12px', marginBottom: '12px' }}>
                <SelectField
                  label="Estado Gestion Claro:"
                  options={estadoGestionClaroOptions}
                  value={form.estadoGestionClaro}
                  onChange={(val) => set('estadoGestionClaro', val)}
                  placeholder={
                    isLoadingEstadoGestionClaro
                      ? 'Cargando Estado Gestion Claro...'
                      : 'Seleccionar Estado Gestion Claro...'
                  }
                  disabled={isLoadingEstadoGestionClaro}
                  error={errorEstadoGestionClaro || ''}
                />

                <SelectField
                  label="Motivo No Pago:"
                  options={motivoNoPagoOptions}
                  value={form.motivoNoPago}
                  onChange={(val) => set('motivoNoPago', val)}
                  placeholder={
                    isLoadingMotivoNoPago
                      ? 'Cargando Motivo No Pago...'
                      : 'Seleccionar Motivo No Pago...'
                  }
                  disabled={isLoadingMotivoNoPago}
                  error={errorMotivoNoPago || ''}
                />
              </div>
            </>
          ) : (
            <div className="resultados-row">
              <CheckboxField
                label="Gestión Terminada"
                checked={form.gestionTerminada}
                onChange={(val) => set('gestionTerminada', val)}
              />

              <TextAreaField
                label="Observaciones"
                placeholder="Ingresar observaciones..."
                value={form.observaciones}
                onChange={(e) => set('observaciones', e.target.value)}
                rows={2}
              />
            </div>
          )}

          <div className="ficha-submit ficha-submit--compact">
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={handleLimpiar}
            >
              Limpiar
            </button>

            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={handleGuardar}
            >
              Guardar Gestión
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default FichaGestion;