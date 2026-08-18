# Portfolio Control Center — ETAPA 5 / Avance 2

## Objetivo

Fijar el **contrato canónico de lectura** del Analytics DB antes de construir
el ETL.

La regla principal es separar correctamente:

- **snapshots**: estado de cartera en un corte;
- **flows**: eventos/montos ocurridos durante un intervalo.

Esto evita el error clásico de sumar una cartera asignada varias veces entre
días.

---

## 1. Regla temporal

Para cualquier consulta con:

- `date_from`
- `date_to`

se aplican dos comportamientos diferentes.

### Snapshot

Se toma el **último `date_key` con `has_source_snapshot = 1` dentro del rango**.

`fact_portfolio_daily` puede contener filas creadas por el ETL live para
transportar flows del día. Esas filas pueden conservar valores de cartera del
último corte conocido, pero `has_source_snapshot = 0` indica que **no existe un
snapshot observado para ese `date_key`**.

Ejemplos:

- cartera asignada;
- cartera gestionada;
- pendiente;
- contactados;
- contacto directo;
- monto asignado.

Nunca:

`SUM(snapshot día 1 + snapshot día 2 + ...)`.

### Flows

Se suman dentro de todo el rango seleccionado.

Ejemplos:

- gestiones;
- promesas creadas cuando la métrica es conteo de eventos;
- recaudo monetario;
- impactos por canal.

Los contadores `DISTINCT`, como pagadores únicos, **no se suman entre días**.
Para ellos se conserva el grain necesario y el distinct se recalcula para el
rango solicitado.

### Pagadores Portfolio en rangos

`fact_portfolio_daily.payers_count_day` es un distinct diario a grain:

`fecha + cartera`

Por tanto, `SUM(payers_count_day)` no representa necesariamente pagadores
únicos del rango. Para el distinct exacto se utiliza:

`analytics.fact_debtor_payment_daily`

con grain:

`fecha + cartera + deudor`

Esta fact **sí incluye** las filas sintéticas `Pago Sin Promesa`, porque aunque
no sean gestión/contacto/promesa, sí representan pago y pagador de Portfolio.

Para un rango se reagrupa a:

`cartera + deudor`

y se cuenta una sola vez cada combinación.

`portfolio_payers = distinct (portfolio_key, source_debtor_id)`

El `recovered_amount_day` continúa siendo un flow monetario y sí se suma entre
días.

---

## 2. Resumen Portfolio

Para un filtro de campaña/cartera:

1. localizar el último corte con `has_source_snapshot = 1`;
2. sumar el snapshot entre las carteras visibles en ese corte;
3. sumar flows entre `date_from` y `date_to`.

Derivados:

### Avance

`managed_snapshot / assigned_snapshot`

### Pendiente

Se conserva como snapshot cargado y además debe cumplir conceptualmente:

`assigned_snapshot - managed_snapshot`

### Intensidad general

`management_events_en_rango / managed_snapshot_del_último_corte`

No confundir con intensidad masiva por canal de Power BI CLARO.

### Contactabilidad CLARO

`contacted_snapshot / assigned_snapshot`

---

## 3. RPC

Fuente transversal.

Grain lógico del denominador:

`cartera + deudor`

Denominador:

deudores distintos clasificados como:

- `CD`
- `CI`
- `NC`

Numerador:

deudores distintos `CD`.

`RPC = CD / (CD + CI + NC)`

No se calcula con filas de gestión sin deduplicar por cartera/deudor.

---

## 4. Tasa de cierre

Numerador:

`cartera + deudor` con una **promesa válida**.

Una promesa válida no depende únicamente de `montoPromesa > 0`.

Regla inicial:

- `marca_promesa_valida = 1`;
- `montoPromesa > 0`;
- estado diferente de `No PdP y No Pagos`.

Denominador:

`cartera + deudor` con contacto directo `CD`.

`close_rate = promesas válidas / contactos directos`

Esta es una normalización de calidad deliberada respecto a cualquier medida
legacy que use únicamente `montoPromesa > 0`.

### RPC y close rate de asesor en rangos

No se deben sumar los distinct diarios de `fact_advisor_daily` para obtener
un distinct multi-día.

Para RPC de asesor se utiliza:

`analytics.fact_advisor_debtor_contact_daily`

A grain:

`fecha + cartera + asesor + deudor`

Para un rango, primero se reagrupa a:

`cartera + asesor + deudor`

y se aplica precedencia acumulada:

`CD > CI > NC`

Después:

`advisor_rpc = distinct debtor CD / distinct debtor (CD + CI + NC)`

Para close rate de asesor, el denominador sale del mismo grain exacto de
contactos y el numerador se obtiene de `fact_promise`:

- `is_valid_promise = 1`;
- `advisor_key` informado;
- `management_at` dentro del rango;
- distinct `portfolio_key + advisor_key + source_debtor_id`.

Por tanto:

`advisor_close_rate = distinct debtor con promesa válida / distinct debtor CD`

`fact_advisor_daily` sigue siendo válido para métricas de un solo día y para
flows aditivos, pero sus contadores distinct no se suman para responder un
rango exacto.

