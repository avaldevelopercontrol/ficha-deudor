import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';
import type { DeudorGestionDeudor } from '../../../types/gestionDeudor.types';
import { formatGestionDeudorMoney } from '../../../utils/gestionDeudorFormatters';

export const GESTION_DEUDOR_COLUMNS: Column<DeudorGestionDeudor>[] = [
  {
    key: 'numero',
    label: 'Nro',
    width: '3%',
  },
  {
    key: 'zonaCampania',
    label: 'Zona - Campaña',
    width: '6%',
    render: (row) => <WrapCell>{row.zonaCampania || '—'}</WrapCell>,
  },
  {
    key: 'cartera',
    label: 'Cartera',
    width: '7%',
    render: (row) => <WrapCell>{row.cartera || '—'}</WrapCell>,
  },
  {
    key: 'codigoCliente',
    label: 'Cod.Cliente',
    width: '5%',
  },
  {
    key: 'deudor',
    label: 'Deudor',
    width: '10%',
    render: (row) => (
      <WrapCell weight={600}>{row.deudor || '—'}</WrapCell>
    ),
  },
  {
    key: 'importe',
    label: 'Importe',
    width: '6%',
    render: (row) => formatGestionDeudorMoney(row.importe),
  },
  {
    key: 'saldo',
    label: 'Saldo',
    width: '6%',
    render: (row) => formatGestionDeudorMoney(row.saldo),
  },
  {
    key: 'fechaUltimaGestionCall',
    label: 'Ult. Gestión',
    group: 'gestionCall',
    groupLabel: 'Gestión Call',
    width: '6%',
    render: (row) => (
      <WrapCell>{row.fechaUltimaGestionCall || '—'}</WrapCell>
    ),
  },
  {
    key: 'ultimaGestionCall',
    label: 'Status',
    group: 'gestionCall',
    groupLabel: 'Gestión Call',
    width: '10%',
    render: (row) => <WrapCell>{row.ultimaGestionCall || '—'}</WrapCell>,
  },
  {
    key: 'cantidadGestionCall',
    label: 'Cantidad',
    group: 'gestionCall',
    groupLabel: 'Gestión Call',
    width: '4%',
  },
  {
    key: 'fechaUltimaGestionCampo',
    label: 'Ult. Gestión',
    group: 'gestionCampo',
    groupLabel: 'Gestión Campo',
    width: '6%',
    render: (row) => (
      <WrapCell>{row.fechaUltimaGestionCampo || '—'}</WrapCell>
    ),
  },
  {
    key: 'ultimaGestionCampo',
    label: 'Status',
    group: 'gestionCampo',
    groupLabel: 'Gestión Campo',
    width: '10%',
    render: (row) => <WrapCell>{row.ultimaGestionCampo || '—'}</WrapCell>,
  },
  {
    key: 'cantidadGestionCampo',
    label: 'Cantidad',
    group: 'gestionCampo',
    groupLabel: 'Gestión Campo',
    width: '4%',
  },
  {
    key: 'fechaPromesa',
    label: 'Fecha Promesa',
    width: '6%',
    render: (row) => <WrapCell>{row.fechaPromesa || '—'}</WrapCell>,
  },
  {
    key: 'mejorStatus',
    label: 'Mejor Status',
    width: '11%',
    render: (row) => <WrapCell>{row.mejorStatus || '—'}</WrapCell>,
  },
];
