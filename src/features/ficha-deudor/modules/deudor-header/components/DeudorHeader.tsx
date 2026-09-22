import React from 'react';

import {
  CompactInfoSection,
  InfoRow,
} from '@shared/components/ui/CompactInfoSection';
import { CLIENTE_MAF_ID } from '../../../shared/constants/clientes.constants';
import type {
  CabeceraInfo,
  DeudorInfo,
} from '../../../shared/types';

interface Props {
  idCliente: string;
  deudorData: DeudorInfo;
  cabeceraData: CabeceraInfo | null;
  isLoadingCabecera: boolean;
  cabeceraError: string | null;
  compact?: boolean;
  mejorResultado?: string;
}

const DeudorHeader: React.FC<Props> = ({
  idCliente,
  deudorData,
  cabeceraData,
  isLoadingCabecera,
  cabeceraError,
  compact = false,
}) => {
  const isClienteMaf = idCliente.trim() === CLIENTE_MAF_ID;

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
                  value={deudorData.contacto}
                  placeholder="Ingresar..."
                  readOnly
                  className="compact-input"
                />
              </div>

            </CompactInfoSection>

            <CompactInfoSection
              title={isClienteMaf ? 'Información Adicional' : 'Asesores'}
            >
              {!isClienteMaf && (
                <>
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
                </>
              )}

              {isClienteMaf ? (
                <div className="deudor-header__maf-additional-fields">
                  <InfoRow
                    label="Reprogramación Cuota Balón:"
                    value={deudorData.clienteConSinPe}
                    tone="danger"
                  />

                  <InfoRow
                    label="Refinanciamiento Balón:"
                    value={deudorData.clienteListaBlanca}
                    tone="danger"
                  />

                  <InfoRow
                    label="Refinanciamiento Cuota Normal:"
                    value={deudorData.clientePorVision}
                    tone="danger"
                  />
                </div>
              ) : (
                <>
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
                </>
              )}

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