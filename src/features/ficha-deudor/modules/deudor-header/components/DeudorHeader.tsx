import React from 'react';

import {
  CompactInfoSection,
  InfoRow,
} from '@shared/components/ui/CompactInfoSection';
import type {
  CabeceraInfo,
  DeudorInfo,
} from '../../../shared/types';

interface Props {
  deudorData: DeudorInfo;
  cabeceraData: CabeceraInfo | null;
  isLoadingCabecera: boolean;
  cabeceraError: string | null;
  contacto: string;
  onContactoChange: (value: string) => void;
  compact?: boolean;
  mejorResultado?: string;
}

const DeudorHeader: React.FC<Props> = ({
  deudorData,
  cabeceraData,
  isLoadingCabecera,
  cabeceraError,
  contacto,
  onContactoChange,
  compact = false,
}) => {

  if (isLoadingCabecera) {
    return <div className="ficha-card">Cargando...</div>;
  }

  if (cabeceraError) {
    return <div className="ficha-card">Error: {cabeceraError}</div>;
  }

  if (!cabeceraData) {
    return null;
  }

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

              <InfoRow
                label="Plazo Especial:"
                value={deudorData.clienteConSinPe}
                tone="danger"
              />

              <InfoRow
                label="White List:"
                value={deudorData.clienteListaBlanca}
                tone="danger"
              />

              <InfoRow
                label="Provision:"
                value={deudorData.clientePorVision}
                tone="danger"
              />

            </CompactInfoSection>

            {/*<CompactInfoSection title="Mejor Resultado">
              <InfoRow
                label="Resultado:"
                value={mejorRData.mejorResultado}
                highlight
              />
            </CompactInfoSection>*/}
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