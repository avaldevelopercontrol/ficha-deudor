import React from 'react';
import { ModalFormLayout } from '../../ui/ModalFormLayout';
import { FormGrid } from '../../ui/FormGrid';
import { InputField, SelectField, TextAreaField } from '../../ui';
import { useModalForm } from '../../../shared/hooks/ui/useModalForm';
import type { TelefonoReferenciado, TelefonoFormData } from '../../../shared/types';
import {
  resultadosOptions,
  operadoresOptions,
  ubicacionesOptions,
  prioridadesOptions,
  horariosGestionOptions,
  fuentesBusquedaOptions,
  referenciasOptions,
  reclamoIndecopiOptions,
} from '../../../data/catalogosTelefono';
import { validateTelefonoForm } from '../../../features/ficha-deudor/validations/telefonoValidations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  telefono: TelefonoReferenciado | null;
  onGuardar?: (data: TelefonoFormData & { id: string }) => void;
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

const mapToFormData = (entity: object): TelefonoFormData => {
  const t = entity as TelefonoReferenciado;
  return {
    numero: String(t.numero),
    anexo: String(t.anexo || ''),
    resultado: String(t.estado),
    operadorTelefonico: String(t.operadorTelefonico),
    ubicacion: String(t.refUbicacion),
    prioridad: String(t.prioridad),
    horarioGestion: String(t.horario),
    comentario: '',
    fuenteBusqueda: String(t.fuente),
    referencia: String(t.referencia),
    reclamoIndecopi: String(t.reclamoIndecopi),
  };
};

const ModalEditarTelefono: React.FC<Props> = ({ isOpen, onClose, telefono, onGuardar }) => {
  const { form, errors, handleChange, handleSubmit, handleCancel } = useModalForm<TelefonoFormData>({
    initialForm,
    entity: telefono,
    mapEntityToForm: mapToFormData,
    onClose,
    onSubmit: (data) => {
      if (telefono) {
        onGuardar?.({ ...data, id: telefono.id });
      }
    },
    validate: validateTelefonoForm,
    resetOnClose: true,
  });

  if (!telefono) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title="EDITAR REFERENCIA TELEFÓNICA"
      onClose={handleCancel}
      submitLabel="Guardar Cambios"
      onSubmit={handleSubmit}
      minHeight="auto"
    >
      <FormGrid columns={2}>
        <InputField
          label="Número *"
          layout="inline"  // ← NUEVO
          placeholder="Ingrese número telefónico"
          value={form.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          maxLength={15}
          error={errors.numero}
          required
        />
        <InputField
          label="Anexo (opcional)"
          layout="inline"  // ← NUEVO
          placeholder="Anexo"
          value={form.anexo}
          onChange={(e) => handleChange('anexo', e.target.value)}
          maxLength={10}
          error={errors.anexo}
        />
      </FormGrid>

      <FormGrid columns={3}>
        <SelectField
          label="Resultado *"
          layout="inline"  // ← NUEVO
          options={resultadosOptions}
          value={form.resultado}
          onChange={(v) => handleChange('resultado', v)}
          placeholder="-- Seleccione --"
          error={errors.resultado}
          required
        />
        <SelectField
          label="Operador (opcional)"
          layout="inline"  // ← NUEVO
          options={operadoresOptions}
          value={form.operadorTelefonico}
          onChange={(v) => handleChange('operadorTelefonico', v)}
          placeholder="-- Seleccione --"
          error={errors.operadorTelefonico}
        />
        <SelectField
          label="Ubicación *"
          layout="inline"  // ← NUEVO
          options={ubicacionesOptions}
          value={form.ubicacion}
          onChange={(v) => handleChange('ubicacion', v)}
          placeholder="-- Seleccione --"
          error={errors.ubicacion}
          required
        />
      </FormGrid>

      <FormGrid columns={2}>
        <SelectField
          label="Prioridad *"
          layout="inline"  // ← NUEVO
          options={prioridadesOptions}
          value={form.prioridad}
          onChange={(v) => handleChange('prioridad', v)}
          placeholder="-- Seleccione --"
          error={errors.prioridad}
          required
        />
        <SelectField
          label="Horario Gestión *"
          layout="inline"  // ← NUEVO
          options={horariosGestionOptions}
          value={form.horarioGestion}
          onChange={(v) => handleChange('horarioGestion', v)}
          placeholder="-- Seleccione --"
          error={errors.horarioGestion}
          required
        />
      </FormGrid>

      <TextAreaField
        label="Comentario (opcional)"
        layout="inline"  // ← NUEVO
        placeholder="Ingrese comentario..."
        value={form.comentario}
        onChange={(e) => handleChange('comentario', e.target.value)}
        rows={2}
        error={errors.comentario}
      />

      <FormGrid columns={2}>
        <SelectField
          label="Fuente Búsqueda *"
          layout="inline"  // ← NUEVO
          options={fuentesBusquedaOptions}
          value={form.fuenteBusqueda}
          onChange={(v) => handleChange('fuenteBusqueda', v)}
          placeholder="-- Seleccione --"
          error={errors.fuenteBusqueda}
          required
        />
        <SelectField
          label="Referencia (opcional)"
          layout="inline"  // ← NUEVO
          options={referenciasOptions}
          value={form.referencia}
          onChange={(v) => handleChange('referencia', v)}
          placeholder="-- Seleccione --"
          error={errors.referencia}
        />
      </FormGrid>

      <SelectField
        label="Reclamo Indecopi *"
        layout="inline"  // ← NUEVO
        options={reclamoIndecopiOptions}
        value={form.reclamoIndecopi}
        onChange={(v) => handleChange('reclamoIndecopi', v)}
        error={errors.reclamoIndecopi}
        required
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

export default ModalEditarTelefono;