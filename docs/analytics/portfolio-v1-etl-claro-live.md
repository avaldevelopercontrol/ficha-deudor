# Portfolio Control Center — ETAPA 6 / Avance 2

## 1. Objetivo

Incorporar la operación intradía de CLARO sin tocar todavía asesor/supervisor.

Fuente:

`aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos`

Se carga:

- gestiones;
- contactos `CD / CI / NC`;
- nuevos gestionados;
- nuevos contactos directos;
- promesas;
- PDP;
- pagadores;
- recaudo;
- grain `fecha + cartera + deudor` de pagadores Portfolio para distinct exacto
  multi-día.

---

## 2. Por qué se agrega fact_debtor_contact_daily

RPC no puede calcularse correctamente con:

`SUM(CD) / SUM(CD + CI + NC)`

si una persona tuvo múltiples gestiones.

La definición validada exige un grain lógico:

`cartera + deudor`

Por eso se conserva a nivel:

`fecha + cliente + campaña + cartera + deudor`

con tres flags:

- `had_direct_contact`;
- `had_indirect_contact`;
- `had_no_contact`.

Para un rango, el API podrá volver a deduplicar
`portfolio_key + source_debtor_id`.

---

## 3. Estrategia de reproceso

No se usa un incremental ciego del tipo:

`WHERE id > último_id`

para los resultados monetarios/PDP.

Motivo:

- una promesa puede cambiar de estado;
- `total_pagado` puede actualizarse después de la gestión original;
- una promesa puede pasar a cumplida o caída.

Para CLARO V1 el volumen de la vista ya materializada es pequeño, por lo que el
ETL reprocesa **mes actual completo hasta el momento de ejecución**.

Eso mantiene el proceso simple e idempotente y sigue evitando consultar los
80M+ registros transaccionales.

---

## 4. Semántica temporal del recaudo

Para preservar el comportamiento de GESTION-COB2:

`recovered_amount_day = SUM(total_pagado)`

bajo el día de:

`dDocCobOpe_FecIni`

Es decir, el pago se mantiene asociado al grain temporal con el que el BI
actual lo analiza.

Como `total_pagado` puede modificarse posteriormente, el full-reprocess del
mes corrige retrospectivamente esos días.

No se inventa un movimiento de pago usando únicamente
`ultima_fecha_pago`, porque esa columna no demuestra por sí sola el grain de
cada transacción individual.

---

## 5. Promesas

`fact_promise` usa:

`client_key + source_operation_id`

para idempotencia.

`source_operation_id` viene de:

`nId_DocxCobrarOpe`.

Si una fila promise-like no expone ese ID, el ETL falla deliberadamente.
No se construyen claves artificiales con nombre + fecha + texto.

Estados normalizados:

- `ACTIVE`
- `DUE_TODAY`
- `FULFILLED`
- `PARTIAL`
- `FULFILLED_OUT_OF_RANGE`
- `PENDING_CONFIRMATION`
- `BROKEN`
- `NO_PROMISE_NO_PAYMENT`
- `UNKNOWN`

Promesa válida:

- `marca_promesa_valida = 1`;
- `montoPromesa > 0`;
- estado diferente de `No PdP`.

---

## 6. Snapshot T-1 + operación live

El 12/08 ya existe:

`fact_portfolio_daily(snapshot)`

Cuando el ETL live corre el 13/08:

1. crea la fila del 13/08 si falta;
2. hereda el último snapshot conocido del 12/08;
3. carga encima únicamente flows del 13/08.

Así el producto puede mostrar:

`cartera conocida T-1 + actividad del día`

sin presentar la cartera como cero.

`source_as_of_at` sigue representando la fecha del snapshot heredado.

La fila creada por LIVE queda con:

`has_source_snapshot = 0`

porque no hubo un snapshot observado para ese `date_key`. Si después se carga
el snapshot real de esa fecha, `etl.usp_load_claro_portfolio_snapshot` actualiza
la misma fila a `has_source_snapshot = 1` sin borrar los flows ya cargados.

---

## 7. Pagadores exactos en rangos

`fact_portfolio_daily.payers_count_day` se mantiene como KPI diario, pero no se
suma para obtener pagadores únicos de varios días. El ETL live persiste además:

`analytics.fact_debtor_payment_daily`

con grain:

`fecha + cartera + deudor`

La presencia de una fila significa `total_pagado > 0` en GESTION-COB2. Se
incluyen las filas `Pago Sin Promesa`, ya que forman parte del recaudo y de los
pagadores Portfolio aunque se excluyan de gestión, contacto y `fact_promise`.

Para un rango se reagrupa a `cartera + deudor` y se cuenta una sola vez cada
combinación. El detalle se reprocesa month-to-date junto con el resto del live,
por lo que altas, bajas o correcciones de pago quedan idempotentes.

---

## 8. Advisor se posterga deliberadamente

GESTION-COB2 entrega:

`nombre_asesor`

pero no entrega un identificador estable como DNI.

No se hará:

`source_advisor_id = nombre_asesor`.

Eso introduciría problemas por:

- cambios de nombre;
- tildes/espacios;
- homónimos;
- correcciones manuales.

El siguiente avance resolverá el asesor contra una fuente maestra con ID
estable y recién entonces poblará:

- `dim_advisor`;
- `fact_advisor_daily`;
- jerarquía supervisor → asesor.

---

## 9. Ejecución

En Analytics:

```text
004_portfolio_v1_live_support.sql
etl/020_load_claro_live_operations.sql
```

Después:

```sql
EXEC etl.usp_load_claro_live_operations
    @crm_client_id = 95;
```

El procedimiento toma por defecto:

- fecha/hora actual;
- campaña del mes actual;
- fuente `CLARO CORPORATIVO`.

No incluye CLARO GOBIERNO.

---

## 10. Validación

Ejecutar:

`validation/claro_live_etl_validation.sql`

La comparación debe hacerse contra la **fuente actual**.

No contra los números obtenidos a las 11:31, porque durante el día continúan
entrando gestiones, promesas y pagos.

Deben cuadrar:

- source rows / management events;
- classifiable pairs;
- direct contact pairs;
- RPC;
- promesas válidas;
- monto promesas;
- recaudo;
- PDP normalizado.

---

## 11. Siguiente avance

ETAPA 6 / Avance 3:

**identidad estable de asesor + supervisor**

Objetivo:

- resolver DNI/código de asesor;
- poblar `dim_advisor`;
- cargar `fact_advisor_daily`;
- obtener la relación supervisor → asesor desde la fuente maestra CRM;
- conservar vigencia histórica.