### Capacidad de métricas de asesor

Analytics puede atribuir a un asesor gestiones, RPC, close rate, promesas,
pagadores y recaudo atribuible. No existe una asignación canonical de cartera
o meta por asesor.

Por tanto, `contactability_rate` **no está disponible a nivel asesor** porque la
definición canonical del producto es `contacted / assigned` y no existe un
denominador `assigned` validado por asesor. No se debe sustituir por RPC, por
contacto/gestiones ni por la cartera completa de campaña.

El contrato React de ETAPA 3 todavía contiene
`AdvisorPerformanceItem.contactabilityRate`; ese campo se ajustará al integrar
la API real en ETAPA 7 y no debe poblarse con `0` ni con una métrica legacy
distinta.

Ver `portfolio-v1-advisor-metrics-contract.md`.

### Pagadores de asesor en rangos

`fact_advisor_daily.payers_count` es un distinct diario a grain:

`fecha + cartera + asesor`

Por tanto, tampoco se debe usar `SUM(payers_count)` para obtener pagadores
únicos de un rango.

Para el distinct exacto se utiliza:

`analytics.fact_advisor_debtor_payment_daily`

con grain:

`fecha + cartera + asesor + deudor`

La fact solo contiene pagos atribuibles a una gestión real de asesor
(`paid_amount > 0`). Las filas sintéticas `Pago Sin Promesa` permanecen fuera
de la atribución de asesor.

Para un rango se reagrupa a:

`cartera + asesor + deudor`

y se cuenta una sola vez cada combinación.

`advisor_payers = distinct (portfolio_key, advisor_key, source_debtor_id)`

`recovered_amount` del asesor sigue siendo un flow monetario aditivo y puede
sumarse en el rango, pero representa **recaudo atribuible a asesor**, no el
recaudo total de cartera.

---

## 5. Promesas que vencen hoy

Se consulta `fact_promise` con:

- `is_valid_promise = 1`;
- `status_code = DUE_TODAY`.

KPIs:

- cantidad de promesas;
- monto prometido que vence hoy.

El estado numérico de la fuente (`2.`, `8.`, etc.) nunca forma parte del
contrato.

---

## 6. Calidad PDP monetaria

Numerador monetario:

pagos asociados a:

- `FULFILLED`;
- `PARTIAL`;
- `FULFILLED_OUT_OF_RANGE`.

Denominador monetario:

monto prometido de:

- `FULFILLED`;
- `PARTIAL`;
- `FULFILLED_OUT_OF_RANGE`;
- `BROKEN`.

`promise_fulfillment_amount_rate = paid / promised_evaluated`

Esto mide cumplimiento monetario, no cantidad de promesas cumplidas.

---

## 7. Supervisor

`fact_advisor_daily` no guarda el supervisor como texto. La atribución se
resuelve históricamente mediante `bridge_supervisor_advisor`, usando la fecha
del evento y nunca el supervisor current para retroceder historia.

El soporte `014_portfolio_v1_supervisor_metrics_support.sql` expone grains con
atribución histórica para:

- flows diarios de asesor;
- contacto exacto asesor/deudor;
- pagadores atribuibles asesor/deudor;
- promesas/PDP con `advisor_key`.

Para un rango, RPC, close rate y pagadores se recalculan desde esos grains
exactos; no se suman distinct diarios.

### Métricas permitidas

A nivel supervisor se pueden atribuir:

- cantidad de asesores en la relación del rango;
- gestiones;
- RPC exacto;
- close rate exacto;
- promesas válidas;
- cumplimiento monetario PDP;
- pagadores atribuibles;
- recaudo atribuible a sus asesores.

### Métricas no atribuibles con la fuente actual

No existe una asignación canonical de cartera o meta por supervisor. Por tanto,
la API no debe fabricar para supervisor:

- cartera asignada/pendiente;
- avance `managed / assigned`;
- contactabilidad canonical `contacted / assigned`;
- meta mensual;
- expected curve, pace o gap contra meta.

La meta completa de campaña nunca se atribuye al supervisor filtrado.

Los asesores sin relación histórica para la fecha permanecen con
`supervisor_key IS NULL`; la UI podrá rotularlos como `Sin supervisor` sin crear
un registro artificial en `dim_supervisor`.

Detalle completo:

`docs/analytics/portfolio-v1-supervisor-metrics-contract.md`

---

## 8. Meta y curva esperada

La vista:

`analytics.v_campaign_target_progress`

calcula:

- recaudo acumulado;
- meta mensual;
- días hábiles transcurridos;
- esperado al corte;
- cumplimiento final;
- cumplimiento de ritmo;
- gap monetario;
- gap porcentual.

### Cumplimiento final

`recovered_to_date / monthly_target`

### Esperado al corte

`monthly_target × elapsed_business_days / total_business_days`

### Cumplimiento de ritmo

`recovered_to_date / expected_to_date`

### Gap

`recovered_to_date / expected_to_date - 1`

La lógica usa `dim_date.is_business_day`, por lo que feriados se resuelven en
el calendario y no en React. Para 2026 la referencia oficial se materializa
mediante `013_portfolio_v1_peru_business_calendar.sql`; la curva no debe
publicarse para un año cuyo calendario oficial aún no haya sido cargado y
validado.

