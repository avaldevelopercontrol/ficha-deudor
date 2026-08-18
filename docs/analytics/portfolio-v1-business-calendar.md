# Portfolio Control Center — Calendario hábil Perú V1

## Objetivo

La curva esperada del Portfolio Control Center se calcula en Analytics:

```text
expected_to_date = monthly_target
                 * elapsed_business_days
                 / total_business_days
```

Por ello `analytics.dim_date.is_business_day` debe representar el calendario
laboral real y no únicamente lunes-viernes.

## Fuente V1

Para 2026 se usa el calendario de **feriados nacionales del Perú**, aplicable a
sector público y privado.

Referencia operativa:

`https://www.gob.pe/feriados`

El seed 2026 fue contrastado el 2026-08-14 con publicaciones oficiales vigentes
de El Peruano / Andina que confirman 16 feriados nacionales durante 2026.

No se cargan como feriados los días no laborables compensables exclusivos del
sector público. Por ejemplo, un día no laborable decretado solo para el sector
público no cambia `is_business_day` del calendario V1 de la operación privada.

## Objetos

### `analytics.ref_business_holiday`

Referencia auditada de feriados nacionales.

Campos principales:

- `holiday_date`;
- `holiday_name`;
- `country_code`;
- `holiday_scope`;
- `source_code`;
- `source_reference`;
- `source_as_of_at`.

### `etl.usp_apply_peru_business_calendar`

Para el rango solicitado:

1. asegura las fechas de los meses completos en `dim_date`;
2. restablece lunes-viernes como hábiles y fin de semana como no hábil;
3. marca los feriados nacionales de la referencia como `is_holiday = 1`;
4. marca esos feriados como `is_business_day = 0`;
5. recalcula `business_day_of_month` y `business_days_in_month`.

El procedimiento es idempotente.

## Agosto 2026

El 6 de agosto, Batalla de Junín, es feriado nacional. El 30 de agosto, Santa
Rosa de Lima, cae domingo.

Por tanto agosto 2026 queda con:

```text
total_business_days = 20
elapsed_business_days al 2026-08-13 = 8
```

La curva ya no debe usar 21 y 9 respectivamente.

## Regla para años posteriores

El seed incluido cubre 2026. Antes de exponer una campaña de otro año en
producción, debe cargarse y validarse el calendario oficial correspondiente.

No se debe inferir automáticamente un calendario futuro ni mantener
lunes-viernes como aproximación silenciosa para una curva presentada como
oficial.

## Ejecución

En `aval_analytics`:

```text
1. database/analytics/013_portfolio_v1_peru_business_calendar.sql
2. database/analytics/validation/claro_business_calendar_validation.sql
```

El segundo script debe finalizar con:

```text
holiday_rows_2026                = 16
holiday_dim_mismatches           = 0
calendar_rule_mismatches         = 0
august_business_days             = 20
elapsed_business_days_to_2026_08_13 = 8
curve_calendar_differences       = 0
idempotence_differences          = 0
assessment                       = OK
```
