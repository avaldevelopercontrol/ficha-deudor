# Portfolio V1 - ETL de evolución histórica CLARO

## Fuente

`aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL`

El diagnóstico físico de agosto 2026 confirmó:

- columna temporal real: `fecha` (`date`);
- cartera técnica: `nid_cartera`;
- grain: `fecha + nid_cartera`;
- 13 fechas observadas del 2026-08-01 al 2026-08-13;
- 29 carteras por fecha;
- 377 filas fuente en total.

`DAY NUMBER` es una columna semántica del modelo Power BI, no el nombre físico
SQL de esta fuente. Analytics deriva el día desde `fecha` cuando lo necesita.

## Grain Analytics

`analytics.fact_portfolio_evolution_daily` conserva:

`fecha + cliente + campaña + cartera`

La fact es deliberadamente distinta de `fact_portfolio_daily`.

`fact_portfolio_daily` combina snapshot operativo y flows LIVE. Una fila LIVE
puede existir sin snapshot real del día y contener carry-forward del último
snapshot conocido. Ese comportamiento es correcto para operación intradía,
pero no debe utilizarse como serie histórica de cartera.

## Métricas de estado

Para cada cartera/fecha EVOL:

- `TOTAL_CLIENTES` -> `assigned_clients`;
- `CLIENTE_GESTIONADO_NVO` -> incremento diario de clientes gestionados nuevos;
- `managed_clients` -> suma month-to-date de `CLIENTE_GESTIONADO_NVO` por `nid_cartera`;
- `pending_clients = assigned_clients - managed_clients`.

La ejecución real de agosto 2026 demostró que `CLIENTES_GESTIONADOS` directo no
representa el estado acumulado requerido por el gráfico: a nivel campaña podía
caer de `21,923` a `0` entre 05/08 y 06/08 y volver a valores parciales en días
posteriores. En cambio, el acumulado de `CLIENTE_GESTIONADO_NVO` reproduce la
serie monotónica del legado (`EVO QTY GESTIONES`) y alcanza `37,938` al
13/08/2026.

Por ello `CLIENTES_GESTIONADOS` se conserva únicamente como señal diagnóstica
del origen y no se materializa como `managed_clients` canonical de evolución.

## Recaudo de la evolución

EVOL también expone `MONTO_DE_PAGOS`, pero no se utiliza como recaudo canonical
del Portfolio Control Center.

En la validación del 2026-08-13 se observó:

- EVOL acumulado: `2,723,121.3556`;
- LIVE/GESTION-COB2: `2,667,904.8986`;
- diferencia: `55,216.4570`.

La definición canonical ya validada para recaudo Portfolio proviene de
GESTION-COB2 e incluye correctamente las filas sintéticas `Pago Sin Promesa`.
Por ello las views de evolución combinan:

- assigned/managed/pending históricos -> EVOL;
- `recovered_amount_day` -> `fact_portfolio_daily` (LIVE canonical);
- recovered acumulado -> suma de esos flows LIVE hasta cada fecha.

Esto evita que el gráfico introduzca una segunda definición de recaudo.

## Scope

El loader no crea carteras desde EVOL. Exige que `nid_cartera` ya exista en
`analytics.dim_portfolio`, que fue poblada desde el snapshot CLARO canonical.
De esta forma EVOL hereda el mismo scope de carteras y no amplía el cliente por
un filtro textual como `%CLARO%`.

## Carga

Procedimiento:

`etl.usp_load_claro_portfolio_evolution`

V1 reprocesa el mes completo. EVOL puede corregir días históricos y el volumen
mensual es pequeño respecto de la fuente transaccional masiva.

La carga:

1. valida fechas de campaña;
2. exige una fila por `fecha + nid_cartera`;
3. exige mapping completo a `dim_portfolio`;
4. valida que `CLIENTE_GESTIONADO_NVO` no sea negativo y que su acumulado cumpla `0 <= managed <= assigned`;
5. upserta el grain mensual;
6. elimina filas desaparecidas de EVOL dentro de la campaña;
7. actualiza `CLARO_EVOLUTION_DAILY`;
8. hace commit en una única transacción.

## Contratos de lectura

`analytics.v_portfolio_evolution_daily`

- serie por cartera;
- permite `subPortfolioId` para filtrar la subcartera (`portfolio_key`);
- incluye recaudo canonical acumulado.

`analytics.v_campaign_evolution_daily`

- agrega las carteras de la campaña por fecha;
- incluye recaudo canonical acumulado de campaña.

La futura API puede mapear estas views directamente al contrato
`PortfolioEvolutionPoint` sin consultar tablas legacy.
