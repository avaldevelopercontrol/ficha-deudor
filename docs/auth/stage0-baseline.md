# Auth — Etapa 0: baseline de seguridad para refactor

## Objetivo

Esta etapa congela el comportamiento observable de `src/features/auth` antes de iniciar optimizaciones internas.

No modifica UI, estilos, rutas, contratos HTTP ni lógica funcional de autenticación. Su propósito es disponer de una verificación reproducible y de una lista explícita de invariantes que las siguientes etapas no deben romper accidentalmente.

## Comandos de verificación

### Tests aislados de Auth

```bash
npm run test:auth
```

Ejecuta únicamente los archivos `*.test.ts` y `*.test.tsx` que se encuentran dentro de `src/features/auth`.

### Baseline completa de Auth

```bash
npm run check:auth
```

Ejecuta, en este orden:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:auth`
4. `npm run build`

Antes de cerrar cualquier etapa de optimización de Auth, `npm run check:auth` debe finalizar correctamente.

El comando global existente sigue disponible:

```bash
npm run check
```

Este continúa ejecutando la suite completa del proyecto y debe utilizarse antes de integrar cada etapa en la rama principal.

## Superficie funcional protegida

Las siguientes responsabilidades se consideran parte del comportamiento actual y deben mantenerse durante el refactor, salvo que una etapa indique expresamente un cambio de contrato:

### Autenticación

- Login con normalización del nombre de usuario.
- Propagación de `AbortSignal` en las solicitudes cancelables.
- Tratamiento específico de los códigos de aplicación `092`, `093` y `094`.
- Rechazo controlado de respuestas inválidas o manipuladas.
- Rechazo de usuarios inactivos.
- Conservación del mensaje funcional que debe mostrarse al usuario.

### Sesión

- Restauración de una sesión válida desde almacenamiento local.
- Eliminación de estados persistidos inválidos.
- Persistencia de usuario y cliente seleccionado.
- Cierre de sesión local y sincronizado entre ventanas.
- Recuperación de cambios de sesión producidos desde otra ventana.
- Limpieza de sesión al cerrar la última ventana principal según la política vigente.

### Contexto cliente / año / cartera

- Obtención de clientes/grupos disponibles para el usuario.
- Obtención de años por cliente.
- Obtención de carteras por cliente y año.
- Cancelación de solicitudes anteriores cuando cambia la selección.
- Protección frente a respuestas asincrónicas obsoletas.
- Autoselección cuando existe una sola opción válida.
- Invalidación de dependencias: cliente → año → cartera.
- Bloqueo de continuación cuando la selección requerida está incompleta.

## Superficie pública que no debe romperse

Durante las etapas de refactor se conservarán los barrels actuales y, por tanto, las importaciones existentes de los consumidores:

- `src/features/auth/api/index.ts`
- `src/features/auth/contexts/index.ts`
- `src/features/auth/hooks/index.ts`
- `src/features/auth/modules/index.ts`
- `src/features/auth/types/index.ts`
- `src/features/auth/utils/index.ts`

En particular, las siguientes operaciones deben continuar disponibles con comportamiento compatible:

- `login`
- `fetchGruposClienteInicial`
- `fetchAniosByCliente`
- `fetchCarterasParametrosByClienteAnio`
- `useAuth`
- `AuthProvider`
- persistencia/restauración de `AuthState`
- selección de cliente
- logout y sincronización de sesión

## Regla para las siguientes etapas

Cada etapa debe cumplir estas condiciones antes de considerarse terminada:

1. No modificar el diseño ni la UI existente.
2. Mantener compatibles los consumidores externos de `features/auth`.
3. Añadir o actualizar tests cuando cambie implementación interna con riesgo de regresión.
4. Ejecutar `npm run check:auth`.
5. Ejecutar `npm run check` antes de integrar la etapa completa.

Si una optimización obliga a cambiar un contrato público, debe tratarse como una migración explícita y no como una refactorización interna.
