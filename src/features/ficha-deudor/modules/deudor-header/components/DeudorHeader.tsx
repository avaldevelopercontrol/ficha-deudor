import React from 'react';

import {
  useCabeceraHeader,
  useMejorRHeader,
} from '../hooks/useDeudorHeader';
import {
  CompactInfoSection,
  InfoRow,
} from '@shared/components/ui/CompactInfoSection';
import type { DeudorInfo } from '../../../shared/types';
import type { FichaDeudorHeaderParams } from '../../../shared/types/fichaDeudor.types';

interface Props {
  params: FichaDeudorHeaderParams;
  deudorData: DeudorInfo;
  contacto: string;
  onContactoChange: (v: string) => void;
  compact?: boolean;
  mejorResultado?: string;
}

const DeudorHeader: React.FC<Props> = ({
  params,
  deudorData,
  contacto,
  onContactoChange,
  compact = false,
}) => {
  const { id_cliente, id_cartera, id_deudor } = params;

  const {
    data: cabeceraData,
    isLoading: isLoadingCabecera,
    error: cabeceraError,
  } = useCabeceraHeader(id_cliente, id_cartera);

  const {
    data: mejorRData,
    isLoading: isLoadingMejorR,
    error: mejorRError,
  } = useMejorRHeader(id_cliente, id_cartera, id_deudor);

  if (isLoadingCabecera || isLoadingMejorR) {
    return <div className="ficha-card">Cargando...</div>;
  }

  if (cabeceraError || mejorRError) {
    return <div className="ficha-card">Error: {cabeceraError || mejorRError}</div>;
  }

  if (!cabeceraData || !mejorRData) return null;

  return (
    <div className={`ficha-card ${compact ? 'deudor-header--compact' : ''}`}>
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

      {compact ? (
        <div className="compact-layout">
          <div className="compact-layout__grid">
            <CompactInfoSection title="Información del Deudor">
              <InfoRow
                label="Nombre / R.S.:"
                value={deudorData.nombreRazonSocial}
                highlight
              />

              <InfoRow label="DNI / RUC:" value={deudorData.dniRuc} />

              <InfoRow
                label="Grado Inst.:"
                value={deudorData.gradoInstruccion}
              />

              <InfoRow
                label="Edad:"
                value={deudorData.edad ? `${deudorData.edad} años` : ''}
              />

              <div
                className="compact-row compact-row--center"
                style={{ marginTop: 2 }}
              >
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

            <CompactInfoSection title="Asesores">
              <InfoRow
                label="Post Venta:"
                value={deudorData.asesorPostVenta}
              />

              <InfoRow
                label="Comercial:"
                value={deudorData.asesorComercial}
              />

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
          <p>Vista normal no implementada aún</p>
        </div>
      )}
    </div>
  );
};

export default DeudorHeader;