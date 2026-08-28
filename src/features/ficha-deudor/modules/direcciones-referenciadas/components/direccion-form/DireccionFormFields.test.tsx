import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../../test/testHarness';
import { estadosDireccionOptions } from '../../constants/catalogosDireccion.constants';
import { DireccionFormFields } from '../DireccionFormFields';

const commonProps = {
  form: {
    direccion: 'Av. Principal 123',
    departamento: '15',
    provincia: '1501',
    distrito: '150101',
    refUbicacion: '1',
    comentario: 'Referencia',
    llegoDeBase: true,
    tipoDeudor: 'TITULAR',
    estado: true,
  },
  errors: {},
  onChange: () => undefined,
  labels: {
    direccion: 'Dirección',
    departamento: 'Departamento',
    provincia: 'Provincia',
    distrito: 'Distrito',
    refUbicacion: 'Referencia de Ubicación',
    comentario: 'Comentario / Des. Ref. (Opcional)',
    llegoDeBase: 'Llegó de Base',
    tipoDeudor: 'Tipo Deudor',
    estado: 'Estado',
  },
  placeholders: {
    direccion: 'Ingrese dirección completa',
    comentario: 'Ingrese comentario',
    select: '-- Seleccione --',
    loading: 'Cargando...',
  },
  layout: {
    ubicacionColumns: 3 as const,
    footerColumns: 2 as const,
  },
  departamentos: [{ id: '15', label: 'LIMA' }],
  provincias: [{ id: '1501', label: 'LIMA' }],
  distritos: [{ id: '150101', label: 'LIMA' }],
  refUbicacionOptions: [{ id: '1', label: 'DOMICILIO' }],
  refUbicacionValue: '1',
  isLoadingDepartamentos: false,
  isLoadingProvincias: false,
  isLoadingDistritos: false,
  isLoadingUbicaciones: false,
};

export const suite = defineSuite('DireccionFormFields', [
  test('conserva el orden y los campos visibles del formulario', () => {
    const html = renderToStaticMarkup(
      <DireccionFormFields {...commonProps} />
    );

    const labels = [
      'Dirección',
      'Departamento',
      'Provincia',
      'Distrito',
      'Referencia de Ubicación',
      'Comentario / Des. Ref. (Opcional)',
      'Llegó de Base',
      'Tipo Deudor',
    ];

    let previousIndex = -1;

    for (const label of labels) {
      const currentIndex = html.indexOf(label);
      assert.ok(currentIndex > previousIndex, `${label} debe conservar su posición`);
      previousIndex = currentIndex;
    }

    assert.equal(html.includes('Estado'), false);
  }),

  test('muestra Estado solo en el flujo de edición', () => {
    const html = renderToStaticMarkup(
      <DireccionFormFields
        {...commonProps}
        showEstado
        estadosOptions={estadosDireccionOptions}
        onEstadoChange={() => undefined}
      />
    );

    assert.match(html, />Estado</);
  }),
]);
