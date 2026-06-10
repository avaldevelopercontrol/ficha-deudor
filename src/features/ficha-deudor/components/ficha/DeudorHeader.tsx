import React from 'react';
import { useCabeceraHeader, useDeudorHeader, useMejorRHeader } from '../../hooks/useDeudorHeader';
import { CompactInfoSection, InfoRow } from '../../../../shared/components/ui/CompactInfoSection';

interface Props {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  contacto: string;
  onContactoChange: (v: string) => void;
  compact?: boolean;
  mejorResultado?: string;
}

const DeudorHeader: React.FC<Props> = ({ 
  id_cliente,
  id_cartera,
  id_deudor,
  contacto, 
  onContactoChange, 
  compact = false,
}) => {
  const { data: deudorData, isLoading: isLoadingDeudor, error: deudorError } = 
    useDeudorHeader(id_cliente, id_cartera, id_deudor);
  
  const { data: cabeceraData, isLoading: isLoadingCabecera, error: cabeceraError } = 
    useCabeceraHeader(id_cliente, id_cartera, id_deudor);
  
  const { data: mejorRData, isLoading: isLoadingMejorR, error: mejorRError } = 
    useMejorRHeader(id_cliente, id_cartera, id_deudor);
  
  if (isLoadingDeudor || isLoadingCabecera || isLoadingMejorR) {
    return <div className="ficha-card">Cargando...</div>;
  }
  
  // Manejo de errores
  if (deudorError || cabeceraError || mejorRError) {
    return <div className="ficha-card">Error: {deudorError || cabeceraError}</div>;
  }
  
  // Verificar que ambos datos existen
  if (!deudorData || !cabeceraData || !mejorRData) return null;
  
  return (
    <div className={`ficha-card ${compact ? 'deudor-header--compact' : ''}`}>
      {/* Meta strip con datos de cabecera */}
      <div className="header-meta-strip">
        <div className="meta-item">
          <span className="meta-label">ZONA</span>
          <span className="meta-value">{cabeceraData.zona}</span>
        </div>
        {!compact && <div className="meta-separator" />}
        <div className="meta-item">
          <span className="meta-label">CARTERA</span>
          <span className="meta-value">{cabeceraData.cartera}</span>
        </div>
        {!compact && <div className="meta-separator" />}
        <div className="meta-item">
          <span className="meta-label">CAMPAÑA</span>
          <span className="meta-value">{cabeceraData.campana}</span>
        </div>
      </div>

      {/* Contenido principal */}
      {compact ? (
        <div className="compact-layout">
          <div className="compact-layout__grid">
            
            {/* COLUMNA 1: INFORMACIÓN DEL DEUDOR */}
            <CompactInfoSection title="Información del Deudor">
              <InfoRow 
                label="Nombre / R.S.:" 
                value={deudorData.nombreRazonSocial} 
                highlight 
              />
              <InfoRow 
                label="DNI / RUC:" 
                value={deudorData.dniRuc} 
              />
              <InfoRow 
                label="Grado Inst.:" 
                value={deudorData.gradoInstruccion} 
              />
              <InfoRow
                label="Edad:"
                value={deudorData.edad ? `${deudorData.edad} años` : ""}
              />
              <div className="compact-row compact-row--center" style={{ marginTop: 2 }}>
                <span className="compact-label">Contacto:</span>
                <input
                  type="text"
                  placeholder="Ingresar..."
                  value={contacto}
                  onChange={(e) => onContactoChange(e.target.value)}
                  className="compact-input"
                />
              </div>
            </CompactInfoSection>

            {/* COLUMNA 2: ASESORES */}
            <CompactInfoSection title="Asesores">
              <InfoRow label="Post Venta:" value={deudorData.asesorPostVenta} />
              <InfoRow label="Comercial:" value={deudorData.asesorComercial} />
              <InfoRow 
                label="Correo APV:" 
                value={deudorData.correoApv} 
                title={deudorData.correoApv}
              />
              <InfoRow 
                label="Correo AC:" 
                value={deudorData.correoAc} 
                title={deudorData.correoAc}
              />
            </CompactInfoSection>

            {/* COLUMNA 3: MEJOR RESULTADO */}
            <CompactInfoSection title="Mejor Resultado">
              <InfoRow 
                label="Resultado:" 
                value={mejorRData.mejorResultado} 
                highlight 
              />
            </CompactInfoSection>

          </div>
        </div>
      ) : (
        <div className="deudor-info-grid">
          {/* Versión normal - implementa aquí la vista no-compact */}
          <p>Vista normal no implementada aún</p>
        </div>
      )}
    </div>
  );
};

export default DeudorHeader;