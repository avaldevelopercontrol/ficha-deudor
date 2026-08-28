import React from 'react';

import { SelectField } from '@shared/components/ui';

import type { FichaGestionDatosPrincipalesCatalogos } from '../../types/fichaGestionCatalogos.types';

interface Props {
  idCliente: string;
  estadoGestion: string;
  tipoGestion: string;
  gestorId: string;
  gestorNombre: string;
  catalogos: Pick<
    FichaGestionDatosPrincipalesCatalogos,
    'estados' | 'tipos'
  >;
  onEstadoGestionChange: (value: string) => void;
  onTipoGestionChange: (value: string) => void;
  onOpenListaGestores: () => void;
}

const FichaGestionEstadoGestorFields: React.FC<Props> = ({
  idCliente,
  estadoGestion,
  tipoGestion,
  gestorId,
  gestorNombre,
  catalogos,
  onEstadoGestionChange,
  onTipoGestionChange,
  onOpenListaGestores,
}) => {
  const { estados, tipos } = catalogos;

  return (
    <div className="gestion-compact-grid gestion-compact-grid--resultado-gestor">
      <SelectField
        label="Estado de Gestión"
        options={estados.options}
        value={estadoGestion}
        onChange={onEstadoGestionChange}
        placeholder={
          estados.isLoading
            ? 'Cargando...'
            : 'Seleccionar estado...'
        }
        disabled={estados.isLoading}
        error={estados.error || ''}
      />

      <SelectField
        label="Tipo de Gestión"
        options={tipos.options}
        value={tipoGestion}
        onChange={onTipoGestionChange}
        placeholder={
          tipos.isLoading
            ? 'Cargando...'
            : 'Seleccionar tipo...'
        }
        disabled={tipos.isLoading}
        error={tipos.error || ''}
      />

      <div className="form-group gestor-field">
        <label className="form-label">Gestor</label>

        <div className="gestor-row gestor-row--compact gestor-row--inline">
          <button
            className="btn btn-info btn-xs"
            type="button"
            onClick={onOpenListaGestores}
            disabled={!idCliente}
          >
            Buscar Gestor
          </button>

          <input
            type="text"
            className="form-input form-input--xs gestor-row__id"
            placeholder="ID"
            value={gestorId}
            readOnly
          />

          <input
            type="text"
            className="form-input form-input--xs gestor-row__name"
            placeholder="Nombre del gestor"
            value={gestorNombre}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default FichaGestionEstadoGestorFields;
