import React from 'react';
import { ModalFormLayout } from '../../layout/ModalFormLayout';
import { FormGrid } from '../../../../../shared/components/ui/FormGrid';
import { InputField, SelectField, TextAreaField } from '../../../../../shared/components/ui';
import { useModalForm } from '../../../../../shared/hooks/ui/useModalForm';
import type { TelefonoFormData } from '../../../../../shared/types';
import {
  resultadosOptions,
  operadoresOptions,
  ubicacionesOptions,
  prioridadesOptions,
  horariosGestionOptions,
  fuentesBusquedaOptions,
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
          label="Número *"
          layout="inline"
          placeholder="Ingrese número telefónico"
          value={form.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          maxLength={15}
          error={errors.numero}
          required
        />
        <InputField
          label="Anexo (opcional)"
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
          label="Resultado *"
          layout="inline"
          options={resultadosOptions}
          value={form.resultado}
          onChange={(v) => handleChange('resultado', v)}
          placeholder="-- Seleccione --"
          error={errors.resultado}
          required
        />
        <SelectField
          label="Operador (opcional)"
          layout="inline"
          options={operadoresOptions}
          value={form.operadorTelefonico}
          onChange={(v) => handleChange('operadorTelefonico', v)}
          placeholder="-- Seleccione --"
          error={errors.operadorTelefonico}
        />
        <SelectField
          label="Ubicación *"
          layout="inline"
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
          layout="inline"
          options={prioridadesOptions}
          value={form.prioridad}
          onChange={(v) => handleChange('prioridad', v)}
          placeholder="-- Seleccione --"
          error={errors.prioridad}
          required
        />
        <SelectField
          label="Horario Gestión *"
          layout="inline"
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
        layout="inline"
        placeholder="Ingrese comentario..."
        value={form.comentario}
        onChange={(e) => handleChange('comentario', e.target.value)}
        rows={2}
        error={errors.comentario}
      />

      <FormGrid columns={2}>
        <SelectField
          label="Fuente Búsqueda *"
          layout="inline"
          options={fuentesBusquedaOptions}
          value={form.fuenteBusqueda}
          onChange={(v) => handleChange('fuenteBusqueda', v)}
          placeholder="-- Seleccione --"
          error={errors.fuenteBusqueda}
          required
        />
        <SelectField
          label="Referencia (opcional)"
          layout="inline"
          options={referenciasOptions}
          value={form.referencia}
          onChange={(v) => handleChange('referencia', v)}
          placeholder="-- Seleccione --"
          error={errors.referencia}
        />
      </FormGrid>

      <SelectField
        label="Reclamo Indecopi *"
        layout="inline"
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

export default ModalRegistrarTelefono;