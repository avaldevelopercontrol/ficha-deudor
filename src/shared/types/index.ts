import React from 'react';

export interface DeudorInfo {
  zona: string;
  cartera: string;
  campana: string;
  nombreRazonSocial: string;
  dniRuc: string;
  gradoInstruccion: string;
  edad: number;
  contacto: string;
  asesorAsignado: string;
  asesorPostVenta: string;
  asesorComercial: string;
  correoApv: string;
  correoAc: string;
  mejorResultado: string;
}

export interface SelectOption {
  id: string;
  label: string;
}

export interface GestionForm {
  nombreContacto: string;
  cargo: string;
  np0: string;
  np1: string;
  np2: string;
  estadoGestion: string;
  telefono: string;
  tipoGestion: string;
  gestorId: string;
  gestorNombre: string;
  fechaCompromisoPago: string;
  compromisoSoles: string;        // Añadido - compromiso en soles
  compromisoUSD: string;          // Añadido - compromiso en dólares
  fechaNuevaGestion: string;      // Fecha para nueva gestión (agendar)
  horaNuevaGestion: string;       // Hora para nueva gestión (agendar)
  fechaGestion: string;           // Fecha de gestión resultante
  horaGestion: string;            // Hora de gestión resultante
  gestionTerminada: boolean;
  observaciones: string;
}

export interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  width?: string;
  filterable?: boolean;
}

export interface TelefonoReferenciado {
  id: string;
  prioridad: number;
  numero: string;
  horario: string;
  refUbicacion: string;
  estado: string;
  fechaEstado: string;
  fechaBase: string;
  contactados: string;
  noContactados: number;
  ivr: string;
  fuente: string,
  ordenSearch: number;
  anexo: string;
  operadorTelefonico: string;
  referencia: string;
  reclamoIndecopi: string;
}

export interface TelefonoFormData {
  numero: string;
  anexo: string;
  resultado: string;
  operadorTelefonico: string;
  ubicacion: string;
  prioridad: string;
  horarioGestion: string;
  comentario: string;
  fuenteBusqueda: string;
  referencia: string;
  reclamoIndecopi: string;
}

// types/index.ts (actualizar la interfaz existente)

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

export interface GestionRealizada {
  id: string;
  nro: number;
  fecha: string;
  gestor: string;
  documento: string;
  operacion: string;
  respuesta: string;
  comentario: string;
}

export interface GestionCompleta {
  id: string;
  nro: number;
  cliente: string;
  cartera: string;
  campana: string;
  fecha: string;
  gestor: string;
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}

export interface EstadoGestion {
  id: string;
  nro: number;
  fecha: string;
  operador: string;
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}

export interface EstadoGestionCompleta {
  id: string;
  nro: number;
  cliente: string;
  cartera: string;
  campana: string;
  fecha: string;
  gestor: string;  
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}

export interface Ubigeo {
  id: string;
  nombre: string;
  provincias?: Provincia[];
}

export interface Provincia {
  id: string;
  nombre: string;
  distritos?: Distrito[];
}

export interface Distrito {
  id: string;
  nombre: string;
}