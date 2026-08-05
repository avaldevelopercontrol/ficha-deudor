export const MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS = {
  title:
    'Asignar Accesos al Perfil',
  profileLabel:
    'Perfil',
  profilePlaceholder:
    'Seleccione un perfil...',
  optionsTitle:
    'Opciones:',
  permissionsTitle:
    'Seleccionaste:',
  noSelectedOption:
    'Seleccione una opción del árbol',
  selectAll:
    'Seleccionar todo',
  selectedCountSingular:
    'opción seleccionada',
  selectedCountPlural:
    'opciones seleccionadas',
  globalPermissionHint:
    'Este control selecciona todas las opciones finales. Root es técnico y no se registrará.',
  containerPermissionHint:
    'Esta opción es un contenedor. Se registrará automáticamente con CONSULTAR cuando seleccione alguna subopción.',
  singlePermissionHint:
    'Los cambios se aplicarán únicamente a esta opción.',
  loading:
    'Cargando perfiles y opciones...',
  emptyProfiles:
    'No existen perfiles disponibles para asignar accesos.',
  emptyOptions:
    'No existen opciones disponibles para asignar.',
  retry:
    'Reintentar',
  submit:
    'Registrar',
  submitting:
    'Registrando...',
  validationTitle:
    'Revise la información antes de registrar:',
} as const;

export const PERFIL_OPCION_PERMISSION_LABELS = {
  consultar: 'CONSULTAR',
  insertar: 'INSERTAR',
  editar: 'EDITAR',
  eliminar: 'ELIMINAR',
  exportar: 'EXPORTAR',
} as const;
