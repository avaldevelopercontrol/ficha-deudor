import React, { type ReactNode } from 'react';

import {
  ADICIONAL_MAF_POPUP_TEXTS,
  ADICIONAL_MAF_ROW_LABELS,
} from '../constants/adicionalMafPopup.constants';
import type {
  AdicionalMaf,
  AdicionalMafCanal,
  AdicionalMafGestion,
  AdicionalMafOperacion,
} from '../types/adicionalMaf.types';
import {
  formatAdicionalMafDate,
  getAdicionalMafDisplayValue,
  getAdicionalMafGestiones,
  getAdicionalMafOperationPrefix,
  isAdicionalMafGestionEmpty,
} from '../utils/adicionalMafPopup.utils';

interface AdicionalMafSummaryProps {
  data: AdicionalMaf;
}

interface SummaryRowProps {
  label: string;
  children: ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  children,
}) => {
  return (
    <div className="adicional-maf-row">
      <dt className="adicional-maf-label">{label}</dt>
      <dd className="adicional-maf-value">{children}</dd>
    </div>
  );
};

interface GestionDetailProps {
  gestion: AdicionalMafGestion;
  canal: AdicionalMafCanal;
}

const GestionDetail: React.FC<GestionDetailProps> = ({
  gestion,
  canal,
}) => {
  if (isAdicionalMafGestionEmpty(gestion)) {
    return (
      <em className="adicional-maf-empty">
        {gestion.estatus || ADICIONAL_MAF_POPUP_TEXTS.noManagement}
      </em>
    );
  }

  const metaItems: ReactNode[] = [];

  if (gestion.fecha) {
    metaItems.push(
      <span key="fecha">
        <strong>Fecha:</strong>{' '}
        {formatAdicionalMafDate(gestion.fecha)}
      </span>
    );
  }

  if (canal === 'CALL' && gestion.telefono) {
    metaItems.push(
      <span key="telefono">
        <strong>Tel:</strong> {gestion.telefono}
      </span>
    );
  }

  if (canal === 'CAMPO' && gestion.origenDireccion) {
    metaItems.push(
      <span key="origen">
        <strong>Origen:</strong> {gestion.origenDireccion}
      </span>
    );
  }

  return (
    <article className="adicional-maf-management">
      <strong className="adicional-maf-management-status">
        {gestion.estatus || ADICIONAL_MAF_POPUP_TEXTS.emptyValue}
      </strong>

      {metaItems.length > 0 && (
        <div className="adicional-maf-management-meta">
          {metaItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span
                  className="adicional-maf-separator"
                  aria-hidden="true"
                >
                  |
                </span>
              )}
              {item}
            </React.Fragment>
          ))}
        </div>
      )}

      {canal === 'CAMPO' && gestion.direccion && (
        <div className="adicional-maf-management-comment">
          {gestion.direccion}
        </div>
      )}

      {gestion.comentario && (
        <div className="adicional-maf-management-comment">
          {gestion.comentario}
        </div>
      )}

      <div className="adicional-maf-management-footer">
        <span>
          <strong>Intentos:</strong> {gestion.intentos}
          {gestion.intentosRobot > 0 && (
            <> (DISCADOR {gestion.intentosRobot})</>
          )}
        </span>

        <span className="adicional-maf-separator" aria-hidden="true">
          |
        </span>

        <span>
          <strong>Contacto directo:</strong>{' '}
          {gestion.contactosDirectos}
        </span>
      </div>
    </article>
  );
};

interface ManagementRowValueProps {
  gestiones: readonly AdicionalMafGestion[];
  canal: AdicionalMafCanal;
  ventanaMeses: number;
}

const ManagementRowValue: React.FC<ManagementRowValueProps> = ({
  gestiones,
  canal,
  ventanaMeses,
}) => {
  const matchingGestiones = getAdicionalMafGestiones(
    gestiones,
    canal,
    ventanaMeses
  );

  if (matchingGestiones.length === 0) {
    return (
      <em className="adicional-maf-empty">
        {ADICIONAL_MAF_POPUP_TEXTS.noManagement}
      </em>
    );
  }

  return (
    <div className="adicional-maf-management-list">
      {matchingGestiones.map((gestion, index) => (
        <GestionDetail
          key={`${gestion.idDocxCobrarOpe}-${gestion.idDocxCobrar}-${index}`}
          gestion={gestion}
          canal={canal}
        />
      ))}
    </div>
  );
};

type OperacionField =
  | 'estadoOperacion'
  | 'avanceCredito'
  | 'departamentoLegal'
  | 'provinciaLegal'
  | 'distritoLegal'
  | 'direccionLegal';

interface OperationRowValueProps {
  operaciones: readonly AdicionalMafOperacion[];
  field: OperacionField;
}

const OperationRowValue: React.FC<OperationRowValueProps> = ({
  operaciones,
  field,
}) => {
  if (operaciones.length === 0) {
    return (
      <em className="adicional-maf-empty">
        {ADICIONAL_MAF_POPUP_TEXTS.noOperations}
      </em>
    );
  }

  return (
    <div className="adicional-maf-operation-list">
      {operaciones.map((operacion, index) => (
        <div
          className="adicional-maf-operation"
          key={`${operacion.operacion}-${operacion.placa ?? ''}-${index}`}
        >
          <span className="adicional-maf-operation-prefix">
            {getAdicionalMafOperationPrefix(operacion)}:
          </span>{' '}
          <strong>
            {getAdicionalMafDisplayValue(operacion[field])}
          </strong>
        </div>
      ))}
    </div>
  );
};

export const AdicionalMafSummary: React.FC<
  AdicionalMafSummaryProps
> = ({ data }) => {
  return (
    <section
      className="adicional-maf-card"
      aria-label="Información adicional MAF"
    >
      <dl className="adicional-maf-list">
        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.numeroDiasNoContacto}>
          <strong>{data.numeroDiasNoContacto}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.fechaUltimoContacto}>
          <strong>{formatAdicionalMafDate(data.fechaUltimoContacto)}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.cantidadTotalVino}>
          <strong>{data.cantidadTotalVino}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.cantidadTotalPago}>
          <strong>{data.cantidadTotalPago}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.cantidadTotalVino6Meses}>
          <strong>{data.cantidadTotalVino6Meses}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.cantidadTotalPago6Meses}>
          <strong>{data.cantidadTotalPago6Meses}</strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCall12}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CALL"
            ventanaMeses={12}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCall6}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CALL"
            ventanaMeses={6}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCall1}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CALL"
            ventanaMeses={1}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCampo12}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CAMPO"
            ventanaMeses={12}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCampo6}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CAMPO"
            ventanaMeses={6}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.mejorGestionCampo1}>
          <ManagementRowValue
            gestiones={data.mejoresGestiones}
            canal="CAMPO"
            ventanaMeses={1}
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.estadoOperacion}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="estadoOperacion"
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.avanceCredito}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="avanceCredito"
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.cobertura}>
          <strong>
            {getAdicionalMafDisplayValue(data.cobertura)}
          </strong>
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.departamentoLegal}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="departamentoLegal"
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.provinciaLegal}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="provinciaLegal"
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.distritoLegal}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="distritoLegal"
          />
        </SummaryRow>

        <SummaryRow label={ADICIONAL_MAF_ROW_LABELS.direccionLegal}>
          <OperationRowValue
            operaciones={data.operaciones}
            field="direccionLegal"
          />
        </SummaryRow>
      </dl>
    </section>
  );
};
