# Portfolio Control Center — ETAPA 5 / Avance 1

## Objetivo

Definir el **modelo físico mínimo** del Analytics DB para Portfolio Control
Center V1, usando CLARO como primera implementación sin convertir el modelo en
un diseño exclusivo para CLARO.

No se implementa todavía ETL ni API.

---

## Decisiones cerradas en ETAPA 4

### CLARO específico

- Campaña CLARO = año-mes.
- `PBI_CLARO_CORP_ADMINISTRATIVO` representa el snapshot de cartera/documentos.
- `NID_DOCXCOBRAR` se comporta como identificador físico de documento.
- `Deudor_unico` es único dentro de cartera, no globalmente dentro del mes.
- Cartera asignada = `SUM(Deudor_unico)`.
- Cartera gestionada = `Deudor_unico = 1 AND CANT_GEST_TOTAL > 0`.
- Pendiente = asignada - gestionada.
- EVOL es el agregado diario histórico.
- PROD contiene producción por asesor, pero para intradía se priorizará la
  fuente transversal GESTION-COB2.

### GESTION-COB2 transversal

Fuente:

`aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos`

La vista lee:

`aval_reporteria.dbo.rpt_gestiones_pagos_final`

Para CLARO se comprobó actualización durante el mismo día.

Campos principales:

- `cCli_Nombre`
- `cCar_Nombre`
- `nCampCar`
- `anio`
- `nombre_asesor`
- `cNombre_Cargo`
- `nId_PersDeudor`
- `nId_DocxCobrarOpe`
- `dDocCobOpe_FecIni`
- `indicador_equiv`
- `dFechCompromisoPago`
- `estado_pdp`
- `marca_promesa_valida`
- `montoPromesa`
- `total_pagado`
- `ultima_fecha_pago`

Estados PDP relevantes normalizados:

| Fuente | Analytics |
|---|---|
| Vigente | `ACTIVE` |
| Vence Hoy | `DUE_TODAY` |
| Cumplio | `FULFILLED` |
| Cumplio parcial | `PARTIAL` |
| Cumplio Fuera Rango | `FULFILLED_OUT_OF_RANGE` |
| Por Confirmar | `PENDING_CONFIRMATION` |
| Caido | `BROKEN` |
| No PdP y No Pagos | `NO_PROMISE_NO_PAYMENT` |

La numeración del texto fuente no forma parte de la regla de negocio.

`No PdP y No Pagos` **no se considera promesa válida**, aunque el campo
`montoPromesa` pueda contener valores. La carga debe usar
`marca_promesa_valida` y/o el estado normalizado.

---

## Arquitectura de datos V1

```text
Fuentes existentes
│
├── CLARO snapshot
│   └── PBI_CLARO_CORP_ADMINISTRATIVO
│
├── CLARO evolutivo T-1
│   └── PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL
│
├── Gestión transversal intradía
│   └── vw_bi_gerencia_gestiones_pagos
│
├── Metas CLARO
│   └── base-goals
│
└── Jerarquía CRM
    └── supervisor → asesor
          │
          ▼
     Analytics DB
          │
          ▼
     Analytics API
          │
          ▼
     React CRM
```

React nunca selecciona tablas de cliente ni contiene ramas del tipo
`if cliente == CLARO`.

---

## Modelo físico mínimo

### Dimensiones

- `analytics.dim_client`
- `analytics.dim_campaign`
- `analytics.dim_portfolio`
- `analytics.dim_advisor`
- `analytics.dim_supervisor`
- `analytics.bridge_supervisor_advisor`
- `analytics.dim_date`

### Referencia de calendario

- `analytics.ref_business_holiday`
  - feriados nacionales auditados;
  - V1 Perú 2026;
  - fuente y fecha de observación explícitas;
  - alimenta `dim_date.is_holiday` / `is_business_day`.

### Hechos

#### `analytics.fact_portfolio_daily`

Grain:

`fecha + cliente + campaña + cartera`

Separa explícitamente:

- **snapshot al corte**:
  - asignada
  - gestionada
  - pendiente
  - contactados
  - contacto directo
  - monto asignado
- **flujo del día**:
  - gestiones
  - nuevos gestionados
  - nuevos contactos directos
  - promesas
  - pagadores
  - recaudo

