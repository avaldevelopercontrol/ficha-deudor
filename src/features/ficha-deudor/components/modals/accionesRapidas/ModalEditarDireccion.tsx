import React, { useEffect, useState } from 'react';
import { ModalFormLayout } from '../../../../../shared/components/ui/ModalFormLayout';
import { FormGrid } from '../../../../../shared/components/ui/FormGrid';
import { InputField, SelectField, TextAreaField } from '../../../../../shared/components/ui';
import { useModalForm } from '../../../../../shared/hooks/ui/useModalForm';
import type { DireccionReferenciada, DireccionEditFormData } from '../../../../../shared/types';
import {
  refUbicacionDirOptions,
  llegoDeBaseOptions,
  tipoDeudorOptions,
  estadosDireccionOptions,
  getDepartamentos,
  getProvinciasByDepartamento,
  getDistritosByProvincia,
} from '../../../mocks/catalogosDireccion';
import { validateDireccionEditForm } from '../../../validations/direccionValidations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  direccion: DireccionReferenciada | null;
  onGuardar?: (data: DireccionEditFormData & { id: string }) => void;
}

const initialForm: DireccionEditFormData = {
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  refUbicacion: '',
  comentario: '',
  llegoDeBase: '',
  tipoDeudor: '',
  nombreAval: '',
  estado: '',
};

const mapToFormData = (entity: object): DireccionEditFormData => {
  const d = entity as DireccionReferenciada;
  return {
    direccion: d.direccion.split(',')[0] || d.direccion,
    departamento: d.departamento || '',
    provincia: d.provincia || '',
    distrito: d.distrito || '',
    refUbicacion: d.refUbicacion || '',
    comentario: d.comentario || '',
    llegoDeBase: d.llegoDeBase || '',
    tipoDeudor: d.tipoDeudor || '',
    nombreAval: d.nombreAval || (d.tipoDeudor === 'Titular' ? '—' : ''),
    estado: d.estado || '',
  };
};

const ModalEditarDireccion: React.FC<Props> = ({ isOpen, onClose, direccion, onGuardar }) => {
  const [provincias, setProvincias] = useState<Array<{ id: string; label: string }>>([]);
  const [distritos, setDistritos] = useState<Array<{ id: string; label: string }>>([]);

  const { form, errors, handleChange, handleSubmit, handleCancel } = useModalForm<DireccionEditFormData>({
    initialForm,
    entity: direccion,
    mapEntityToForm: mapToFormData,
    onClose,
    onSubmit: (data) => {
      if (direccion) {
        onGuardar?.({ ...data, id: direccion.id });
      }
    },
    validate: validateDireccionEditForm,
    resetOnClose: true,
  });

  const departamentos = getDepartamentos();

  useEffect(() => {
    if (form.departamento) {
      const nuevasProvincias = getProvinciasByDepartamento(form.departamento);
      setProvincias(nuevasProvincias);
      if (form.provincia && !nuevasProvincias.find(p => p.id === form.provincia)) {
        handleChange('provincia', '');
        handleChange('distrito', '');
        setDistritos([]);
      }
    } else {
      setProvincias([]);
      setDistritos([]);
    }
  }, [form.departamento]);

  useEffect(() => {
    if (form.departamento && form.provincia) {
      const nuevosDistritos = getDistritosByProvincia(form.departamento, form.provincia);
      setDistritos(nuevosDistritos);
      if (form.distrito && !nuevosDistritos.find(d => d.id === form.distrito)) {
        handleChange('distrito', '');
      }
    } else {
      setDistritos([]);
    }
  }, [form.departamento, form.provincia]);

  if (!direccion) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title="EDITAR DIRECCIÓN"
      onClose={handleCancel}
      submitLabel="Guardar Cambios"
      onSubmit={handleSubmit}
      minHeight="auto"
    >
      <InputField
        label="Dirección *"
        layout="inline"  // ← NUEVO
        placeholder="Ingrese dirección completa"
        value={form.direccion}
        onChange={(e) => handleChange('direccion', e.target.value)}
        error={errors.direccion}
        required
      />

      <FormGrid columns={3}>
        <SelectField
          label="Departamento *"
          layout="inline"  // ← NUEVO
          options={departamentos}
          value={form.departamento}
          onChange={(v) => handleChange('departamento', v)}
          placeholder="-- Seleccione --"
          error={errors.departamento}
          required
        />
        <SelectField
          label="Provincia *"
          layout="inline"  // ← NUEVO
          options={provincias}
          value={form.provincia}
          onChange={(v) => handleChange('provincia', v)}
          placeholder="-- Seleccione --"
          disabled={!form.departamento}
          error={errors.provincia}
          required
        />
        <SelectField
          label="Distrito *"
          layout="inline"  // ← NUEVO
          options={distritos}
          value={form.distrito}
          onChange={(v) => handleChange('distrito', v)}
          placeholder="-- Seleccione --"
          disabled={!form.provincia}
          error={errors.distrito}
          required
        />
      </FormGrid>

      <SelectField
        label="Referencia de Ubicación *"
        layout="inline"  // ← NUEVO
        options={refUbicacionDirOptions}
        value={form.refUbicacion}
        onChange={(v) => handleChange('refUbicacion', v)}
        placeholder="-- Seleccione --"
        error={errors.refUbicacion}
        required
      />

      <TextAreaField
        label="Comentario / Des. Ref. (Opcional)"
        layout="inline"  // ← NUEVO
        placeholder="Ingrese comentario o descripción de referencia..."
        value={form.comentario}
        onChange={(e) => handleChange('comentario', e.target.value)}
        rows={3}
        error={errors.comentario}
      />

      <FormGrid columns={2}>
        <SelectField
          label="Llegó de Base *"
          layout="inline"  // ← NUEVO
          options={llegoDeBaseOptions}
          value={form.llegoDeBase}
          onChange={(v) => handleChange('llegoDeBase', v)}
          placeholder="-- Seleccione --"
          error={errors.llegoDeBase}
          required
        />
        <SelectField
          label="Tipo Deudor *"
          layout="inline"  // ← NUEVO
          options={tipoDeudorOptions}
          value={form.tipoDeudor}
          onChange={(v) => {
            handleChange('tipoDeudor', v);
            if (v !== 'AVAL' && v !== 'GARANTE') {
              handleChange('nombreAval', '');
            }
          }}
          placeholder="-- Seleccione --"
          error={errors.tipoDeudor}
          required
        />
      </FormGrid>

      {(form.tipoDeudor === 'AVAL' || form.tipoDeudor === 'GARANTE') && (
        <InputField
          label="Nombre Aval / Garante *"
          layout="inline"  // ← NUEVO
          placeholder="Ingrese el nombre del aval o garante"
          value={form.nombreAval}
          onChange={(e) => handleChange('nombreAval', e.target.value)}
          error={errors.nombreAval}
          required
        />
      )}

      <SelectField
        label="Estado *"
        layout="inline"  // ← NUEVO
        options={estadosDireccionOptions}
        value={form.estado}
        onChange={(v) => handleChange('estado', v)}
        placeholder="-- Seleccione --"
        error={errors.estado}
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

export default ModalEditarDireccion;