La meta mensual V1 se carga desde `base-goals.xlsx` mediante el adaptador
`CLARO_BASE_GOALS` hacia `analytics.fact_target_monthly`. La carga es a nivel
campaña (`portfolio_key IS NULL`); no se reparte la meta entre supervisores,
asesores o carteras sin una regla de negocio validada.

Para CLARO, `base-goals.xlsx` representa la meta vigente por cartera. La
campaña Analytics (`YYYY-MM`) la determina el proceso que solicita la carga;
los campos fuente `AÑO` y `ASIGNACIÓN` no se usan para filtrar esa campaña.
Mientras exista una única fila CLARO vigente, su `META_PAGOS` se reutiliza en
las campañas sucesivas y el monto siempre se vuelve a leer del archivo fuente.

---

## 9. Scope CLARO V1

El BI CLARO analizado usa:

`PBI_CLARO_CORP_ADMINISTRATIVO`.

GESTION-COB2, en cambio, contiene tanto:

- CLARO CORPORATIVO;
- CLARO GOBIERNO;
- otros clientes.

Para cuadrar el producto V1 con el BI actual:

1. tomar el conjunto de carteras de
   `PBI_CLARO_CORP_ADMINISTRATIVO`;
2. consumir `vw_bi_gerencia_gestiones_pagos`;
3. restringir a `CLARO CORPORATIVO`;
4. restringir además a las mismas carteras del snapshot.

No usar simplemente:

`cCli_Nombre LIKE '%CLARO%'`

porque incluiría CLARO GOBIERNO y alteraría los KPIs del alcance actual.

Esta regla pertenecerá al mapping de fuente CLARO dentro del ETL, nunca a
React.

---

## 10. Vistas creadas

### `analytics.v_portfolio_daily_metrics`

Métricas por cartera/fecha con avance y contactabilidad derivados.

### `analytics.v_campaign_daily_summary`

Agrega carteras dentro de un mismo corte de campaña.

### `analytics.v_advisor_daily_metrics`

Expone productividad y deriva:

- RPC;
- tasa de cierre.

### `analytics.v_promise_operational`

Normaliza flags operativos:

- `is_due_today`;
- `is_broken`;
- `is_fulfilled_or_partial`.

### `analytics.v_campaign_target_progress`

Calcula meta, esperado al corte, cumplimiento y gap.

### `analytics.v_portfolio_evolution_daily`

Expone la evolución histórica real por cartera desde EVOL y combina el
recaudo canonical proveniente de los flows LIVE.

### `analytics.v_campaign_evolution_daily`

Agrega la evolución de carteras por fecha para el gráfico de campaña. Los
campos de estado (`assigned/managed/pending`) proceden de EVOL; el recaudo
acumulado procede de `fact_portfolio_daily.recovered_amount_day`.

---

## 11. Contrato esperado del futuro API

Portfolio Control Center podrá resolver su pantalla con bloques equivalentes
a:

- `GET /portfolio/summary`
- `GET /portfolio/evolution`
- `GET /portfolio/campaigns`
- `GET /portfolio/supervisors`
- `GET /portfolio/advisors`
- `GET /portfolio/promises/attention`

La API no expondrá nombres de tablas Power BI ni lógica específica de CLARO.

---

## 12. Validación antes del ETL

El archivo:

`database/analytics/validation/claro_portfolio_v1_source_validation.sql`

genera una línea base directamente desde las fuentes actuales para la campaña
del mes en curso.

La salida final debe conservarse para comparar posteriormente:

`SOURCE actual vs ANALYTICS DB`

antes de conectar React.

---

## 13. Estado de implementación

Este contrato ya está respaldado en ETAPA 6 por cargas de:

- snapshot de cartera;
- operación live / PDP / recaudo;
- pagadores Portfolio a grain exacto multi-día;
- asesor y grains exactos multi-día;
- jerarquía supervisor;
- contratos de atribución segura de métricas supervisor;
- meta mensual de campaña;
- evolución histórica de cartera por `fecha + cartera`, con recaudo canonical LIVE.

La integración API se inicia únicamente después de validar estas cargas reales
y sus controles de calidad.

---

## 14. Gate de salida de ETAPA 6

Antes de iniciar la integración API se ejecuta:

`database/analytics/validation/portfolio_v1_stage6_readiness_validation.sql`

El gate consolida objetos, watermarks, datos mínimos de campaña, grains exactos,
targets, calendario, EVOL y guardrails de advisor/supervisor.

La condición funcional de salida es:

`functional_assessment = OK`

El scheduling automático del transporte de jerarquía `45 -> 180` permanece como
deuda operativa separada mientras no exista un runtime con conectividad a ambas
instancias. No se considera motivo para inventar otra arquitectura ni para
alterar la semántica Analytics ya validada.

El frontend de ETAPA 3 conserva algunos campos mock que no son atribuibles con
las fuentes reales. Esos contratos se ajustan al integrar la API en ETAPA 7;
Analytics no debe fabricar valores para completarlos.