No se deben sumar snapshots entre fechas.

#### `analytics.fact_portfolio_evolution_daily`

Grain:

`fecha + cliente + campaña + cartera`

Conserva el estado histórico diario proveniente de CLARO EVOL:

- asignada;
- gestionada;
- pendiente derivada.

No duplica el recaudo legacy de EVOL. Las views de evolución combinan este
estado histórico con `fact_portfolio_daily.recovered_amount_day`, que sigue
siendo la fuente canonical de pagos/recaudo.

#### `analytics.fact_channel_daily`

Grain:

`fecha + cliente + campaña + cartera + canal`

Permite modelar CALL, IVR, SMS, EMAIL, WAPP, BOT, DISCARDOR y futuros canales
sin agregar columnas al esquema.

#### `analytics.fact_advisor_daily`

Grain:

`fecha + cliente + campaña + cartera + asesor`

Base de:

- productividad;
- RPC;
- conversión;
- promesas;
- recaudo;
- ranking de asesores.

La relación con supervisor no se copia como texto. Se resuelve mediante
`bridge_supervisor_advisor` con vigencia.

#### `analytics.fact_promise`

Grain inicial:

`operación/promesa`

Conserva:

- identificador fuente;
- deudor;
- fecha de gestión;
- vencimiento;
- monto prometido;
- monto pagado;
- estado fuente;
- estado normalizado;
- marca de promesa válida.

Esta tabla alimenta directamente:

- promesas que vencen hoy;
- promesas vigentes;
- caídas;
- cumplimiento;
- detalle PDP.

#### `analytics.fact_target_monthly`

Meta por campaña y, cuando exista, por cartera.

La curva esperada **no se persiste como 31 valores artificiales**.
Se calcula a partir de:

`meta mensual + dim_date + días hábiles`

En una V2 podrá reemplazarse por una curva histórica sin cambiar el contrato
principal.

---

## Estrategia de frescura

### Snapshot de cartera

Fuente CLARO materializada.

Carga menos frecuente. Define el universo asignado y sirve como base estable.

### Intradía

`vw_bi_gerencia_gestiones_pagos` ya contiene gestiones de CLARO del mismo día.

Se utilizará con reproceso solapado e idempotente para:

- gestiones;
- contactos;
- promesas;
- pagos/recaudo;
- alertas PDP;
- producción del asesor.

### Evolutivo

EVOL conserva el histórico diario y evita recalcular el pasado desde eventos
masivos.

---

## KPIs derivados por Analytics

No necesitan columnas físicas propias:

### Avance

`managed / assigned`

### Pendiente

`assigned - managed`

### Contactabilidad CLARO

`contacted / assigned`

### RPC

`direct contact / universo gestionado clasificable`

### Tasa de cierre

`deudores con promesa válida / deudores con contacto directo`

### Intensidad general

`management events / managed clients`

Los impactos por canal permanecen disponibles por separado en
`fact_channel_daily`.

### Cumplimiento de meta

`recaudo acumulado / meta mensual`

### Curva esperada V1

`meta mensual × días hábiles transcurridos / días hábiles del mes`

### Gap vs curva

`recaudo acumulado / esperado al corte - 1`

---

## Fuente oficial por bloque V1

| Bloque | Fuente inicial |
|---|---|
| Asignación / universo | CLARO snapshot |
| Gestionada / pendiente | snapshot + gestión transversal |
| Evolución histórica | CLARO EVOL |
| Gestión intradía | GESTION-COB2 |
| RPC | GESTION-COB2 |
| Promesas / PDP | GESTION-COB2 |
| Pagos / recaudo | GESTION-COB2 |
| Asesor | GESTION-COB2 / PROD |
| Supervisor | CRM |
| Metas | Goals CLARO |
| Curva esperada | Analytics |

---

## Qué NO se hace en este avance

- no se conecta React a SQL;
- no se crea endpoint;
- no se crea job;
- no se hace FULL sobre 80M;
- no se replica el PBIX;
- no se hardcodea CLARO en React;
- no se implementa todavía ETL.

El siguiente avance es **ETAPA 5 / Avance 2: consultas canónicas de lectura y
validación contra CLARO**, antes de comenzar ETAPA 6 (ETL incremental).
