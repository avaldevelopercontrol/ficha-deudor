export const MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS = {
  title:
    'Asignar accesos al usuario',
  userLabel:
    'Usuario',
  userPlaceholder:
    'Buscar por nombre o usuario...',
  userRequiresGroupPlaceholder:
    'Seleccione primero un grupo...',
  groupLabel:
    'Grupo',
  groupPlaceholder:
    'Seleccione un grupo...',
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
    'Cargando usuarios, grupos y opciones...',
  emptyUsers:
    'No existen usuarios disponibles para asignar accesos.',
  allUsersAssignedToGroup:
    'Todos los usuarios disponibles ya tienen accesos configurados para este grupo. Utilice Editar para administrarlos.',
  emptyGroups:
    'No existen grupos disponibles para asignar accesos.',
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
