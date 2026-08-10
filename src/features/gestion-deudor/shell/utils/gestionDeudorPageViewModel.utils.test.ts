import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';
import type {
  GestionDeudorResultsCardProps,
} from '../../modules/listado/components/GestionDeudorResultsCard';
import type {
  DeudorGestionDeudor,
} from '../../types/gestionDeudor.types';
import {
  buildGestionDeudorResultsProps,
  buildGestionDeudorSearchProps,
  resolveGestionDeudorRecordRange,
} from './gestionDeudorPageViewModel.utils';

const deudor: DeudorGestionDeudor = {
  nId_PersDeudor: 10,
  nro: 1,
  zonaCampanna: 'Lima - Agosto',
  nId_Cliente: 20,
  nId_Contrato: 30,
  nId_Cartera: 40,
  cartera: 'Cartera demo',
  codigoCliente: 'CLI-001',
  deudor: 'Persona Demo',
  importe: 100,
  saldo: 50,
  fechaUltimaGestionCALL: '',
  ultimaGestionCALL: '',
  cantidadGestionCALL: 0,
  fechaUltimaGestionCAMPO: '',
  ultimaGestionCAMPO: '',
  cantidadGestionCAMPO: 0,
  fechaPromesa: '',
  mejorStatus: '',
};

export const suite = defineSuite(
  'gestionDeudorPageViewModel.utils',
  [
    test(
      'construye las propiedades de búsqueda sin alterar callbacks',
      () => {
        const setTipoBusqueda = () => undefined;
        const setValorBusqueda = () => undefined;
        const buscar = () => undefined;
        const limpiar = () => undefined;

        const props =
          buildGestionDeudorSearchProps({
            tipoBusqueda: 'D',
            valorBusqueda: '12345678',
            isLoading: true,
            error: 'Mensaje',
            setTipoBusqueda,
            setValorBusqueda,
            buscar,
            limpiar,
          });

        assert.equal(props.tipoBusqueda, 'D');
        assert.equal(
          props.valorBusqueda,
          '12345678'
        );
        assert.equal(props.isLoading, true);
        assert.equal(props.error, 'Mensaje');
        assert.equal(
          props.onTipoBusquedaChange,
          setTipoBusqueda
        );
        assert.equal(
          props.onValorBusquedaChange,
          setValorBusqueda
        );
        assert.equal(props.onBuscar, buscar);
        assert.equal(props.onLimpiar, limpiar);
      }
    ),

    test(
      'calcula el rango visible de la página actual',
      () => {
        assert.deepEqual(
          resolveGestionDeudorRecordRange(
            2,
            10,
            25
          ),
          {
            indiceInicio: 10,
            indiceFin: 20,
          }
        );

        assert.deepEqual(
          resolveGestionDeudorRecordRange(
            3,
            10,
            25
          ),
          {
            indiceInicio: 20,
            indiceFin: 25,
          }
        );
      }
    ),

    test(
      'construye las propiedades del listado y conserva sus acciones',
      () => {
        const setPageNumber = () => undefined;
        const setPageSize = () => undefined;
        const onRowClick = () => undefined;
        const onOpenProduccionGestorHoy =
          () => undefined;
        const columns:
          GestionDeudorResultsCardProps['columns'] =
            [];

        const props =
          buildGestionDeudorResultsProps({
            state: {
              paginatedData: [deudor],
              isLoading: false,
              pageNumber: 2,
              pageSize: 10,
              totalRecords: 15,
              totalPages: 2,
              setPageNumber,
              setPageSize,
            },
            columns,
            onRowClick,
            onOpenProduccionGestorHoy,
            isProduccionGestorHoyDisabled:
              false,
          });

        assert.equal(props.data[0], deudor);
        assert.equal(props.indiceInicio, 10);
        assert.equal(props.indiceFin, 15);
        assert.equal(
          props.onPageNumberChange,
          setPageNumber
        );
        assert.equal(
          props.onPageSizeChange,
          setPageSize
        );
        assert.equal(
          props.onRowClick,
          onRowClick
        );
        assert.equal(
          props.onOpenProduccionGestorHoy,
          onOpenProduccionGestorHoy
        );
      }
    ),

    test(
      'mantiene rango cero cuando no existen registros',
      () => {
        assert.deepEqual(
          resolveGestionDeudorRecordRange(
            1,
            10,
            0
          ),
          {
            indiceInicio: 0,
            indiceFin: 0,
          }
        );
      }
    ),
  ]
);
