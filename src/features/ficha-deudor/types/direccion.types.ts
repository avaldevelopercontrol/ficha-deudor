export interface DireccionReferenciada {
  id: string;
  direccion: string;
  refUbicacion: string;
  tipoDeudor: string;
  nombre: string;
  estado: string;
  departamento?: string;     // ← NUEVO
  provincia?: string;        // ← NUEVO
  distrito?: string;         // ← NUEVO
  comentario?: string;       // ← NUEVO
  llegoDeBase?: string;      // ← NUEVO
  nombreAval?: string;       // ← NUEVO
}

export interface DireccionFormData {
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  refUbicacion: string;
  comentario: string;
  llegoDeBase: string;
  tipoDeudor: string;
}

export interface DireccionEditFormData {
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  refUbicacion: string;
  comentario: string;
  llegoDeBase: string;
  tipoDeudor: string;
  nombreAval: string;      // ← NUEVO
  estado: string;          // ← NUEVO
}