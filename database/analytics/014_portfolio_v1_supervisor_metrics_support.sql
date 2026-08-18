/*
Portfolio Control Center - ETAPA 6
Soporte de atribución segura de métricas Supervisor -> Asesor
Motor: SQL Server

Ejecutar DENTRO de aval_analytics después de:
  001_portfolio_v1_schema.sql
  005_portfolio_v1_advisor_support.sql
  006_portfolio_v1_supervisor_support.sql
  009_portfolio_v1_advisor_range_support.sql
  010_portfolio_v1_advisor_payer_range_support.sql

Este script NO carga datos.
Expone grains de atribución histórica para que la futura API pueda calcular
métricas de supervisor sin inventar cartera asignada ni meta por supervisor.

Regla canonical:
- la jerarquía se aplica según la fecha del evento;
- no se retrocede una relación a fechas anteriores a bridge.valid_from;
- supervisor_key NULL significa actividad sin atribución histórica demostrable;
- NO se deriva assigned portfolio, progress, target ni contactability de campaña
  a nivel supervisor.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   1. Flows diarios atribuibles por asesor/supervisor

   Grain base preservado:
   fecha + cliente + campaña + cartera + asesor

   Útil para métricas aditivas:
   - management_events
   - recovered_amount atribuible

   No utilizar SUM de distinct diarios para RPC/payers.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_supervisor_advisor_daily_attribution
AS
SELECT
    f.advisor_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,

    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,

    b.supervisor_advisor_key,
    b.valid_from AS supervisor_valid_from,
    b.valid_to AS supervisor_valid_to,
    b.supervisor_key,

    s.source_supervisor_id,
    s.supervisor_document,
    s.supervisor_name,

    CASE
        WHEN b.supervisor_key IS NOT NULL THEN 'ATTRIBUTED'
        ELSE 'UNATTRIBUTED'
    END AS supervisor_attribution_status,

    f.management_events,
    f.direct_contact_clients,
    f.indirect_contact_clients,
    f.no_contact_clients,
    f.promises_count,
    f.promises_amount,
    f.payers_count,
    f.recovered_amount,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key
LEFT JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = f.advisor_key
   AND d.calendar_date >= b.valid_from
   AND (
        b.valid_to IS NULL
        OR d.calendar_date <= b.valid_to
   )
LEFT JOIN analytics.dim_supervisor AS s
    ON s.supervisor_key = b.supervisor_key;
GO


/* ============================================================
   2. Contacto exacto por supervisor para rangos

   Grain base preservado:
   fecha + cliente + campaña + cartera + asesor + deudor

   Para RPC de supervisor en un rango:
   1. filtrar fechas/scope;
   2. filtrar supervisor_key;
   3. reagrupar a cartera + supervisor + deudor;
   4. aplicar precedencia CD > CI > NC;
   5. contar distinct deudores.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_supervisor_debtor_contact_daily
AS
SELECT
    f.advisor_debtor_contact_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,

    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,

    b.supervisor_advisor_key,
    b.valid_from AS supervisor_valid_from,
    b.valid_to AS supervisor_valid_to,
    b.supervisor_key,

    s.source_supervisor_id,
    s.supervisor_document,
    s.supervisor_name,

    CASE
        WHEN b.supervisor_key IS NOT NULL THEN 'ATTRIBUTED'
        ELSE 'UNATTRIBUTED'
    END AS supervisor_attribution_status,

    f.source_debtor_id,
    f.had_direct_contact,
    f.had_indirect_contact,
    f.had_no_contact,

    CASE
        WHEN f.had_direct_contact = 1 THEN 'CD'
        WHEN f.had_indirect_contact = 1 THEN 'CI'
        WHEN f.had_no_contact = 1 THEN 'NC'
        ELSE NULL
    END AS contact_class,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_debtor_contact_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key
LEFT JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = f.advisor_key
   AND d.calendar_date >= b.valid_from
   AND (
        b.valid_to IS NULL
        OR d.calendar_date <= b.valid_to
   )
LEFT JOIN analytics.dim_supervisor AS s
    ON s.supervisor_key = b.supervisor_key;
GO


/* ============================================================
   3. Pagadores exactos atribuibles por supervisor para rangos

   Incluye solamente pagos atribuibles a una gestión real de asesor.
   Las filas sintéticas Pago Sin Promesa siguen fuera del scope de asesor.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_supervisor_debtor_payment_daily
AS
SELECT
    f.advisor_debtor_payment_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,

    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,

    b.supervisor_advisor_key,
    b.valid_from AS supervisor_valid_from,
    b.valid_to AS supervisor_valid_to,
    b.supervisor_key,

    s.source_supervisor_id,
    s.supervisor_document,
    s.supervisor_name,

    CASE
        WHEN b.supervisor_key IS NOT NULL THEN 'ATTRIBUTED'
        ELSE 'UNATTRIBUTED'
    END AS supervisor_attribution_status,

    f.source_debtor_id,
    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key
LEFT JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = f.advisor_key
   AND d.calendar_date >= b.valid_from
   AND (
        b.valid_to IS NULL
        OR d.calendar_date <= b.valid_to
   )
LEFT JOIN analytics.dim_supervisor AS s
    ON s.supervisor_key = b.supervisor_key;
GO


/* ============================================================
   4. Promesas/PDP atribuibles históricamente al supervisor

   La relación se evalúa con management_at, no con la jerarquía current.
   Si la promesa es anterior a la primera observación de la relación,
   supervisor_key permanece NULL: no se inventa historia.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_supervisor_promise_operational
AS
SELECT
    p.promise_fact_key,
    p.client_key,
    p.campaign_key,
    p.portfolio_key,
    p.advisor_key,

    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,

    b.supervisor_advisor_key,
    b.valid_from AS supervisor_valid_from,
    b.valid_to AS supervisor_valid_to,
    b.supervisor_key,

    s.source_supervisor_id,
    s.supervisor_document,
    s.supervisor_name,

    CASE
        WHEN p.advisor_key IS NULL THEN 'NO_ADVISOR'
        WHEN b.supervisor_key IS NOT NULL THEN 'ATTRIBUTED'
        ELSE 'UNATTRIBUTED'
    END AS supervisor_attribution_status,

    p.source_operation_id,
    p.source_debtor_id,
    p.management_at,
    p.promise_due_date,
    p.promise_amount,
    p.paid_amount,
    p.last_payment_date,
    p.source_status,
    p.status_code,
    p.is_valid_promise,
    p.source_updated_at,
    p.loaded_at
FROM analytics.fact_promise AS p
LEFT JOIN analytics.dim_advisor AS a
    ON a.advisor_key = p.advisor_key
LEFT JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = p.advisor_key
   AND CAST(p.management_at AS DATE) >= b.valid_from
   AND (
        b.valid_to IS NULL
        OR CAST(p.management_at AS DATE) <= b.valid_to
   )
LEFT JOIN analytics.dim_supervisor AS s
    ON s.supervisor_key = b.supervisor_key;
GO
