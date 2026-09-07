# Gestión Deudor — Etapa 8: auditoría final y cierre de optimización

## Alcance

Esta etapa cierra la optimización de `src/features/gestion-cobranzas/modules/gestion-deudor` después de la reubicación arquitectónica y las etapas 1–7. No introduce cambios de UI, rutas, endpoints ni reglas funcionales. El objetivo es consolidar las invariantes que deben preservarse, añadir una puerta de calidad dedicada y dejar documentados los riesgos residuales que no justifican más refactorización local.

## Arquitectura resultante

### Ownership funcional

`gestion-deudor` es un submódulo de Gestión de cobranzas y su ruta pertenece al feature padre:

```text
src/features/gestion-cobranzas/
├── constants/
│   └── gestionCobranzasRoutes.constants.ts
└── modules/
    └── gestion-deudor/
```

Auth no posee ni declara la ruta `/gestion-cobranzas/gestion-deudor`.

### Frontera HTTP y dominio

Toda respuesta utilizada por el módulo entra como `unknown`, se valida estructuralmente y se normaliza antes de llegar a React.

```text
HTTP
  ↓
unknown
  ↓
envelope + runtime validation
  ↓
API DTO
  ↓
mapper
  ↓
domain model
  ↓
React / tabla / navegación
```

Los nombres del backend (`nId_PersDeudor`, `nId_Cliente`, `nId_Contrato`, `nId_Cartera`, `zonaCampanna`, etc.) quedan confinados a las capas `api`, `validations` y `mappers`. El modelo de aplicación utiliza `idDeudor`, `idCliente`, `idContrato`, `idCartera`, `zonaCampania`, etc.

### Búsqueda y ciclo asíncrono

La búsqueda normaliza el cliente por valor, no por identidad referencial. Una petición activa se identifica mediante `requestId`, se cancela cuando cambia el contexto y las respuestas obsoletas no pueden repoblar la pantalla.

```text
criterio válido
   ↓
requestId
   ↓
useAsyncResource
   ↓
AbortSignal + invalidación de stale response
```

El botón Buscar queda bloqueado mientras existe una consulta activa y Limpiar invalida la request pendiente antes de vaciar el estado.

### Paginación

`PageSize = 1000` es un tamaño de lote HTTP, no un límite de resultados. La primera página determina `totalPages`/`totalRecords` y las páginas restantes se recuperan antes de entregar la colección al paginador client-side.

Se valida que cada página corresponda a la página/tamaño solicitados, que la metadata sea consistente entre páginas y que el número final de registros coincida con `totalRecords`.

### Identidad y navegación

`GestionDeudorIdentity` es la identidad común del módulo:

```text
{
  idCliente,
  idUsuario
}
```

Búsqueda, navegación a Ficha Deudor y Producción del Gestor parten del mismo contexto validado. Una identidad o fila inválida produce una acción deshabilitada/no-op controlada en vez de un `throw` tardío desde un evento UI.

### CSS y bundle

Los estilos específicos pertenecen a `GestionDeudorPage` y se cargan junto al chunk lazy. `src/shared/styles/index.css` no importa el CSS del submódulo. Las reglas verdaderamente globales de navegación/popups viven en `shared/styles/layout`.

## Invariantes protegidas por la Etapa 8

- No puede reaparecer `src/features/gestion-deudor` como feature de primer nivel sin romper una regresión arquitectónica.
- Auth no puede volver a apropiarse de la ruta de Gestión Deudor sin romper una regresión.
- Los nombres crudos del backend no pueden filtrarse a hooks, componentes, páginas o modelos de dominio sin romper una regresión.
- El CSS específico no puede volver a importarse globalmente sin romper una regresión.
- Las consultas continúan validando payloads remotos antes de mapearlos.
- La paginación no acepta colecciones parciales como resultados completos.
- Una identidad inválida no dispara búsqueda, navegación ni Producción del Gestor.

## Cobertura de cierre añadida

La Etapa 8 añade ocho regresiones nuevas:

- cuatro invariantes arquitectónicas para ownership del feature, ruta, DTOs y CSS;
- respuesta exitosa vacía de Producción del Gestor;
- rechazo de un éxito de Producción que omite `response`;
- normalización de identidades numéricas;
- rechazo de una búsqueda antes de construir la request cuando el cliente es inválido.

La suite específica pasa de 61 a 69 pruebas.

## Riesgos residuales conocidos

### Paginación client-side de colecciones muy grandes

La estrategia actual recupera todas las páginas del backend y posteriormente pagina en memoria. Con `PageSize = 1000` es adecuada para el volumen esperado y corrige el truncamiento previo, pero si el endpoint puede devolver decenas o cientos de miles de filas deberá migrarse a paginación server-side visible o a una estrategia con límites explícitos.

### Concurrencia de páginas restantes

Las páginas posteriores a la primera se solicitan en paralelo mediante la utilidad compartida `fetchAllPagesInParallel`. Para los volúmenes actuales minimiza latencia. Si `totalPages` pudiera crecer de forma extrema, sería conveniente introducir un límite de concurrencia en la infraestructura compartida, no una implementación particular dentro de Gestión Deudor.

### Infraestructura de popup heredada de Ficha Deudor

Producción del Gestor utiliza `openFichaDeudorPopup` y componentes/contextos de popup que históricamente nacieron dentro de `ficha-deudor`, aunque el popup ya pertenece funcionalmente a Gestión Deudor. Esta dependencia es transversal y no debe resolverse mediante otra refactorización local. El siguiente paso, si se prioriza, sería extraer una infraestructura `AppPopup` compartida.

### Infraestructura asíncrona compartida

`useAsyncResource` pertenece a `shared` y es consumido por varios features. Cualquier optimización adicional de su controller o lifecycle debe auditarse de forma transversal y no introducirse desde Gestión Deudor únicamente.

## Política para cambios futuros

Antes de integrar cambios en Gestión Deudor se debe ejecutar:

```bash
npm run check:gestion-deudor
npm run check
```

Toda modificación de contratos API, metadata paginada, navegación hacia Ficha Deudor o identidad cliente/usuario debe acompañarse de una regresión específica.

No se recomienda añadir Redux, Zustand, TanStack Query u otra capa de estado/data-fetching exclusivamente para este módulo mientras el flujo actual siga cubierto por hooks locales, `useAsyncResource` y utilidades compartidas.

## Baseline final validada

Al cerrar la Etapa 8, la baseline reproducible queda en:

```text
Gestión Deudor:  69/69
Suite global:    774/774
TypeScript:      OK
ESLint:          OK
Build:           OK
```

Este documento describe el estado técnico del snapshot auditado. Si la suite crece posteriormente, los contadores deberán actualizarse junto con la evolución del proyecto.
