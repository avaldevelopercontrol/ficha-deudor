/*
Portfolio Control Center - ETAPA 5 / Avance 2
Vistas canónicas de lectura del Analytics DB
Motor objetivo: SQL Server

PRERREQUISITO:
    001_portfolio_v1_schema.sql

Este script:
- NO carga datos.
- NO crea jobs.
- NO consulta la BD transaccional.
- Define contratos de lectura estables para el futuro Analytics API.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   1. PORTFOLIO DIARIO POR CARTERA
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_portfolio_daily_metrics
AS
SELECT
    f.portfolio_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,

    f.assigned_clients_snapshot,
    f.managed_clients_snapshot,
    f.pending_clients_snapshot,
    f.contacted_clients_snapshot,
    f.direct_contact_snapshot,

    f.assigned_amount_snapshot,
    f.managed_amount_snapshot,
    f.has_source_snapshot,

    f.management_events_day,
    f.new_managed_clients_day,
    f.new_direct_contacts_day,
    f.promises_count_day,
    f.promises_amount_day,
    f.payers_count_day,
    f.recovered_amount_day,

    CAST(
        1.0 * f.managed_clients_snapshot
        / NULLIF(f.assigned_clients_snapshot, 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,

    CAST(
        1.0 * f.contacted_clients_snapshot
        / NULLIF(f.assigned_clients_snapshot, 0)
        AS DECIMAL(18,6)
    ) AS contactability_rate,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key;
GO


/* ============================================================
   2. RESUMEN DIARIO DE CAMPAÑA

   IMPORTANTE:
   Las columnas *_snapshot se pueden sumar ENTRE CARTERAS dentro
   del MISMO corte, pero NO entre fechas.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_campaign_daily_summary
AS
SELECT
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,

    SUM(f.assigned_clients_snapshot) AS assigned_clients_snapshot,
    SUM(f.managed_clients_snapshot) AS managed_clients_snapshot,
    SUM(f.pending_clients_snapshot) AS pending_clients_snapshot,
    SUM(f.contacted_clients_snapshot) AS contacted_clients_snapshot,
    SUM(f.direct_contact_snapshot) AS direct_contact_snapshot,

    SUM(f.assigned_amount_snapshot) AS assigned_amount_snapshot,
    SUM(f.managed_amount_snapshot) AS managed_amount_snapshot,

    CAST(
        MAX(CONVERT(TINYINT, f.has_source_snapshot))
        AS BIT
    ) AS has_source_snapshot,

    SUM(f.management_events_day) AS management_events_day,
    SUM(f.new_managed_clients_day) AS new_managed_clients_day,
    SUM(f.new_direct_contacts_day) AS new_direct_contacts_day,
    SUM(f.promises_count_day) AS promises_count_day,
    SUM(f.promises_amount_day) AS promises_amount_day,
    SUM(f.payers_count_day) AS payers_count_day,
    SUM(f.recovered_amount_day) AS recovered_amount_day,

    CAST(
        1.0 * SUM(f.managed_clients_snapshot)
        / NULLIF(SUM(f.assigned_clients_snapshot), 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,

    CAST(
        1.0 * SUM(f.contacted_clients_snapshot)
        / NULLIF(SUM(f.assigned_clients_snapshot), 0)
        AS DECIMAL(18,6)
    ) AS contactability_rate,

    MAX(f.source_as_of_at) AS source_as_of_at,
    MAX(f.loaded_at) AS loaded_at
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
GROUP BY
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key;
GO


/* ============================================================
   3. PRODUCTIVIDAD DIARIA POR ASESOR
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_advisor_daily_metrics
AS
SELECT
    f.advisor_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,

    f.management_events,
    f.direct_contact_clients,
    f.indirect_contact_clients,
    f.no_contact_clients,
    f.promises_count,
    f.promises_amount,
    f.payers_count,
    f.recovered_amount,

    CAST(
        1.0 * f.direct_contact_clients
        / NULLIF(
            f.direct_contact_clients
            + f.indirect_contact_clients
            + f.no_contact_clients,
            0
        )
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    CAST(
        1.0 * f.promises_count
        / NULLIF(f.direct_contact_clients, 0)
        AS DECIMAL(18,6)
    ) AS close_rate,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key;
GO


/* ============================================================
   4. PROMESAS OPERATIVAS

   Nunca se deduce una promesa válida únicamente por montoPromesa.
   La carga debe haber normalizado status_code/is_valid_promise.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_promise_operational
AS
SELECT
    p.promise_fact_key,
    p.client_key,
    p.campaign_key,
    p.portfolio_key,
    p.advisor_key,

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

    CASE
        WHEN p.is_valid_promise = 1
         AND p.status_code = 'DUE_TODAY'
            THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_due_today,

    CASE
        WHEN p.is_valid_promise = 1
         AND p.status_code = 'BROKEN'
            THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_broken,

    CASE
        WHEN p.is_valid_promise = 1
         AND p.status_code IN
         (
            'FULFILLED',
            'PARTIAL',
            'FULFILLED_OUT_OF_RANGE'
         )
            THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_fulfilled_or_partial,

    p.source_updated_at,
    p.loaded_at
FROM analytics.fact_promise AS p;
GO


/* ============================================================
   5. META Y CURVA ESPERADA POR CAMPAÑA

   Usa solamente metas de nivel campaña:
       portfolio_key IS NULL

   La curva esperada V1 distribuye la meta por días hábiles.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_campaign_target_progress
AS
WITH DateProgress AS
(
    SELECT
        d.date_key,
        d.calendar_date,
        d.calendar_year,
        d.calendar_month,
        SUM(
            CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END
        ) OVER
        (
            PARTITION BY d.calendar_year, d.calendar_month
            ORDER BY d.date_key
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS elapsed_business_days,
        SUM(
            CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END
        ) OVER
        (
            PARTITION BY d.calendar_year, d.calendar_month
        ) AS total_business_days
    FROM analytics.dim_date AS d
),
CampaignDaily AS
(
    SELECT
        s.date_key,
        s.calendar_date,
        s.client_key,
        s.campaign_key,
        s.recovered_amount_day,

        SUM(s.recovered_amount_day) OVER
        (
            PARTITION BY s.client_key, s.campaign_key
            ORDER BY s.date_key
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS recovered_amount_to_date
    FROM analytics.v_campaign_daily_summary AS s
),
TargetBase AS
(
    SELECT
        t.client_key,
        t.campaign_key,
        t.target_recovered_amount,
        t.target_effectiveness_rate,
        t.source_as_of_at AS target_source_as_of_at
    FROM analytics.fact_target_monthly AS t
    WHERE t.portfolio_key IS NULL
)
SELECT
    c.date_key,
    c.calendar_date,
    c.client_key,
    c.campaign_key,

    t.target_recovered_amount,
    c.recovered_amount_day,
    c.recovered_amount_to_date,

    dp.elapsed_business_days,
    dp.total_business_days,

    CAST(
        t.target_recovered_amount
        * dp.elapsed_business_days
        / NULLIF(dp.total_business_days, 0)
        AS DECIMAL(19,4)
    ) AS expected_recovered_to_date,

    CAST(
        c.recovered_amount_to_date
        / NULLIF(t.target_recovered_amount, 0)
        AS DECIMAL(18,6)
    ) AS target_achievement_rate,

    CAST(
        c.recovered_amount_to_date
        / NULLIF(
            t.target_recovered_amount
            * dp.elapsed_business_days
            / NULLIF(dp.total_business_days, 0),
            0
        )
        AS DECIMAL(18,6)
    ) AS pace_achievement_rate,

    CAST(
        c.recovered_amount_to_date
        - (
            t.target_recovered_amount
            * dp.elapsed_business_days
            / NULLIF(dp.total_business_days, 0)
        )
        AS DECIMAL(19,4)
    ) AS gap_amount,

    CAST(
        (
            c.recovered_amount_to_date
            / NULLIF(
                t.target_recovered_amount
                * dp.elapsed_business_days
                / NULLIF(dp.total_business_days, 0),
                0
            )
        ) - 1.0
        AS DECIMAL(18,6)
    ) AS gap_rate,

    t.target_effectiveness_rate,
    t.target_source_as_of_at
FROM CampaignDaily AS c
INNER JOIN DateProgress AS dp
    ON dp.date_key = c.date_key
LEFT JOIN TargetBase AS t
    ON t.client_key = c.client_key
   AND t.campaign_key = c.campaign_key;
GO
