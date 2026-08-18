# Portfolio Control Center — ETAPA 6 / Avance 1

## 1. Qué se implementa

Primer ETL real del producto:

- cliente;
- campaña;
- calendario;
- carteras;
- snapshot diario de Portfolio CLARO;
- watermark del snapshot.

Todavía **no** se cargan:

- GESTION-COB2 intradía;
- asesor;
- supervisor;
- promesas/PDP;
- pagos/recaudo;
- metas.

Se hace deliberadamente en dos avances para poder validar el universo de
cartera antes de mezclarlo con eventos.

---

## 2. Baseline cerrado antes del ETL

Para CLARO Administrativo / Corporativo, campaña agosto 2026:

- 29 carteras;
- 42,904 cartera asignada;
- 37,695 gestionada;
- 5,209 pendiente;
- 87.8589 % de avance;
- 1,139 contactados;
- 2.6548 % de contactabilidad;
- S/ 52,634,571.08 asignados.

La igualdad principal:

`42,904 = 37,695 + 5,209`

debe mantenerse después de la carga.

---

## 3. Fecha del snapshot

La tabla:

`aval_reporteria.dbo.PBI_CLARO_CORP_ADMINISTRATIVO`

se observó reconstruida por la mañana con actividad operativa hasta T-1.

Por eso el procedimiento **no inventa la fecha**.

Recibe:

`@snapshot_date`

explícitamente.

Para la evidencia analizada el primer snapshot debe cargarse como:

`2026-08-12`

aunque el procedimiento se ejecute el 13/08.

---

## 4. Cliente CRM

El ETL no supone que:

`nId_Cliente de reportería == ID del cliente seleccionado en CRM`.

El procedimiento exige:

`@crm_client_id`

y lo usa para construir `dim_client`.

Esto mantiene separadas:

- identidad operacional de las fuentes;
- identidad/autorización del CRM.

React nunca recibe ni conoce `nId_Cliente = 95`.

---

## 5. Idempotencia

Si se ejecuta dos veces para:

`cliente + campaña + snapshot_date`

el procedimiento:

- actualiza dimensiones;
- actualiza columnas snapshot;
- inserta solo filas faltantes;
- no duplica facts;
- no desactiva carteras por ejecutar un backfill histórico;
- no toca los futuros campos flow:
  - `management_events_day`;
  - promesas;
  - pagos;
  - recaudo.

Esto permite que el siguiente ETL intradía escriba flows sobre el mismo
`fact_portfolio_daily` sin que un reproceso de snapshot los borre.

---

## 6. Managed amount

`managed_amount_snapshot` queda en `0` en este avance.

No se usa una fórmula inventada porque todavía no se validó un monto de
cartera gestionada a nivel deudor/cartera que preserve correctamente el grain.

El KPI V1 actual no depende de ese campo.

---

## 7. Calendario

`etl.usp_ensure_date_range` crea la base del calendario con:

- lunes-viernes como hábiles;
- fin de semana como no hábil.

Los feriados oficiales no se inventan dentro de este ETL. Se aplican mediante:

`database/analytics/013_portfolio_v1_peru_business_calendar.sql`

que mantiene `analytics.ref_business_holiday`, actualiza `is_holiday` /
`is_business_day` y recalcula los ordinales del mes.

Para 2026 el calendario V1 usa los 16 feriados nacionales del Perú. Antes de
exponer campañas de otro año se debe cargar y validar el calendario oficial de
ese año.

---

## 8. Ejecución inicial

Dentro de la base Analytics, ejecutar en orden:

```text
001_portfolio_v1_schema.sql
002_portfolio_v1_contract_views.sql
003_portfolio_v1_etl_support.sql
010_load_claro_portfolio_snapshot.sql
```

Después:

```sql
EXEC etl.usp_load_claro_portfolio_snapshot
    @crm_client_id = <ID CLIENTE CRM>,
    @client_code = 'CLARO',
    @client_name = 'CLARO',
    @snapshot_date = '2026-08-12',
    @campaign_year = 2026,
    @campaign_month = 8;
```

`@client_code` y `@client_name` son nombres canónicos del producto. Se pueden
ajustar a la denominación real usada por el CRM.

---

## 9. Resultado esperado del primer load

El resumen del procedimiento debe devolver:

```text
portfolios_loaded      29
assigned_clients       42904
managed_clients        37695
pending_clients         5209
contacted_clients       1139
assigned_amount         52634571.08
```

y los invariantes de validación deben devolver cero errores.

---

## 10. Qué sigue

Después de comprobar el snapshot:

**ETAPA 6 / Avance 2**

Carga intradía desde:

`aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos`

para:

- gestiones;
- RPC;
- asesor;
- promesas;
- PDP;
- pagos/recaudo;
- alertas `DUE_TODAY`.

La fuente se reprocesará con una ventana solapada para soportar cambios de
estado y pagos tardíos de forma idempotente.
