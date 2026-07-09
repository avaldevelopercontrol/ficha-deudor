import type React from 'react';
import { ActionButton } from '@shared/components/ui/ActionButton';
import { InputField } from '@shared/components/ui/InputField';
import { SelectField } from '@shared/components/ui/SelectField';
import {
  GESTION_DEUDOR_SEARCH_TAGS,
  TIPO_BUSQUEDA_GESTION_DEUDOR_OPTIONS,
} from '../../../constants/gestionDeudorSearch.constants';
import type { TipoBusquedaGestionDeudor } from '../../../types/gestionDeudor.types';

interface GestionDeudorSearchCardProps {
  tipoBusqueda: TipoBusquedaGestionDeudor;
  valorBusqueda: string;
  isLoading: boolean;
  error: string | null;
  onTipoBusquedaChange: (value: TipoBusquedaGestionDeudor) => void;
  onValorBusquedaChange: (value: string) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
}

export const GestionDeudorSearchCard: React.FC<GestionDeudorSearchCardProps> = ({
  tipoBusqueda,
  valorBusqueda,
  isLoading,
  error,
  onTipoBusquedaChange,
  onValorBusquedaChange,
  onBuscar,
  onLimpiar,
}) => {
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onBuscar();
    }
  };

  return (
    <section className="gestion-deudor-card gestion-deudor-card--search">
      <div className="gestion-deudor-search-layout">
        <div className="gestion-deudor-search-info">
          <div className="gestion-deudor-search-icon">🔎</div>

          <div>
            <h2 className="gestion-deudor-card__title">Búsqueda de deudor</h2>

            <p className="gestion-deudor-card__subtitle">
              Seleccione el tipo de búsqueda e ingrese el dato correspondiente.
            </p>

            <div className="gestion-deudor-search-tags">
              {GESTION_DEUDOR_SEARCH_TAGS.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="gestion-deudor-search-panel">
          <div className="gestion-deudor-search-row">
            <div className="gestion-deudor-search-field gestion-deudor-search-field--type">
              <SelectField
                label="Tipo de búsqueda"
                options={TIPO_BUSQUEDA_GESTION_DEUDOR_OPTIONS}
                value={tipoBusqueda}
                onChange={onTipoBusquedaChange}
                disabled={isLoading}
                hidePlaceholder
              />
            </div>

            <div className="gestion-deudor-search-field gestion-deudor-search-field--value">
              <InputField
                label="Dato"
                value={valorBusqueda}
                onChange={(event) => onValorBusquedaChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Ingrese RUC, DNI o teléfono"
                disabled={isLoading}
              />
            </div>

            <div className="gestion-deudor-search-actions">
              <ActionButton
                label={isLoading ? 'Buscando...' : 'Buscar'}
                icon="🔎"
                variant="primary"
                onClick={onBuscar}
              />

              <ActionButton label="Limpiar" variant="secondary" onClick={onLimpiar} />
            </div>
          </div>

          {error && <div className="gestion-deudor-error">{error}</div>}
        </div>
      </div>
    </section>
  );
};
