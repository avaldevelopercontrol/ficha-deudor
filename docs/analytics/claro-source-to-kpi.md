# Portfolio Control Center - CLARO Source to KPI

## Estado del análisis

Este documento actualiza el mapeo Source -> KPI del Portfolio Control Center para CLARO a partir del proyecto Power BI (`.pbip`) de `BI_claro` y del análisis previo de `GESTION-COB2`.

La extracción del PBIP permite confirmar fórmulas DAX, transformaciones Power Query/M, relaciones del modelo y orígenes físicos de las principales tablas lógicas de CLARO. Aún no se diseña el Analytics DB: primero se debe inspeccionar la definición SQL y el grain de los objetos físicos identificados.

## Fuentes físicas confirmadas de BI_claro

### SQL Server / base `aval_reporteria`

| Tabla semántica | Objeto físico utilizado por Power Query |
|---|---|
| `dbEffectiveness` | `dbo.PBI_CLARO_CORP_ADMINISTRATIVO` |
| `dbIntensity` | `dbo.PBI_CLARO_CORP_ADMINISTRATIVO` |
| `dbEvolutionary` | `dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL` |
| `dbProduction` | `dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_PROD` |

El PBIP conecta estos objetos mediante `Sql.Database(..., "aval_reporteria")`. Para la arquitectura Analytics no se debe copiar la dirección del servidor del PBIX al código: la conexión será configuración segura de infraestructura.

### Fuentes auxiliares actuales

| Tabla semántica | Fuente actual |
|---|---|
| `dbGoals` | Excel `base-goals.xlsx`, tabla `baseGoals`, almacenado actualmente en SharePoint |
| `dbUsers` | Excel `base-users-claro.xlsx`, tabla `users.claro.corp`, almacenado actualmente en SharePoint |

Para producción, metas y jerarquías/usuarios no deberían depender de archivos Excel si existe una fuente maestra de CRM. Se debe evaluar migrarlas o sincronizarlas a una fuente gobernada por Analytics.

## Definiciones confirmadas por el modelo actual de CLARO

### 1. Cartera asignada - cantidad

Power Query crea `CLIENTE UNICO`:

```text
CLIENTE UNICO = 1 cuando Deudor_unico = 1
```

DAX:

```text
QTY CLIENTES = SUM(CLIENTE UNICO)
```

**Definición canónica CLARO V1:** cantidad de clientes/deudores únicos pertenecientes a la asignación seleccionada.

### 2. Cartera gestionada

Power Query crea:

```text
CLIENTE GESTIONADO = 1
cuando CLIENTE UNICO = 1
  y CANT_GEST_TOTAL > 0
```

DAX:

```text
QTY CLIENTES GESTIONADOS = SUM(CLIENTE GESTIONADO)
```

Por tanto, la definición que se había dejado provisional queda confirmada para CLARO:

> Cartera gestionada = clientes únicos de la cartera asignada con al menos una gestión registrada.

### 3. Cartera pendiente

No necesita existir físicamente:

```text
Cartera pendiente = Cartera asignada - Cartera gestionada
```

### 4. Cobertura / avance de cartera

DAX actual:

```text
% COBERTURA = QTY CLIENTES GESTIONADOS / QTY CLIENTES
```

Esto equivale a:

```text
cartera gestionada / cartera asignada
```

### 5. Monto asignado

La medida principal actual es:

```text
S/. ASIGNACIÓN = SUM(IMPORTE_ASIGNADO_SOLES)
```

Se debe usar la versión normalizada a soles para el Portfolio CLARO salvo que en Analytics se defina soporte multimoneda explícito.

### 6. Contactabilidad

Power Query marca `CLIENTE CONTACTADO = 1` cuando:

```text
CLIENTE UNICO = 1
AND MEJOR_RPTA_EQUIV_tipocontacto_gruponv1 = "CONTACTO"
```

DAX actual:

```text
QTY CONTACTADOS = SUM(CLIENTE CONTACTADO)
% CONTACTABILIDAD = QTY CONTACTADOS / QTY CLIENTES
```

