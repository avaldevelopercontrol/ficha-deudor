/*
Portfolio Control Center - ETAPA 6
Validacion de semantica de metricas de asesor

Objetivo:
- confirmar que Analytics no expone cartera/meta/contactabilidad canonical a nivel asesor;
- confirmar que los contratos exactos necesarios para RPC/close/pagadores existen;
- mostrar las metricas atribuibles disponibles para el rango CLARO actual;
- impedir que una futura API complete AdvisorPerformanceItem.contactabilityRate
  con una metrica no respaldada por una cartera asignada al asesor.

Este script es read-only.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @client_key BIGINT;
DECLARE @campaign_key BIGINT;
DECLARE @campaign_code VARCHAR(20) = '2026-08';
DECLARE @date_from DATE;
DECLARE @date_to DATE;
DECLARE @forbidden_advisor_metric_columns INT = 0;
DECLARE @missing_required_contracts INT = 0;
DECLARE @advisor_rows INT = 0;

SELECT @client_key = c.client_key
FROM analytics.dim_client AS c
WHERE c.crm_client_id = 95
  AND c.is_active = 1;

SELECT @campaign_key = c.campaign_key
FROM analytics.dim_campaign AS c
WHERE c.client_key = @client_key
  AND c.campaign_code = @campaign_code;

IF @client_key IS NULL
    THROW 51000, 'No existe cliente Analytics activo para crm_client_id=95.', 1;

IF @campaign_key IS NULL
    THROW 51000, 'No existe la campana Analytics 2026-08 para CLARO.', 1;

SELECT
    @date_from = MIN(d.calendar_date),
    @date_to = MAX(d.calendar_date)
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key;

IF @date_from IS NULL OR @date_to IS NULL
    THROW 51000, 'No existen facts de asesor para la campana solicitada.', 1;

/* ============================================================
   1. Guardrail: columnas que no se deben exponer como metricas
      canonical de asesor con las fuentes actuales.
   ============================================================ */

;WITH AdvisorContracts AS
(
    SELECT OBJECT_ID('analytics.v_advisor_daily_metrics') AS object_id
    UNION ALL
    SELECT OBJECT_ID('analytics.v_advisor_debtor_contact_daily')
    UNION ALL
    SELECT OBJECT_ID('analytics.fact_advisor_debtor_payment_daily')
),
ForbiddenColumns AS
(
    SELECT v.column_name
    FROM (VALUES
        ('assigned_portfolio'),
        ('assigned_clients'),
        ('assigned_amount'),
        ('pending_portfolio'),
        ('pending_clients'),
        ('managed_portfolio'),
        ('progress_rate'),
        ('contactability_rate'),
        ('target_amount'),
        ('monthly_target'),
        ('expected_to_date'),
        ('pace_achievement_rate'),
        ('gap_amount'),
        ('gap_rate')
    ) AS v(column_name)
)
SELECT @forbidden_advisor_metric_columns = COUNT(*)
FROM AdvisorContracts AS ac
INNER JOIN sys.columns AS c
    ON c.object_id = ac.object_id
INNER JOIN ForbiddenColumns AS f
    ON LOWER(c.name) = f.column_name
WHERE ac.object_id IS NOT NULL;

SELECT
    @forbidden_advisor_metric_columns AS forbidden_advisor_metric_columns;

/* ============================================================
   2. Objetos requeridos para metricas exactas de rango.
   ============================================================ */

SELECT @missing_required_contracts = COUNT(*)
FROM (VALUES
    ('analytics.v_advisor_daily_metrics', 'V'),
    ('analytics.fact_advisor_debtor_contact_daily', 'U'),
    ('analytics.fact_advisor_debtor_payment_daily', 'U'),
    ('analytics.fact_promise', 'U'),
    ('analytics.v_advisor_supervisor_current', 'V')
) AS r(object_name, object_type)
WHERE OBJECT_ID(r.object_name, r.object_type) IS NULL;

SELECT
    @missing_required_contracts AS missing_required_contracts;

/* ============================================================
   3. Metricas atribuibles exactas disponibles para el rango.

   No se calcula contactability_rate porque no existe denominador
   canonical de cartera asignada por asesor.
   ============================================================ */

