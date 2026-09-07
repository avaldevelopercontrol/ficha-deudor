# Auth — Etapa 8: auditoría final y cierre de optimización

## Alcance

Esta etapa cierra la optimización de `src/features/auth` después de las etapas 0–7. No introduce cambios de UI, rutas ni contratos funcionales. Su objetivo es confirmar que la arquitectura resultante es coherente, reforzar escenarios de regresión que todavía no estaban caracterizados y dejar registradas las decisiones que deben preservarse.

## Arquitectura resultante

### Frontera HTTP

Toda respuesta remota utilizada por Auth entra como `unknown` y se valida antes de convertirse en un modelo de dominio.

```text
HTTP -> unknown -> envelope/runtime guard -> normalizer -> Auth/domain model
```

El login y el contexto cliente/año/cartera están separados internamente en `loginApi.ts` y `clienteContextApi.ts`, mientras `authApi.ts` conserva la fachada pública compatible.

### Estado y sesión

`AuthProvider` mantiene el estado React como fuente de verdad de la ventana actual. La persistencia guarda únicamente identidad y cliente seleccionado; estados transitorios de solicitudes, errores y desafíos de contraseña no se serializan.

La limpieza de storage y la publicación de logout son responsabilidades independientes. Los cambios de sesión provenientes de otra ventana reinician también el estado transitorio de autenticación.

### Solicitudes asincrónicas

Login y selector cliente/año/cartera mantienen controllers estables por montaje. Las solicitudes anteriores se cancelan y las respuestas obsoletas quedan invalidadas aunque una implementación remota ignore `AbortSignal`.

### Coordinación multi-window

`localStorage` continúa siendo el mecanismo persistente/fallback. `BroadcastChannel` funciona únicamente como señal complementaria y tolera ausencia o fallos de la API.

La presencia usa heartbeat espaciado y lease suficientemente amplio para tolerar throttling de pestañas en background. El logout de última ventana conserva una gracia de reload y los popups usan procesamiento dirigido por eventos con polling lento solo como recuperación.

## Invariantes protegidas

- Login normal y códigos funcionales `092`, `093`, `094` conservan su semántica.
- Respuestas remotas inválidas no adquieren tipos de dominio sin validación runtime.
- Un logout explícito genera una sola publicación global.
- Una sesión externa reemplaza estado persistente y limpia estado transitorio local.
- Cliente, año y cartera invalidan correctamente sus dependencias descendentes.
- Una respuesta asincrónica antigua no puede sobrescribir una selección más reciente.
- El cierre de una ventana principal no finaliza la sesión mientras exista otra ventana principal activa.
- Un reload dentro de la gracia no se interpreta como cierre definitivo.
- `BroadcastChannel` nunca es requisito para conservar el comportamiento de logout/sincronización.
- La aplicación falla de forma segura ante datos persistidos manipulados o incompatibles.

## Cobertura de cierre añadida

La Etapa 8 añade regresiones para:

- relaciones temporales seguras entre heartbeat, lease, gracia de reload y fallback de popup;
- constructor de `BroadcastChannel` no disponible/defectuoso;
- errores de `postMessage` y `close` sin propagación al flujo Auth;
- bloqueo del selector mientras clientes/años/carteras siguen cargando;
- bloqueo del selector ante errores o cargas dependientes incompletas.

## Riesgos residuales conocidos

### Login mediante GET con credenciales en query string

El endpoint vigente de login utiliza `GET` y construye usuario/contraseña en la query. El frontend mitiga caché y referrer mediante `cache: 'no-store'` y `referrerPolicy: 'no-referrer'`, pero esto no elimina el riesgo de que la URL pueda aparecer en infraestructura intermedia, observabilidad, proxies o logs del servidor.

La corrección definitiva requiere un contrato de backend que acepte credenciales mediante `POST` y body. No debe cambiarse unilateralmente desde frontend porque rompería el endpoint actual.

### Cierre abrupto del proceso/navegador

El algoritmo de última ventana depende de eventos del navegador y de un lease de presencia. Un cierre de proceso que impida cualquier `pagehide` puede dejar una entrada hasta que expire el lease. Este comportamiento es intencional para evitar falsos logout por throttling o suspensión de pestañas.

## Política para cambios futuros

Antes de integrar cambios en Auth se debe ejecutar:

```bash
npm run check:auth
npm run check
```

Cualquier modificación de API, persistencia de sesión o temporización multi-window debe acompañarse de una regresión específica. No se recomienda añadir una librería global de estado o data-fetching únicamente para Auth mientras sus necesidades sigan cubiertas por Context, reducers y controllers actuales.

## Baseline final validada

Al cerrar la Etapa 8, la baseline reproducible queda en:

```text
Auth:          158/158
Suite global:  743/743
TypeScript:    OK
ESLint:        OK
Build:         OK
```

Este documento describe el estado técnico del snapshot auditado; si la suite crece posteriormente, los contadores naturalmente deberán actualizarse junto con la evolución del proyecto.