**Importante:** en `BI_claro`, el denominador de contactabilidad es la cartera asignada (`QTY CLIENTES`), no la cartera gestionada. Analytics debe preservar inicialmente esta definición para no producir cifras distintas al BI oficial.

Si el negocio requiere en el futuro `contactados / gestionados`, debe exponerse como otra métrica y no cambiar silenciosamente la definición existente.

### 7. RPC / contacto directo

Power Query crea `CLIENTE CON CONTACTO DIRECTO = 1` cuando:

```text
CLIENTE UNICO = 1
AND MEJOR_RPTA_EQUIV_indicador = "CD"
```

Esto proporciona la regla de CLARO para el contacto directo/titular que utilizaremos como candidato de RPC. Antes de unificar clientes, se debe contrastar con la clasificación `CD/CI/NC/CT` de `GESTION-COB2`.

### 8. Promesa / PDP

Power Query deriva `RG RESPUESTA` desde la mejor respuesta y marca:

```text
CLIENTE CON PROMESA = 1
cuando CLIENTE UNICO = 1
  y RG RESPUESTA = "PROMESA DE PAGO"
```

DAX:

```text
QTY PDP = SUM(CLIENTE CON PROMESA)
QTY CLIENTES CON PDP = SUM(CLIENTE CON PROMESA)
S/. PROMESAS = SUM(S/. PROMESAS)
```

El monto de promesa se deriva de `MEJOR_MONTO_COMPROMISO` para los clientes clasificados como promesa.

### 9. Tasa de cierre

La fórmula DAX oficial del BI CLARO queda confirmada:

```text
% TASA CIERRE = QTY CLIENTES CON PDP / QTY CONTACTADOS
```

Es decir:

```text
clientes con promesa / clientes contactados
```

### 10. Cumplimiento de promesa

Power Query considera una promesa cumplida cuando:

```text
CLIENTE UNICO = 1
AND RG RESPUESTA = "PROMESA DE PAGO"
AND PAGOS > 0
```

DAX:

```text
% CUMPLIMIENTO = QTY PDP CUMPLIDAS / QTY PDP
```

**Riesgo funcional:** la lógica actual considera cumplida una PDP por la existencia de `PAGOS > 0`; no demuestra por sí sola atribución entre promesa y pago ni cumplimiento completo del monto prometido. Antes de convertirla en regla canónica multicliente debe validarse con `GESTION-COB2`/fuente transaccional.

### 11. Pagos y recaudo

Power Query marca:

```text
CLIENTE CON PAGO = 1
cuando CLIENTE UNICO = 1
  y PAGOS > 0
```

Medidas principales:

```text
QTY CLIENTES CON PAGO = SUM(CLIENTE CON PAGO)
S/. PAGOS = SUM(PAGOS_SOLES_CLARO)
```

Por tanto hay que mantener separados:

- cantidad de clientes que pagaron;
- cantidad de transacciones de pago (no está representada por esta medida);
- monto recuperado/recaudo.

### 12. Producción del asesor

`dbProduction` proviene de `dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_PROD` y expone:

- `DNI_ASESOR`
- `FECHA_GESTION`
- `HORA_GESTION`
- `FORMA_GESTION`
- `TIPO_CONTACTO`
- `GESTION_UNICA`
- `CLIENTE_UNICO`
- `PROMESA_DE_PAGO`
- `FECHA_PROMESA`
- `MONTO_PROMESA`

DAX:

```text
PROD QTY GESTIONES = SUM(GESTION_UNICA)
PROD QTY CONTACTOS DIRECTOS = SUM(GESTION_UNICA) filtrando TIPO_CONTACTO = "CONTACTO DIRECTO"
PROD % CONTACTABILIDAD = CONTACTOS DIRECTOS / GESTIONES
PROD QTY PROMESAS = SUM(PROMESA_DE_PAGO)
PROD % CONVERSIÓN PROMESAS = PROMESAS / CONTACTOS DIRECTOS
```

**Importante:** esta contactabilidad de producción es una métrica distinta de `% CONTACTABILIDAD` de cartera. No deben mezclarse bajo el mismo nombre sin definir el contexto.

### 13. Intensidad

