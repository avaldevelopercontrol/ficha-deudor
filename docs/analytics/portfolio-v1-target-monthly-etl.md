# Portfolio Control Center — ETAPA 6 / Avance 4 — Meta mensual CLARO

## Objetivo

Cargar la meta mensual real utilizada por Portfolio Control Center sin llevar
la lógica de `base-goals.xlsx` a React ni hacer que la API conozca SharePoint.

La fuente validada es `base-goals.xlsx` (`baseGoals`) con las columnas:

- `CARTERA`;
- `ASIGNACIÓN`;
- `AÑO`;
- `META_PAGOS`;
- `META_EFECTIVIDAD`.

Para V1 la regla canonical validada es:

- `base-goals.xlsx` es el catálogo vigente de metas por cartera;
- `CARTERA = CLARO`;
- debe existir una única fila CLARO con `META_PAGOS` válida en el snapshot actual del archivo;
- `AÑO` y `ASIGNACIÓN` se conservan como metadata de la fila fuente, pero **no** determinan la campaña Analytics destino;
- la campaña destino la define `--campaign` (`YYYY-MM`);
- `target_recovered_amount = META_PAGOS` de la fila vigente de CLARO y se reutiliza para todas las campañas mientras el archivo fuente mantenga esa meta.

`META_EFECTIVIDAD` no se persiste todavía como regla canonical porque el
producto define cumplimiento y ritmo a partir de la meta monetaria.

## Flujo

```text
base-goals.xlsx
    ↓
export_claro_goals_snapshot_sql.py
    ↓
SQL autocontenido
    ↓
staging.claro_goal_monthly
    ↓
etl.usp_load_claro_target_monthly
    ↓
analytics.fact_target_monthly
    ↓
analytics.v_campaign_target_progress
```

El exportador acepta un archivo descargado de SharePoint. El acceso directo a
SharePoint no se mezcla con el ETL Analytics en este avance.

La fila actualmente validada puede conservar `AÑO = 2025` y
`ASIGNACIÓN = [ASIGNACIÓN 01]` aun cuando se cargue, por ejemplo, la campaña
`2026-08`. Esos campos describen el registro fuente; no se usan para rechazar
la meta vigente ni para cambiar el `campaign_code` solicitado. El monto nunca
se hardcodea: siempre se lee del Excel actual.

## Grain

`staging.claro_goal_monthly`:

`source_code + campaign_code`

`analytics.fact_target_monthly` para esta carga:

`cliente + campaña`, con `portfolio_key IS NULL`.

No se atribuye la meta completa a supervisor, asesor ni cartera individual.

## Ejecución

Instalar dependencias:

```bash
pip install -r scripts/analytics/requirements.txt
```

Generar el SQL:

```bash
python scripts/analytics/export_claro_goals_snapshot_sql.py \
  --input /ruta/base-goals.xlsx \
  --campaign 2026-08
```

El script busca primero la tabla Excel `baseGoals`. Si no existe como tabla
estructurada, busca una hoja que contenga los encabezados requeridos.

Para `CARTERA = CLARO` exige exactamente una fila con `META_PAGOS` válida. Si
el archivo llegara a contener varias filas CLARO, aborta por ambigüedad en vez
de sumarlas o elegir una silenciosamente; esa situación requerirá validar una
nueva regla de vigencia antes de cambiar el adaptador.

Después ejecutar en `aval_analytics`:

1. `database/analytics/011_portfolio_v1_claro_target_support.sql`;
2. el `/tmp/claro_goal_snapshot_2026-08.sql` generado;
3. `database/analytics/validation/claro_target_monthly_etl_validation.sql`.

## Curva esperada

La meta cargada alimenta `analytics.v_campaign_target_progress`:

```text
expected_to_date = monthly_target
                 * elapsed_business_days
                 / total_business_days
```

```text
gap_amount = recovered_to_date - expected_to_date
```

```text
gap_rate = recovered_to_date / expected_to_date - 1
```

El calendario de días hábiles pertenece a `analytics.dim_date`, nunca a React.
Para 2026 debe aplicarse previamente
`013_portfolio_v1_peru_business_calendar.sql`, que excluye los feriados
nacionales del Perú y recalcula los ordinales hábiles del mes.

## Idempotencia

El mismo stage puede procesarse varias veces. El loader hace `UPDATE/INSERT`
sobre la única meta campaña-level y mantiene un watermark independiente:

`CLARO_TARGET_MONTHLY`.

## Alcance deliberadamente fuera

- no acceso directo a SharePoint;
- no meta por supervisor;
- no meta por asesor;
- no meta por cartera sin una regla de asignación validada;
- no uso de `META_EFECTIVIDAD` como regla canonical;
- no cambios en React ni API.
