export const PERFILES_USUARIO_BY_ID: Record<number, string> = {
  1: 'Gestor Campo',
  2: 'Gestor Call',
  3: 'Supervisor Call',
  4: 'Supervisor Campo',
  5: 'Gerencia General',
  6: 'Coordinador',
  7: 'Cliente Externo 1',
  8: 'Jefe Zonal',
  9: 'Administrador Base Datos',
  10: 'Digitador',
  11: 'Jefe de Operaciones',
  12: 'Abogado',
  13: 'Cliente Externo 2',
  14: 'Asistente de Cartera',
  15: 'Monitor Call',
  16: 'Jefatura Judicial',
  17: 'Asistente Judicial',
  18: 'Encargado de Archivo Judicial',
  19: 'Practicante Judicial',
  20: 'Gestor Documentario',
  21: 'Recepcionista',
  22: 'Gerente División - Avon',
  23: 'Gerente Zonal - Avon',
  24: 'Cliente Externo 3',
  25: 'Cliente Externo 4',
  26: 'Recursos Humanos',
  27: 'TOP2',
  28: 'Cliente Externo 5',
  29: 'Cliente Externo 6',
  30: 'Cliente Aval',
  31: 'Cliente BITEL 1',
};

export const getPerfilUsuarioNombreById = (
  perfilId?: number | string | null
): string => {
  if (perfilId === null || perfilId === undefined || perfilId === '') {
    return 'Perfil no definido';
  }

  const normalizedPerfilId = Number(perfilId);

  if (!Number.isFinite(normalizedPerfilId)) {
    return 'Perfil no definido';
  }

  return (
    PERFILES_USUARIO_BY_ID[normalizedPerfilId]?.trim() ??
    `Perfil ${normalizedPerfilId}`
  );
};