`dbIntensity` reutiliza `dbo.PBI_CLARO_CORP_ADMINISTRATIVO`, selecciona los contadores por canal:

```text
CALL
DISC
EMAIL
SMS
IVR
WAPP
BOT
```

los convierte a filas y el DAX actual calcula:

```text
AVG GESTIÓN MASIVA = AVERAGE(dbIntensity[Value])
```

Por tanto, **la medida oficial actual de intensidad del BI no es `gestiones / cartera gestionada`**.

Para el producto multicliente tendremos que decidir entre:

1. conservar `AVG GESTIÓN MASIVA` como KPI específico de canales masivos CLARO; o
2. definir una intensidad canónica transversal (`gestiones / unidades gestionadas`) y mantener la primera como detalle de canal.

No se debe sustituir una por otra sin validación funcional.

### 14. Evolución

`dbEvolutionary` proviene de:

```text
dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL
```

y aporta por día/campaña, entre otros, los campos físicos de métricas:

- `TOTAL_CLIENTES`
- `CLIENTE_GESTIONADO_NVO`
- `CLIENTE_GESTIONADO_CALL_NVO`
- `CLIENTES_CON_PAGOS`
- `MONTO_DE_PAGOS`
- `CLIENTE_CON_PROMESA_NVO`
- `MONTO_EN_PROMESAS`
- `CLIENTE_CON_CONTACTO_DIRECTO_NVO`
- `CampAval`
- `AñoAval`

El modelo Power BI expone además el concepto `DAY NUMBER` para los acumulados DAX. La inspección física de agosto 2026 confirmó que **`[DAY NUMBER]` no es una columna SQL de EVOL**: la columna temporal real es `fecha` (`date`) y el número de día se deriva de ella. También se confirmó `nid_cartera` como identificador técnico de cartera y un grain físico `fecha + nid_cartera` (29 carteras por cada una de las 13 fechas observadas).

El DAX hace acumulados usando ese `DAY NUMBER` semántico derivado de `fecha`.

Ejemplo:

```text
EVO S/. PAGOS = acumulado de MONTO_DE_PAGOS hasta DAY NUMBER actual
```

**Advertencia semántica:** `EVO QTY GESTIONES` suma `CLIENTE_GESTIONADO_NVO`. La validación física de agosto 2026 confirmó que ese acumulado es la semántica adecuada para `managed_clients` histórico del gráfico: el campo físico `CLIENTES_GESTIONADOS` no es acumulado estable y presenta caídas entre fechas. Esto no convierte `CLIENTE_GESTIONADO_NVO` en cantidad de eventos; para el KPI `Gestiones` del Control Center se mantiene la fuente de eventos `GESTION-COB2`.

## Campaña CLARO confirmada como mes operativo

El Power Query deriva las etiquetas de campaña desde `CampAval`, cuyo sufijo `01..12` se transforma a `ENERO..DICIEMBRE`.

También construye:

```text
DATE ORDER = AñoAval + mes(CampAval)
NRO ASIGNACION = "[ASIGNACIÓN MM]"
```

Esto respalda la regla funcional acordada:

> Para CLARO, la campaña del Portfolio Control Center se representa por el mes operativo (año-mes).

En Analytics se debe usar una clave estable tipo `YYYY-MM`, no el texto `[ASIGNACIÓN MM]`.

## Metas: fórmula y riesgo detectado

`dbGoals` se carga actualmente desde `base-goals.xlsx` y expone:

- `CARTERA`
- `ASIGNACIÓN`
- `AÑO`
- `META_PAGOS`
- `META_EFECTIVIDAD`

DAX:

```text
GOAL PAGOS S/. = SUM(dbGoals[META_PAGOS]) filtrando CARTERA = "CLARO"
GOAL EFECTIVIDAD % = GOAL PAGOS S/. / ASIGNACIÓN S/.
```

La relación del modelo es:

```text
dbEffectiveness.NRO ASIGNACION <-> dbGoals.ASIGNACIÓN
```

con filtro bidireccional.

### Riesgo de diseño resuelto para Analytics V1

