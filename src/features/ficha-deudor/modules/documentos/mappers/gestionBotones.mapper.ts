import type {
  GestionBoton,
  GestionBotonApi,
} from '../types/gestionBoton.types';

const normalizeBotonLabel = (
  descripcion: string,
  nombre: string
): string => {
  const normalizedDescription = descripcion
    .trim()
    .replace(/^\+\s*/, '');

  return normalizedDescription || nombre.trim();
};

export const mapGestionBotones = (
  botones: GestionBotonApi[]
): GestionBoton[] => {
  return botones
    .filter((boton) => boton.bEstado)
    .map((boton) => ({
      id: boton.nId_Boton,
      nombre: boton.nombreBoton.trim(),
      label: normalizeBotonLabel(
        boton.descripcionBoton,
        boton.nombreBoton
      ),
    }))
    .filter((boton) => Boolean(boton.nombre && boton.label));
};
