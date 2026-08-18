# Portfolio Control Center — Gate de cierre ETAPA 6

## Objetivo

Consolidar en una sola validación read-only los prerrequisitos funcionales que
Analytics debe cumplir antes de iniciar la API del Portfolio Control Center.

Archivo:

`database/analytics/validation/portfolio_v1_stage6_readiness_validation.sql`

## Qué valida

El gate comprueba:

- dimensiones, facts, views y procedimientos requeridos;
- watermarks funcionales de snapshot, LIVE, advisor, supervisor, targets y EVOL;
- existencia de snapshot real y flows LIVE;
- grains exactos multi-día de contacto y pagadores Portfolio;
- promesas válidas y soporte de advisor;
- grains exactos multi-día de advisor;
- jerarquía supervisor sin periodos solapados;
- meta campaign-level y curva esperada;
- evolución histórica materializada;
- calendario Perú 2026 con feriados nacionales aplicados;
- guardrails que impiden exponer cartera/meta/contactabilidad no soportadas a
  nivel advisor o supervisor.

No sustituye las validaciones detalladas de cada ETL. Su propósito es funcionar
como **gate consolidado de salida** después de que esas validaciones ya fueron
ejecutadas durante el desarrollo.

## Qué no bloquea el gate funcional

El scheduling automático del transporte:

`192.168.100.45 / aval_cob -> 172.23.1.180 / aval_analytics`

permanece como deuda operativa de infraestructura mientras no exista un runtime
que alcance ambas instancias. El modelo, staging, jerarquía y runner están
implementados y validados con transporte manual.

Por eso el resultado final separa:

- `functional_assessment`;
- `operational_note`.

La ETAPA 7 puede iniciarse cuando `functional_assessment = OK`, manteniendo el
scheduling como deuda operativa explícita y sin eliminar el mecanismo manual de
contingencia.

## Campos frontend que se ajustan en ETAPA 7

El frontend de ETAPA 3 conserva contratos mock más amplios que las métricas
realmente atribuibles. Durante integración API deben corregirse, sin fabricar
ceros:

### Advisor

No disponible con la fuente actual:

- `contactabilityRate`;
- cartera asignada/pendiente;
- meta/pace/gap.

### Supervisor

No disponible con la fuente actual:

- cartera asignada/gestionada atribuida al supervisor;
- avance y contactabilidad contra cartera asignada;
- meta/expected/pace/gap.

Las métricas operativas respaldadas por actividad de asesor sí se conservan.

## Repositorio necesario para ETAPA 7

El ZIP actual contiene frontend React y artefactos Analytics SQL/Python, pero no
contiene el backend .NET (`.sln` / `.csproj`).

Por tanto, después de cerrar este gate, el primer cambio de integración puede
ajustar el contrato React/API, pero la implementación física de endpoints en
Onion Architecture requiere trabajar sobre el repositorio/proyecto .NET real.