`NRO ASIGNACION` se genera solo con el número de mes (`[ASIGNACIÓN 08]`) mientras `dbGoals` también contiene `AÑO`, pero el modelo legacy no relaciona explícitamente el año.

La validación posterior del archivo vigente resolvió esta ambigüedad para V1:
`base-goals.xlsx` se mantiene como un catálogo de **una meta vigente por cartera** y las mismas metas se reutilizan para las campañas actuales aunque la fila fuente conserve `AÑO = 2025` y `ASIGNACIÓN = [ASIGNACIÓN 01]`.

Por tanto, Analytics no deriva `campaign_code` desde `dbGoals.AÑO/ASIGNACIÓN`. El adaptador:

```text
CARTERA = CLARO
        ↓
META_PAGOS vigente del archivo
        ↓
campaign_code solicitado (YYYY-MM)
```

`AÑO` y `ASIGNACIÓN` quedan como trazabilidad de la fuente. Si el archivo incorpora múltiples filas vigentes para CLARO en el futuro, debe validarse una nueva regla de selección antes de automatizarla.

## Curva esperada

No existe en el PBIP una medida DAX explícita de curva/meta esperada acumulada durante el mes.

Sí tenemos:

- meta mensual (`META_PAGOS`);
- evolución real diaria (`dbEvolutionary`);
- número de día semántico (`DAY NUMBER`), derivado en el modelo a partir del campo temporal físico de EVOL;
- históricos potencialmente reutilizables.

Para V1 se mantiene la regla acordada:

```text
expected_to_date = monthly_target * elapsed_business_days / total_business_days

gap_amount = recovered_to_date - expected_to_date

gap_rate = recovered_to_date / expected_to_date - 1
```

Esta lógica debe vivir en Analytics, no en React.

En V2 se puede construir una curva histórica normalizada por día operativo a partir de `dbEvolutionary`, si las campañas históricas tienen calidad suficiente.

## Usuarios y jerarquía

`dbUsers` proviene actualmente de `base-users-claro.xlsx` y contiene únicamente:

- `NOMBRES`
- `DNI`
- `USU_PERFIL`

La relación con producción es:

```text
dbProduction.DNI_ASESOR -> dbUsers.DNI
```

Este PBIP **no contiene una relación estructurada supervisor -> asesor**. La jerarquía que el negocio confirmó debe obtenerse de la fuente maestra del CRM o de la fuente transversal correspondiente, con IDs estables y, si existe, vigencia temporal.

## Source -> KPI actualizado

| KPI / dimensión | Fuente física/logical | Fórmula/regla confirmada | Estado |
|---|---|---|---|
| Cartera asignada | `dbo.PBI_CLARO_CORP_ADMINISTRATIVO` | `SUM(CLIENTE UNICO)`, con `Deudor_unico = 1` | Confirmado en PBIP |
| Monto asignado | mismo objeto | `SUM(IMPORTE_ASIGNADO_SOLES)` | Confirmado |
| Cartera gestionada | mismo objeto | cliente único y `CANT_GEST_TOTAL > 0` | Confirmado |
| Cartera pendiente | derivado | asignada - gestionada | Confirmado |
| % avance/cobertura | mismo objeto | gestionada / asignada | Confirmado |
| Gestiones | PROD / fuente transversal | `SUM(GESTION_UNICA)` como candidato de eventos | Grain SQL pendiente |
| Intensidad CLARO actual | mismo objeto + `dbIntensity` | promedio de contadores por canal | Confirmado; definición canónica pendiente |
| Contactabilidad cartera | mismo objeto | contactados / asignados | Confirmado |
| RPC/contacto directo | mismo objeto | indicador `CD` sobre cliente único | Confirmado para CLARO; normalización pendiente |
| Tasa de cierre | mismo objeto | clientes con PDP / contactados | Confirmado |
| Promesas | mismo objeto | respuesta `PROMESA DE PAGO` | Confirmado |
| Monto promesas | mismo objeto | `MEJOR_MONTO_COMPROMISO` en PDP | Confirmado |
| Cumplimiento PDP | mismo objeto | PDP con `PAGOS > 0` / PDP | Confirmado como lógica actual; validar negocio |
| Pagadores | mismo objeto | clientes únicos con `PAGOS > 0` | Confirmado |
| Recaudo | mismo objeto | `SUM(PAGOS_SOLES_CLARO)` | Confirmado |
| Evolución diaria | `..._EVOL` | grain físico `fecha + nid_cartera`; `TOTAL_CLIENTES` como asignados y acumulado MTD de `CLIENTE_GESTIONADO_NVO` como gestionados; `CLIENTES_GESTIONADOS` queda solo como diagnóstico legacy; `DAY NUMBER` se deriva de `fecha` | Confirmado físicamente |
| Producción asesor | `..._PROD` | gestiones/contactos/promesas por `DNI_ASESOR` | Confirmado; grain pendiente |
| Meta mensual | SharePoint `base-goals.xlsx` | `SUM(META_PAGOS)` | Confirmado; fuente debe gobernarse |
| Campaña CLARO | `CampAval`, `AñoAval` | año-mes operativo | Confirmado |
| Asesor | PROD + `base-users-claro.xlsx` | `DNI_ASESOR -> DNI` | Confirmado |
| Supervisor -> asesor | CRM / fuente maestra | relación informada por negocio | Fuente física pendiente |
| Promesas vencen hoy | `GESTION-COB2` / fuente transaccional | fecha compromiso + estado + pago | Regla física pendiente |

