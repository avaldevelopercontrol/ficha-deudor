import { useMemo } from 'react';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';
import { formatGestionDeudorMoney } from '../../../utils/gestionDeudorFormatters';
import type { DeudorGestionDeudor } from '../../../types/gestionDeudor.types';

export const useGestionDeudorColumns =
  (): Column<DeudorGestionDeudor>[] => {
    return useMemo(
      () => [
        {
          key: 'nro',
          label: 'Nro',
          width: '3%',
        },
        {
          key: 'zonaCampanna',
          label: 'Zona - Campaña',
          width: '6%',
          render: (row) => (
            <WrapCell>
              {row.zonaCampanna || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'cartera',
          label: 'Cartera',
          width: '7%',
          render: (row) => (
            <WrapCell>
              {row.cartera || '—'}
            </WrapCell>
          ),
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
            <WrapCell weight={600}>
              {row.deudor || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'importe',
          label: 'Importe',
          width: '6%',
          render: (row) =>
            formatGestionDeudorMoney(row.importe),
        },
        {
          key: 'saldo',
          label: 'Saldo',
          width: '6%',
          render: (row) =>
            formatGestionDeudorMoney(row.saldo),
        },
        {
          key: 'fechaUltimaGestionCALL',
          label: 'Ult. Gestión',
          group: 'gestionCall',
          groupLabel: 'Gestión Call',
          width: '6%',
          render: (row) => (
            <WrapCell>
              {row.fechaUltimaGestionCALL || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'ultimaGestionCALL',
          label: 'Status',
          group: 'gestionCall',
          groupLabel: 'Gestión Call',
          width: '10%',
          render: (row) => (
            <WrapCell>
              {row.ultimaGestionCALL || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'cantidadGestionCALL',
          label: 'Cantidad',
          group: 'gestionCall',
          groupLabel: 'Gestión Call',
          width: '4%',
        },
        {
          key: 'fechaUltimaGestionCAMPO',
          label: 'Ult. Gestión',
          group: 'gestionCampo',
          groupLabel: 'Gestión Campo',
          width: '6%',
          render: (row) => (
            <WrapCell>
              {row.fechaUltimaGestionCAMPO || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'ultimaGestionCAMPO',
          label: 'Status',
          group: 'gestionCampo',
          groupLabel: 'Gestión Campo',
          width: '10%',
          render: (row) => (
            <WrapCell>
              {row.ultimaGestionCAMPO || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'cantidadGestionCAMPO',
          label: 'Cantidad',
          group: 'gestionCampo',
          groupLabel: 'Gestión Campo',
          width: '4%',
        },
        {
          key: 'fechaPromesa',
          label: 'Fecha Promesa',
          width: '6%',
          render: (row) => (
            <WrapCell>
              {row.fechaPromesa || '—'}
            </WrapCell>
          ),
        },
        {
          key: 'mejorStatus',
          label: 'Mejor Status',
          width: '11%',
          render: (row) => (
            <WrapCell>
              {row.mejorStatus || '—'}
            </WrapCell>
          ),
        },
      ],
      []
    );
  };
