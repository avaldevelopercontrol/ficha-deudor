import { WrapCell } from '@shared/components/ui/WrapCell';
import ExpandableCell from '@shared/components/ui/ExpandableCell';

export const renderEstadoGestionNroCell = (nro: string | number) => {
  return (
    <span style={{ fontWeight: 700, color: '#1a2540' }}>
      {nro}
    </span>
  );
};

export const renderEstadoGestionWrappedTextCell = (text: string) => {
  return <WrapCell>{text}</WrapCell>;
};

export const renderEstadoGestionOperacionCell = (operacion: string) => {
  return (
    <span
      className="badge badge-info"
      style={{ fontSize: '10px', textTransform: 'uppercase' }}
    >
      {operacion}
    </span>
  );
};

export const renderEstadoGestionResultadoCell = (resultado: string) => {
  const isContactado = resultado.includes('Contactado');

  return (
    <div
      style={{
        color: isContactado ? '#166534' : '#991b1b',
        fontSize: '11px',
        fontWeight: 500,
      }}
    >
      <ExpandableCell text={resultado} maxLines={2} lineHeight={18} />
    </div>
  );
};

export const renderEstadoGestionComentarioCell = (comentario: string) => {
  return (
    <ExpandableCell text={comentario} maxLines={2} lineHeight={18} />
  );
};