## Relaciones relevantes del modelo

El PBIP confirma:

```text
dbIntensity.ID_PBI -> dbEffectiveness.ID_PBI

dbEffectiveness.NRO ASIGNACION <-> dbGoals.ASIGNACIÓN

dbProduction.DNI_ASESOR <-> dbUsers.DNI
```

Las restantes relaciones son principalmente tablas de fecha automáticas de Power BI. Para Analytics no se recomienda reproducir las múltiples `LocalDateTable`; se diseñará una dimensión/calendario común cuando corresponda.

## Hallazgos de arquitectura que afectan al futuro Analytics

1. `BI_claro` ya consume objetos de reportería dedicados. Debemos inspeccionar su SQL antes de volver a consultar las tablas transaccionales desde cero.
2. Parte de la lógica de negocio está repartida entre SQL, Power Query y DAX. Analytics deberá centralizarla para que React y Power BI compartan una misma definición.
3. Metas y usuarios dependen hoy de Excel/SharePoint. Para un producto mantenible deben evaluarse fuentes maestras o tablas de configuración controladas.
4. Existen métricas con nombres parecidos pero distinto denominador (`% CONTACTABILIDAD` de cartera vs `PROD % CONTACTABILIDAD`). Deben conservar nombres/contratos inequívocos.
5. La evolución contiene métricas cuyo nombre puede inducir a error (`EVO QTY GESTIONES`); no se reutilizarán sin validar grain y semántica.
6. El modelo actual relaciona metas por una etiqueta mensual sin año explícito en la relación. Analytics debe usar una clave de campaña año-mes sin ambigüedad.

## Siguiente información necesaria

Ya no se necesita pedir la estructura completa de la BD. El siguiente paso es inspeccionar solamente estos objetos SQL de `aval_reporteria`:

```text
dbo.PBI_CLARO_CORP_ADMINISTRATIVO
dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL
dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_PROD
```

Para cada uno necesitamos:

- tipo de objeto (tabla/vista);
- definición SQL si es vista;
- tablas/SP subyacentes;
- columnas y tipos;
- grain real;
- claves/campos identificadores;
- fechas disponibles para incrementalidad;
- volumen aproximado;
- índices de tablas físicas involucradas.

Después se analizará la fuente física de `GESTION-COB2` para PDP/vencimientos, RPC transversal y jerarquía supervisor/asesor.

## Criterio de cierre de Etapa 4

La Etapa 4 podrá cerrarse cuando los KPIs V1 tengan:

```text
KPI
 -> fórmula canónica
 -> objeto físico fuente
 -> columnas
 -> grain
 -> fecha de corte
 -> estrategia incremental candidata
```

Sin esos elementos todavía no corresponde diseñar las facts/agregados del Analytics DB.
