// ─── GESTIÓN: Estado de Gestión ───
export interface GestionEstadoApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionEstadoList {
  id: string;      // ← mapeado desde nId_OpeCodCliOut
  nombre: string;  // ← mapeado desde cNombre_OpeCodCliOut
}

// ─── GESTIÓN: Tipo de Gestión ───
export interface GestionTipoApi {
  nId_TipoGestion: number;
  cNomTipoGestion: string;
}

export interface GestionTipoList {
  id: string;
  nombre: string;
}