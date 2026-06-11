import React from 'react';
import { ModalFormLayout } from '../../layout/ModalFormLayout';
import { FormGrid } from '../../../../../shared/components/ui/FormGrid';
import { InputField, SelectField, TextAreaField } from '../../../../../shared/components/ui';
import { useModalForm } from '../../../../../shared/hooks/ui/useModalForm';
import { useTelefonoResultados, useTelefonoOperadores, useTelefonoUbicaciones, 
         useTelefonoHorarioGestion, useTelefonoFuenteBusqueda } from '../../../hooks/useTelefonosReferenciados';
import type { TelefonoFormData } from '../../../../../shared/types';
import {
  prioridadesOptions,
  referenciasOptions,
  reclamoIndecopiOptions,
} from '../../../mocks/catalogosTelefono';
import { validateTelefonoForm } from '../../../validations/telefonoValidations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar?: (data: TelefonoFormData) => void;
}

const initialForm: TelefonoFormData = {
  numero: '',
  anexo: '',
  resultado: '',
  operadorTelefonico: '',
  ubicacion: '',
  prioridad: '',
  horarioGestion: '',
  comentario: '',
  fuenteBusqueda: '',
  referencia: '',
  reclamoIndecopi: 'NO',
};

const ModalRegistrarTelefono: React.FC<Props> = ({ isOpen, onClose, onRegistrar }) => {
  // ─── API: Resultados ───
  const {
    data: resultadosData,
    isLoading: isLoadingResultados,
    error: errorResultados,
  } = useTelefonoResultados();

  const {
    data: operadoresData,
    isLoading: isLoadingOperadores,
    error: errorOperadores,
  } = useTelefonoOperadores();

  const {
    data: ubicacionesData,
    isLoading: isLoadingUbicaciones,
    error: errorUbicaciones,
  } = useTelefonoUbicaciones();

  const {
    data: horariosData,
    isLoading: isLoadingHorarios,
    error: errorHorarios,
  } = useTelefonoHorarioGestion();

  const {
    data: fuentesBusquedaData,
    isLoading: isLoadingFuentes,
    error: errorFuentes,
  } = useTelefonoFuenteBusqueda();

  const resultadosOptions = resultadosData?.map(r => ({
    id: r.id,
    label: r.nombre,
  })) ?? [];

  const operadoresOptions = operadoresData?.map(o => ({
    id: o.id,
    label: o.nombre,
  })) ?? [];

  const ubicacionesOptions = ubicacionesData?.map(u => ({
    id: u.id,
    label: u.nombre,
  })) ?? [];

  const horariosGestionOptions = horariosData?.map(h => ({
    id: h.id,
    label: h.nombre,
  })) ?? [];

  const fuentesBusquedaOptions = fuentesBusquedaData?.map(f => ({
    id: f.id,
    label: f.nombre,
  })) ?? [];

  const { form, errors, handleChange, handleSubmit, handleCancel } = useModalForm<TelefonoFormData>({
    initialForm,
    onClose,
    onSubmit: (data) => {
      onRegistrar?.(data);
    },
    validate: validateTelefonoForm,
    resetOnClose: true,
  });

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title="REGISTRAR REFERENCIA TELEFÓNICA"
      onClose={handleCancel}
      submitLabel="Registrar"
      onSubmit={handleSubmit}
      minHeight="auto"
    >
      <FormGrid columns={2}>
        <InputField
          label="Número"
          layout="inline"
          placeholder="Ingrese número telefónico"
          value={form.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          maxLength={15}
          error={errors.numero}
          required
        />
        <InputField
          label="Anexo"
          layout="inline"
          placeholder="Anexo"
          value={form.anexo}
          onChange={(e) => handleChange('anexo', e.target.value)}
          maxLength={10}
          error={errors.anexo}
        />
      </FormGrid>

      <FormGrid columns={3}>
        <SelectField
          label="Resultado"
          layout="inline"
          options={resultadosOptions}
          value={form.resultado}
          onChange={(v) => handleChange('resultado', v)}
          placeholder={isLoadingResultados ? 'Cargando...' : '-- Seleccione --'}
          error={errors.resultado || errorResultados || ''}
          required
          disabled={isLoadingResultados}
        />
        <SelectField
          label="Operador Telf."
          layout="inline"
          options={operadoresOptions}
          value={form.operadorTelefonico}
          onChange={(v) => handleChange('operadorTelefonico', v)}
          placeholder={isLoadingOperadores ? 'Cargando...' : '-- Seleccione --'}
          error={errors.operadorTelefonico || errorOperadores || ''}
          required
          disabled={isLoadingOperadores}
        />
        <SelectField
          label="Ubicación"
          layout="inline"
          options={ubicacionesOptions}
          value={form.ubicacion}
          onChange={(v) => handleChange('ubicacion', v)}
          placeholder={isLoadingUbicaciones ? 'Cargando...' : '-- Seleccione --'}
          error={errors.ubicacion || errorUbicaciones || ''}
          required
          disabled={isLoadingUbicaciones}
        />
      </FormGrid>

      <FormGrid columns={2}>
        <SelectField
          label="Prioridad"
          layout="inline"
          options={prioridadesOptions}
          value={form.prioridad}
          onChange={(v) => handleChange('prioridad', v)}
          placeholder="-- Seleccione --"
          error={errors.prioridad}
        />
        <SelectField
          label="Horario Gestión"
          layout="inline"
          options={horariosGestionOptions}
          value={form.horarioGestion}
          onChange={(v) => handleChange('horarioGestion', v)}
          placeholder={isLoadingHorarios ? 'Cargando...' : '-- Seleccione --'}
          error={errors.horarioGestion || errorHorarios || ''}
          disabled={isLoadingHorarios}
        />
      </FormGrid>

      <TextAreaField
        label="Comentario"
        layout="inline"
        placeholder="Ingrese comentario..."
        value={form.comentario}
        onChange={(e) => handleChange('comentario', e.target.value)}
        rows={2}
        error={errors.comentario}
      />

      <FormGrid columns={2}>
        <SelectField
          label="Fuente Búsqueda"
          layout="inline"
          options={fuentesBusquedaOptions}
          value={form.fuenteBusqueda}
          onChange={(v) => handleChange('fuenteBusqueda', v)}
          placeholder={isLoadingFuentes ? 'Cargando...' : '-- Seleccione --'}
          error={errors.fuenteBusqueda || errorFuentes || ''}
          disabled={isLoadingFuentes}
        />
        <SelectField
          label="Referencia"
          layout="inline"
          options={referenciasOptions}
          value={form.referencia}
          onChange={(v) => handleChange('referencia', v)}
          placeholder="-- Seleccione --"
          error={errors.referencia}
        />
      </FormGrid>

      <SelectField
        label="Reclamo Indecopi"
        layout="inline"
        options={reclamoIndecopiOptions}
        value={form.reclamoIndecopi}
        onChange={(v) => handleChange('reclamoIndecopi', v)}
        error={errors.reclamoIndecopi}
      />

      {Object.keys(errors).length > 0 && (
        <div className="error-summary">
          <strong>Por favor, corrija los siguientes errores:</strong>
          <ul>
            {Object.values(errors).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </ModalFormLayout>
  );
};

export default ModalRegistrarTelefono;