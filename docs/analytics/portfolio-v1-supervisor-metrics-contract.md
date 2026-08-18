# Portfolio Control Center — contrato de métricas de supervisor

## Objetivo

Definir qué métricas pueden atribuirse a un supervisor usando exclusivamente la
jerarquía canonical:

`av_Usuario.nid_UsuSuper -> bridge_supervisor_advisor`

sin inventar asignaciones de cartera, metas ni historia anterior a la primera
observación de Analytics.

## Regla temporal

La jerarquía es historizable. Toda actividad se atribuye al supervisor que era
válido **en la fecha del evento**:

- flows diarios: `dim_date.calendar_date`;
- contactos/pagadores: fecha del grain diario;
- promesas/PDP: fecha de `management_at`.

Si no existe relación histórica para esa fecha, `supervisor_key` queda `NULL`.
Eso incluye:

- asesores cuyo `nid_UsuSuper` actual es `NULL`;
- hechos anteriores a la primera observación de una relación.

No se hace backfill con el supervisor current.

## Métricas atribuibles

Estas métricas sí pueden exponerse para un supervisor:

- cantidad de asesores cuya relación se solapa con el rango;
- gestiones: suma de `management_events`;
- RPC exacto: distinct `cartera + supervisor + deudor` con precedencia
  `CD > CI > NC`;
- close rate exacto: distinct deudores con promesa válida / distinct deudores
  con CD;
- cantidad de promesas válidas: filas válidas de `fact_promise` atribuidas;
- cumplimiento monetario PDP: pago cumplido / promesa evaluada;
- pagadores atribuibles exactos: distinct `cartera + supervisor + deudor`;
- recaudo atribuible: suma de `fact_advisor_daily.recovered_amount`.

El recaudo atribuible a supervisor continúa siendo una parte del recaudo total
de Portfolio. Las filas `Pago Sin Promesa` no se atribuyen a asesor/supervisor.

## Métricas que NO deben atribuirse

Mientras no exista una fuente de asignación explícita supervisor -> cartera/meta,
la API no debe devolver como métricas reales de supervisor:

- cartera asignada;
- cartera pendiente;
- avance `managed / assigned`;
- contactabilidad canonical `contacted / assigned`;
- meta mensual;
- cumplimiento final contra meta;
- expected curve / pace contra meta;
- gap monetario o porcentual contra meta.

Tampoco debe asignarse la meta completa de campaña al supervisor filtrado.

## Contratos SQL

`014_portfolio_v1_supervisor_metrics_support.sql` crea:

- `analytics.v_supervisor_advisor_daily_attribution`;
- `analytics.v_supervisor_debtor_contact_daily`;
- `analytics.v_supervisor_debtor_payment_daily`;
- `analytics.v_supervisor_promise_operational`.

Estas views preservan el grain original y añaden únicamente la atribución
histórica de supervisor. La futura API debe reagrupar los grains exactos para
los rangos solicitados.

## Estado `Sin supervisor`

No se crea un supervisor artificial en `dim_supervisor`.

Para UI/API, `supervisor_key IS NULL` puede presentarse como `Sin supervisor`,
pero debe conservarse como `NULL` en Analytics para distinguirlo de una
relación real.

## Consecuencia para el frontend existente

El mock de ETAPA 3 contiene campos de supervisor como `assignedPortfolio`,
`managedPortfolio`, `progressRate` y `contactabilityRate`. Esos campos no deben
rellenarse con ceros ni con la cartera completa cuando se integre la API real.

La adaptación del contrato React se hará durante la integración API; ETAPA 6
no añade más lógica mock/frontend.
