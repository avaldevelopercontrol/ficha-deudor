import React, { useEffect, useState } from 'react';
import { ModalFormLayout } from '../../ui/ModalFormLayout';
import { FormGrid } from '../../ui/FormGrid';
import { InputField, SelectField, TextAreaField } from '../../ui';
import { useModalForm } from '../../../shared/hooks/ui/useModalForm';
import type { DireccionFormData } from '../../../shared/types';
import {
  refUbicacionDirOptions,
  llegoDeBaseOptions,
  tipoDeudorOptions,
  getDepartamentos,
  getProvinciasByDepartamento,
  getDistritosByProvincia,
} from '../../../data/catalogosDireccion';
import { validateDireccionForm } from '../../../features/ficha-deudor/validations/direccionValidations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar?: (data: DireccionFormData) => void;
}

const initialForm: DireccionFormData = {
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  refUbicacion: '',
  comentario: '',
  llegoDeBase: '',
  tipoDeudor: '',
};

const ModalRegistrarDireccion: React.FC<Props> = ({ isOpen, onClose, onRegistrar }) => {
  const [provincias, setProvincias] = useState<Array<{ id: string; label: string }>>([]);
  const [distritos, setDistritos] = useState<Array<{ id: string; label: string }>>([]);

  const { form, errors, handleChange, handleSubmit, handleCancel } = useModalForm<DireccionFormData>({
    initialForm,
    onClose,
    onSubmit: (data) => {
      console.log('Registrando dirección:', data);
      onRegistrar?.(data);
    },
    validate: validateDireccionForm,
    resetOnClose: true,
  });

  const departamentos = getDepartamentos();

  useEffect(() => {
    if (form.departamento) {
      const nuevasProvincias = getProvinciasByDepartamento(form.departamento);
      setProvincias(nuevasProvincias);
      if (form.provincia) {
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
      if (form.distrito) {
        handleChange('distrito', '');
      }
    } else {
      setDistritos([]);
    }
  }, [form.departamento, form.provincia]);

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title="REGISTRAR DIRECCIÓN"
      onClose={handleCancel}
      submitLabel="Registrar"
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
          onChange={(v) => handleChange('tipoDeudor', v)}
          placeholder="-- Seleccione --"
          error={errors.tipoDeudor}
          required
        />
      </FormGrid>

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

export default ModalRegistrarDireccion;