export interface UsuarioZonaItem {
  idAsignacion: number | null;
  idUsuario: number;
  idCliente: number;
  zona: string;
  nombre: string;
  estado: boolean | null;
}

export interface UsuarioZonaDiff {
  agregar: UsuarioZonaItem[];
  quitar: UsuarioZonaItem[];
}

export interface GuardarUsuarioZonasPayload {
  idUsuario: number;
  idCliente: number;
  zonasIniciales: UsuarioZonaItem[];
  zonasActuales: UsuarioZonaItem[];
}
