import React from 'react';

import { useFichaGestionAccionesTomar } from '../hooks/useFichaGestionAccionesTomar';
import type { FichaGestionAccionesTomarProps } from '../types/fichaGestion.types';
import GestionTimePicker from './shared/GestionTimePicker';

const FichaGestionAccionesTomar: React.FC<
  FichaGestionAccionesTomarProps
> = ({
  form,
  setField,
  setFields,
  usuarioActual,
  handleAgendar,
}) => {
  const {
    puedeIngresarCompromiso,
    puedeSeleccionarHoraNuevaGestion,
    puedeSeleccionarHoraGestion,
    handleFechaCompromisoChange,
    handleCompromisoSolesChange,
    handleCompromisoUsdChange,
    handleFechaNuevaGestionChange,
    handleHoraNuevaGestionChange,
    handleFechaGestionChange,
    handleHoraGestionChange,
  } = useFichaGestionAccionesTomar({
    form,
    setField,
    setFields,
  });

  return (
    <div className="ficha-block ficha-block--with-side-title ficha-block--compact-gestion ficha-block--acciones-tomar">
      <div className="block-side-title-wrapper">
        <div className="block-side-title">ACCIONES A TOMAR</div>
      </div>

      <div className="block-content block-content--compact-gestion">
        <div
          className="form-grid g3 form-grid--inline"
          style={{ marginBottom: '6px' }}
        >
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Fecha Compromiso:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaCompromisoPago}
              onChange={handleFechaCompromisoChange}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Compromiso S/.:
            </label>

            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoSoles}
              disabled={!puedeIngresarCompromiso}
              onChange={handleCompromisoSolesChange}
            />
          </div>

          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Compromiso $US:
            </label>

            <input
              type="text"
              inputMode="decimal"
              className="form-input form-input--inline-field"
              placeholder="0.00"
              value={form.compromisoUSD}
              disabled={!puedeIngresarCompromiso}
              onChange={handleCompromisoUsdChange}
            />
          </div>
        </div>

        <div
          className="agendar-gestion-row agendar-gestion-row--compact agendar-gestion-row--inline"
          style={{ marginBottom: '6px' }}
        >
          <div className="form-row-inline">
            <label className="form-label form-label--inline">
              Fecha Nueva Gestión:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaNuevaGestion}
              onChange={handleFechaNuevaGestionChange}
            />
          </div>

          <GestionTimePicker
            value={form.horaNuevaGestion}
            disabled={!puedeSeleccionarHoraNuevaGestion}
            onChange={handleHoraNuevaGestionChange}
          />

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
            <label className="form-label form-label--inline">
              Fecha de Gestión:
            </label>

            <input
              type="date"
              className="form-input form-input--inline-field"
              value={form.fechaGestion}
              onChange={handleFechaGestionChange}
            />
          </div>

          <GestionTimePicker
            value={form.horaGestion}
            disabled={!puedeSeleccionarHoraGestion}
            onChange={handleHoraGestionChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FichaGestionAccionesTomar;