;WITH ContactRange AS
(
    SELECT
        f.advisor_key,
        f.portfolio_key,
        f.source_debtor_id,
        MAX(CONVERT(INT, f.had_direct_contact)) AS had_direct_contact,
        MAX(CONVERT(INT, f.had_indirect_contact)) AS had_indirect_contact,
        MAX(CONVERT(INT, f.had_no_contact)) AS had_no_contact
    FROM analytics.fact_advisor_debtor_contact_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_date BETWEEN @date_from AND @date_to
    GROUP BY
        f.advisor_key,
        f.portfolio_key,
        f.source_debtor_id
),
ContactAgg AS
(
    SELECT
        advisor_key,
        SUM(CASE WHEN had_direct_contact = 1 THEN 1 ELSE 0 END) AS direct_contact_clients,
        COUNT_BIG(*) AS classifiable_clients
    FROM ContactRange
    GROUP BY advisor_key
),
PromiseDebtor AS
(
    SELECT DISTINCT
        p.advisor_key,
        p.portfolio_key,
        p.source_debtor_id
    FROM analytics.fact_promise AS p
    WHERE p.client_key = @client_key
      AND p.campaign_key = @campaign_key
      AND p.advisor_key IS NOT NULL
      AND p.is_valid_promise = 1
      AND CONVERT(DATE, p.management_at) BETWEEN @date_from AND @date_to
),
PromiseAgg AS
(
    SELECT advisor_key, COUNT_BIG(*) AS valid_promise_clients
    FROM PromiseDebtor
    GROUP BY advisor_key
),
PayerRange AS
(
    SELECT DISTINCT
        f.advisor_key,
        f.portfolio_key,
        f.source_debtor_id
    FROM analytics.fact_advisor_debtor_payment_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_date BETWEEN @date_from AND @date_to
),
PayerAgg AS
(
    SELECT advisor_key, COUNT_BIG(*) AS payers_count
    FROM PayerRange
    GROUP BY advisor_key
),
FlowAgg AS
(
    SELECT
        f.advisor_key,
        SUM(CONVERT(BIGINT, f.management_events)) AS management_events,
        SUM(CONVERT(DECIMAL(19,4), f.recovered_amount)) AS attributable_recovered_amount
    FROM analytics.fact_advisor_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_date BETWEEN @date_from AND @date_to
    GROUP BY f.advisor_key
),
AdvisorList AS
(
    SELECT DISTINCT advisor_key
    FROM analytics.fact_advisor_daily
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
)
SELECT
    a.advisor_key,
    a.advisor_name,
    sup.supervisor_key,
    sup.supervisor_name,
    ISNULL(fl.management_events, 0) AS management_events,
    ISNULL(c.direct_contact_clients, 0) AS direct_contact_clients,
    ISNULL(c.classifiable_clients, 0) AS classifiable_clients,
    CAST(
        1.0 * ISNULL(c.direct_contact_clients, 0)
        / NULLIF(c.classifiable_clients, 0)
        AS DECIMAL(18,6)
    ) AS rpc_rate,
    ISNULL(pr.valid_promise_clients, 0) AS valid_promise_clients,
    CAST(
        1.0 * ISNULL(pr.valid_promise_clients, 0)
        / NULLIF(c.direct_contact_clients, 0)
        AS DECIMAL(18,6)
    ) AS close_rate,
    ISNULL(py.payers_count, 0) AS payers_count,
    ISNULL(fl.attributable_recovered_amount, 0) AS attributable_recovered_amount,
    CAST(NULL AS DECIMAL(18,6)) AS contactability_rate,
    'NOT_AVAILABLE_WITH_CURRENT_SOURCE' AS contactability_status
FROM AdvisorList AS l
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = l.advisor_key
LEFT JOIN FlowAgg AS fl
    ON fl.advisor_key = l.advisor_key
LEFT JOIN ContactAgg AS c
    ON c.advisor_key = l.advisor_key
LEFT JOIN PromiseAgg AS pr
    ON pr.advisor_key = l.advisor_key
LEFT JOIN PayerAgg AS py
    ON py.advisor_key = l.advisor_key
LEFT JOIN analytics.v_advisor_supervisor_current AS sup
    ON sup.advisor_key = l.advisor_key
ORDER BY a.advisor_name;

SELECT @advisor_rows = COUNT(DISTINCT f.advisor_key)
FROM analytics.fact_advisor_daily AS f
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key;

/* ============================================================
   4. Resultado final.
   ============================================================ */

SELECT
    @date_from AS date_from,
    @date_to AS date_to,
    @advisor_rows AS advisors_in_range,
    @forbidden_advisor_metric_columns AS forbidden_advisor_metric_columns,
    @missing_required_contracts AS missing_required_contracts,
    CASE
        WHEN @forbidden_advisor_metric_columns = 0
         AND @missing_required_contracts = 0
         AND @advisor_rows > 0
        THEN 'OK'
        ELSE 'REVIEW'
    END AS assessment;

IF @forbidden_advisor_metric_columns <> 0
    THROW 51000, 'Un contrato Analytics de asesor expone cartera/meta/contactabilidad no soportada.', 1;

IF @missing_required_contracts <> 0
    THROW 51000, 'Faltan contratos Analytics requeridos para metricas exactas de asesor.', 1;
