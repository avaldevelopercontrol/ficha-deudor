export interface DireccionReferenciadaApi {
  nId_PersDirecc: number;
  direccion: string;
  referenciaUbicacion: string;
  tipoDeudor: string;
  nombre: string;
  estado: string;
}

export interface DireccionReferenciada {
  id: string;
  direccion: string;
  refUbicacion: string;
  tipoDeudor: string;
  nombre: string;
  estado: string;
  departamento?: string; 
  provincia?: string;
  distrito?: string;
  comentario?: string;
  llegoDeBase?: boolean;
  nombreAval?: string
}

export interface DireccionFormData {
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  refUbicacion: string;
  comentario: string;
  llegoDeBase: boolean;
  tipoDeudor: string;
}

export interface DireccionEditFormData {
  id: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  refUbicacion: string;
  comentario: string;
  llegoDeBase: boolean;
  tipoDeudor: string;
  nombreAval: string;
  estado: boolean;
}

export interface DepartamentoApi {
  nId_Departamento: number;
  cNombre_Departamento: string;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface ProvinciaApi {
  nId_Provincia: number;
  cNombre_Provincia: string;
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface DistritoApi {
  nId_Distrito: number;
  cNombre_Distrito: string;
}

export interface Distrito {
  id: string;
  nombre: string;
}


export interface DireccionUbicacionApi {
  nId_PersRefUbi: number;
  cNombre_PersRefUbi: string;
  cSigla_PersRefUbi?: string;
  bEstado: boolean;
  nGestionMovil: number;
}

export interface DireccionUbicacion {
  id: string;
  nombre: string;
}

// ─── POST /v1/Direccion ───
export interface CreateDireccionRequest {
  nId_PersDirecc?: number;     // ← Opcional: la BD lo asigna
  nId_PersDeudor: number;
  cDirecc_Nomb: string;
  nId_PersRefUbi: number;
  cDirecc_Coment: string;
  bEstado: boolean;
  bOrigen_Base: boolean;
  cTipoCoDeudor: string;
  dFec_Actualizacion: string;
  nId_Cliente: number;
  nid_CalifDirecc: number | null;
  nid_usuarioUpd: number;
  nId_Departamento: number;
  nId_Provincia: number;
  nId_Distrito: number;
}

export interface CreateDireccionResponse {
  nId_PersDirecc: number;
  nId_PersDeudor: number;
  nId_Ubigeo: number;
}

// ─── GET /v1/Direccion/{nId_PersDirecc} ───
export interface DireccionByIdApi {
  nId_PersDirecc: number;
  cNombre_PersRefUbi: string;
  cDirecc_Nomb: string;
  nombreAval: string;
  estado: string;              // ← string: "OK", "INACTIVO", etc.
  nId_PersRefUbi: number;
  cDirecc_Coment: string;
  bEstado: boolean;
  bOrigen_Base: boolean;
  nId_PersTitDeudor: number;
  cTipoCoDeudor: string;
  nid_CalifDirecc: number;
  cDescrip_Fija: string;
  nId_Ubigeo: number;
  nId_Departamento: number;
  nId_Provincia: number;
  nId_Distrito: number;
}

// ─── PUT /v1/Direccion ───
export interface UpdateDireccionRequest {
  nId_PersDirecc: number;
  nId_PersDeudor: number;
  cDirecc_Nomb: string;
  nId_PersRefUbi: number;
  cDirecc_Coment: string;
  bEstado: boolean;
  bOrigen_Base: boolean;
  cTipoCoDeudor: string;
  dFec_Actualizacion: string;
  nId_Cliente: number;
  nid_CalifDirecc: number | null;
  nid_usuarioUpd: number;
  nId_Departamento: number;
  nId_Provincia: number;
  nId_Distrito: number;
}

export interface UpdateDireccionResponse {
  nId_PersDirecc: number;
  nId_PersDeudor: number;
  nId_Ubigeo: number;
}
