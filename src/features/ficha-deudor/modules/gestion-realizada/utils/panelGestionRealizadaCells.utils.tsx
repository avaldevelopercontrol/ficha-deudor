import { ActionButton } from '@shared/components/ui';
import ExpandableCell from '@shared/components/ui/ExpandableCell';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type {
  GestionCompleta,
  GestionRealizada,
} from '../../../shared/types';

const CONTACTADO_TEXT = 'Contactado';

const RESULTADO_COLOR = {
  CONTACTADO: '#166534',
  NO_CONTACTADO: '#991b1b',
} as const;

export const renderNroCell = (nro: string | number) => {
  return (
    <span style={{ fontWeight: 700, color: '#1a2540' }}>
      {nro}
    </span>
  );
};

export const renderWrappedTextCell = (value: string) => {
  return <WrapCell>{value}</WrapCell>;
};

export const renderOperacionBadgeCell = (operacion: string) => {
  return (
    <span
      className="badge badge-info"
      style={{ fontSize: '10px', textTransform: 'uppercase' }}
    >
      {operacion}
    </span>
  );
};

export const renderResultadoGestionCell = (value: string) => {
  const isContactado = value.includes(CONTACTADO_TEXT);

  return (
    <WrapCell
      color={
        isContactado
          ? RESULTADO_COLOR.CONTACTADO
          : RESULTADO_COLOR.NO_CONTACTADO
      }
      weight={500}
    >
      {value}
    </WrapCell>
  );
};

export const renderComentarioCell = (comentario: string) => {
  return <ExpandableCell text={comentario} maxLines={2} lineHeight={18} />;
};

export const renderEliminarGestionCell = (
  row: GestionRealizada,
  onEliminar: (row: GestionRealizada) => void
) => {
  return (
    <ActionButton
      label=""
      variant="danger"
      size="sm"
      icon="🗑"
      onClick={() => onEliminar(row)}
    />
  );
};

export const renderGestionRealizadaResultadoCell = (
  row: GestionRealizada
) => {
  return renderResultadoGestionCell(row.respuesta);
};

export const renderGestionCompletaResultadoCell = (
  row: GestionCompleta
) => {
  return renderResultadoGestionCell(row.resultado);
};