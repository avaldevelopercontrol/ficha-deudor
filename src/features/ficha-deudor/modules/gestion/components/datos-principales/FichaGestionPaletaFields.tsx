import React, { useMemo } from 'react';

import { SelectField } from '@shared/components/ui';

import type { FichaGestionDatosPrincipalesCatalogos } from '../../types/fichaGestionCatalogos.types';

interface Props {
  np0: string;
  np1: string;
  np2: string;
  catalogos: Pick<
    FichaGestionDatosPrincipalesCatalogos,
    'np0' | 'np1' | 'np2'
  >;
  onNP0Change: (value: string) => void;
  onNP1Change: (value: string) => void;
  onNP2Change: (value: string) => void;
}

const FichaGestionPaletaFields: React.FC<Props> = ({
  np0,
  np1,
  np2,
  catalogos,
  onNP0Change,
  onNP1Change,
  onNP2Change,
}) => {
  const {
    np0: np0Resource,
    np1: np1Resource,
    np2: np2Resource,
  } = catalogos;

  const np1Placeholder = useMemo(() => {
    if (!np0) {
      return 'Primero seleccione NP0';
    }

    if (np1Resource.isLoading) {
      return 'Cargando NP1...';
    }

    return 'Seleccionar NP1...';
  }, [np0, np1Resource.isLoading]);

  const np2Placeholder = useMemo(() => {
    if (!np1) {
      return 'Primero seleccione NP1';
    }

    if (np2Resource.isLoading) {
      return 'Cargando NP2...';
    }

    if (np2Resource.options.length === 0) {
      return 'Sin opciones disponibles';
    }

    return '';
  }, [np1, np2Resource.isLoading, np2Resource.options.length]);

  return (
    <div className="gestion-compact-grid gestion-compact-grid--np">
      <SelectField
        label="NP0"
        options={np0Resource.options}
        value={np0}
        onChange={onNP0Change}
        placeholder={
          np0Resource.isLoading
            ? 'Cargando NP0...'
            : 'Seleccionar NP0...'
        }
        disabled={np0Resource.isLoading}
        error={np0Resource.error || ''}
      />

      <SelectField
        label="NP1"
        options={np1Resource.options}
        value={np1}
        onChange={onNP1Change}
        placeholder={np1Placeholder}
        disabled={!np0 || np1Resource.isLoading}
        error={np0 ? np1Resource.error || '' : ''}
      />

      <SelectField
        label="NP2"
        options={np2Resource.options}
        value={np2}
        onChange={onNP2Change}
        placeholder={np2Placeholder}
        hidePlaceholder={
          Boolean(np1) &&
          !np2Resource.isLoading &&
          np2Resource.options.length > 0
        }
        disabled={!np1 || np2Resource.isLoading}
        error={np1 ? np2Resource.error || '' : ''}
      />
    </div>
  );
};

export default FichaGestionPaletaFields;
