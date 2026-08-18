/*
Portfolio Control Center - ETAPA 6
Validación de semántica de métricas de supervisor.

Objetivos:
- comprobar que las views de atribución no pierden ni duplican facts;
- comprobar que la jerarquía histórica no tiene periodos solapados;
- comparar la jerarquía current con staging AVAL_COB_45;
- mostrar métricas atribuibles por supervisor sin asignar cartera/meta;
- mantener explícita la actividad sin supervisor histórico.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @source_code VARCHAR(50) = 'AVAL_COB_45';
DECLARE @campaign_code VARCHAR(20) = '2026-08';
DECLARE @client_key INT;
DECLARE @campaign_key INT;
DECLARE @date_from DATE;
DECLARE @date_to DATE;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

IF @client_key IS NULL
    THROW 52500, 'Cliente CRM 95 no encontrado en analytics.dim_client.', 1;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @campaign_key IS NULL
    THROW 52501, 'Campaña 2026-08 no encontrada en Analytics.', 1;

SELECT
    @date_from = MIN(d.calendar_date),
    @date_to = MAX(d.calendar_date)
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key;

IF @date_from IS NULL OR @date_to IS NULL
    THROW 52502, 'No existen facts de asesor para validar la campaña.', 1;


/* ============================================================
   1. Mapping current staging vs Analytics
   ============================================================ */

IF OBJECT_ID('tempdb..#CurrentMapping') IS NOT NULL
    DROP TABLE #CurrentMapping;

;WITH SourceCurrent AS
(
    SELECT
        a.advisor_key,
        a.source_advisor_id,
        a.advisor_name,
        u.nid_UsuSuper AS source_supervisor_id
    FROM analytics.dim_advisor AS a
    INNER JOIN staging.aval_usuario_current AS u
        ON u.source_code = @source_code
       AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)
    WHERE a.client_key = @client_key
      AND a.is_active = 1
),
AnalyticsCurrent AS
(
    SELECT
        advisor_key,
        TRY_CONVERT(INT, source_supervisor_id) AS analytics_supervisor_id,
        supervisor_name
    FROM analytics.v_advisor_supervisor_current
    WHERE client_key = @client_key
      AND advisor_is_active = 1
)
SELECT
    s.advisor_key,
    s.source_advisor_id,
    s.advisor_name,
    s.source_supervisor_id,
    a.analytics_supervisor_id,
    a.supervisor_name,
    CASE
        WHEN ISNULL(s.source_supervisor_id, -1)
           = ISNULL(a.analytics_supervisor_id, -1)
            THEN 0
        ELSE 1
    END AS mapping_difference
INTO #CurrentMapping
FROM SourceCurrent AS s
INNER JOIN AnalyticsCurrent AS a
    ON a.advisor_key = s.advisor_key;

SELECT
    COUNT(*) AS active_advisors,
    SUM(CASE WHEN source_supervisor_id IS NOT NULL THEN 1 ELSE 0 END)
        AS source_with_supervisor,
    SUM(CASE WHEN source_supervisor_id IS NULL THEN 1 ELSE 0 END)
        AS source_without_supervisor,
    SUM(CASE WHEN analytics_supervisor_id IS NOT NULL THEN 1 ELSE 0 END)
        AS analytics_with_supervisor,
    SUM(CASE WHEN analytics_supervisor_id IS NULL THEN 1 ELSE 0 END)
        AS analytics_without_supervisor,
    SUM(mapping_difference) AS current_mapping_differences
FROM #CurrentMapping;

DECLARE @current_mapping_coverage_differences INT;

SELECT @current_mapping_coverage_differences = ABS(
    (SELECT COUNT(*)
     FROM analytics.dim_advisor
     WHERE client_key = @client_key
       AND is_active = 1)
    -
    (SELECT COUNT(*) FROM #CurrentMapping)
);

SELECT @current_mapping_coverage_differences
    AS current_mapping_coverage_differences;


/* ============================================================
   2. Periodos históricos: no deben solaparse por asesor
   ============================================================ */

DECLARE @overlapping_historical_periods INT;

SELECT @overlapping_historical_periods = COUNT(*)
FROM analytics.bridge_supervisor_advisor AS a
INNER JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = a.advisor_key
   AND b.supervisor_advisor_key > a.supervisor_advisor_key
   AND a.valid_from <= ISNULL(b.valid_to, CONVERT(DATE, '99991231'))
   AND b.valid_from <= ISNULL(a.valid_to, CONVERT(DATE, '99991231'))
INNER JOIN analytics.dim_advisor AS adv
    ON adv.advisor_key = a.advisor_key
WHERE adv.client_key = @client_key;

SELECT @overlapping_historical_periods AS overlapping_historical_periods;


/* ============================================================
   3. Row preservation de los contratos de atribución
   ============================================================ */

DECLARE @advisor_daily_differences INT;
DECLARE @contact_grain_differences INT;
DECLARE @payer_grain_differences INT;
DECLARE @promise_grain_differences INT;

SELECT @advisor_daily_differences = ABS(
    (SELECT COUNT(*)
     FROM analytics.fact_advisor_daily
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
    -
    (SELECT COUNT(*)
     FROM analytics.v_supervisor_advisor_daily_attribution
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
);

SELECT @contact_grain_differences = ABS(
    (SELECT COUNT(*)
     FROM analytics.fact_advisor_debtor_contact_daily
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
    -
    (SELECT COUNT(*)
     FROM analytics.v_supervisor_debtor_contact_daily
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
);

SELECT @payer_grain_differences = ABS(
    (SELECT COUNT(*)
     FROM analytics.fact_advisor_debtor_payment_daily
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
    -
    (SELECT COUNT(*)
     FROM analytics.v_supervisor_debtor_payment_daily
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
);

SELECT @promise_grain_differences = ABS(
    (SELECT COUNT(*)
     FROM analytics.fact_promise
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
    -
    (SELECT COUNT(*)
     FROM analytics.v_supervisor_promise_operational
     WHERE client_key = @client_key
       AND campaign_key = @campaign_key)
);

SELECT
    @advisor_daily_differences AS advisor_daily_differences,
    @contact_grain_differences AS contact_grain_differences,
    @payer_grain_differences AS payer_grain_differences,
    @promise_grain_differences AS promise_grain_differences;


/* ============================================================
   4. Cobertura histórica de atribución

   UNATTRIBUTED es válido: incluye asesores sin supervisor current y
   fechas anteriores a la primera observación de la relación.
   ============================================================ */

SELECT
    supervisor_attribution_status,
    COUNT(*) AS advisor_daily_rows,
    SUM(management_events) AS management_events,
    SUM(recovered_amount) AS attributable_recovered_amount
FROM analytics.v_supervisor_advisor_daily_attribution
WHERE client_key = @client_key
  AND campaign_key = @campaign_key
  AND calendar_date BETWEEN @date_from AND @date_to
GROUP BY supervisor_attribution_status
ORDER BY supervisor_attribution_status;


/* ============================================================
   5. Métricas exactas atribuibles por supervisor

   No se exponen assigned portfolio, progress, target ni contactability.
   ============================================================ */

;WITH SupervisorList AS
(
    SELECT DISTINCT
        supervisor_key,
        supervisor_name
    FROM analytics.v_supervisor_advisor_daily_attribution
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND calendar_date BETWEEN @date_from AND @date_to
      AND supervisor_key IS NOT NULL
),
Management AS
(
    SELECT
        supervisor_key,
        SUM(management_events) AS management_events,
        SUM(recovered_amount) AS attributable_recovered_amount
    FROM analytics.v_supervisor_advisor_daily_attribution
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND calendar_date BETWEEN @date_from AND @date_to
      AND supervisor_key IS NOT NULL
    GROUP BY supervisor_key
),
ContactByDebtor AS
(
    SELECT
        supervisor_key,
        portfolio_key,
        source_debtor_id,
        MAX(CONVERT(INT, had_direct_contact)) AS had_direct_contact,
        MAX(CONVERT(INT, had_indirect_contact)) AS had_indirect_contact,
        MAX(CONVERT(INT, had_no_contact)) AS had_no_contact
    FROM analytics.v_supervisor_debtor_contact_daily
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND calendar_date BETWEEN @date_from AND @date_to
      AND supervisor_key IS NOT NULL
    GROUP BY
        supervisor_key,
        portfolio_key,
        source_debtor_id
),
ContactAgg AS
(
    SELECT
        supervisor_key,
        SUM(CASE WHEN had_direct_contact = 1 THEN 1 ELSE 0 END)
            AS direct_contact_clients,
        COUNT(*) AS classifiable_clients
    FROM ContactByDebtor
    GROUP BY supervisor_key
),
PromiseDebtor AS
(
    SELECT DISTINCT
        supervisor_key,
        portfolio_key,
        source_debtor_id
    FROM analytics.v_supervisor_promise_operational
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND management_at >= @date_from
      AND management_at < DATEADD(DAY, 1, @date_to)
      AND supervisor_key IS NOT NULL
      AND is_valid_promise = 1
),
PromiseAgg AS
(
    SELECT
        supervisor_key,
        COUNT(*) AS valid_promise_rows,
        SUM(
            CASE
                WHEN status_code IN
                    ('FULFILLED', 'PARTIAL', 'FULFILLED_OUT_OF_RANGE')
                    THEN paid_amount
                ELSE 0
            END
        ) AS fulfilled_paid_amount,
        SUM(
            CASE
                WHEN status_code IN
                    ('FULFILLED', 'PARTIAL', 'FULFILLED_OUT_OF_RANGE', 'BROKEN')
                    THEN promise_amount
                ELSE 0
            END
        ) AS evaluated_promise_amount
    FROM analytics.v_supervisor_promise_operational
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND management_at >= @date_from
      AND management_at < DATEADD(DAY, 1, @date_to)
      AND supervisor_key IS NOT NULL
      AND is_valid_promise = 1
    GROUP BY supervisor_key
),
PromiseDebtorAgg AS
(
    SELECT
        supervisor_key,
        COUNT(*) AS valid_promise_clients
    FROM PromiseDebtor
    GROUP BY supervisor_key
),
PayerByDebtor AS
(
    SELECT DISTINCT
        supervisor_key,
        portfolio_key,
        source_debtor_id
    FROM analytics.v_supervisor_debtor_payment_daily
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND calendar_date BETWEEN @date_from AND @date_to
      AND supervisor_key IS NOT NULL
),
PayerAgg AS
(
    SELECT
        supervisor_key,
        COUNT(*) AS payers_count
    FROM PayerByDebtor
    GROUP BY supervisor_key
),
TeamSize AS
(
    SELECT
        b.supervisor_key,
        COUNT(DISTINCT b.advisor_key) AS advisor_count_in_range
    FROM analytics.bridge_supervisor_advisor AS b
    INNER JOIN analytics.dim_supervisor AS s
        ON s.supervisor_key = b.supervisor_key
    WHERE s.client_key = @client_key
      AND b.valid_from <= @date_to
      AND (b.valid_to IS NULL OR b.valid_to >= @date_from)
    GROUP BY b.supervisor_key
)
SELECT
    s.supervisor_key,
    s.supervisor_name,
    ISNULL(t.advisor_count_in_range, 0) AS advisor_count_in_range,
    ISNULL(m.management_events, 0) AS management_events,
    ISNULL(c.direct_contact_clients, 0) AS direct_contact_clients,
    ISNULL(c.classifiable_clients, 0) AS classifiable_clients,
    CAST(
        1.0 * ISNULL(c.direct_contact_clients, 0)
        / NULLIF(c.classifiable_clients, 0)
        AS DECIMAL(18,6)
    ) AS rpc_rate,
    ISNULL(pd.valid_promise_clients, 0) AS valid_promise_clients,
    CAST(
        1.0 * ISNULL(pd.valid_promise_clients, 0)
        / NULLIF(c.direct_contact_clients, 0)
        AS DECIMAL(18,6)
    ) AS close_rate,
    ISNULL(pa.valid_promise_rows, 0) AS valid_promise_rows,
    CAST(
        1.0 * ISNULL(pa.fulfilled_paid_amount, 0)
        / NULLIF(pa.evaluated_promise_amount, 0)
        AS DECIMAL(18,6)
    ) AS promise_fulfillment_amount_rate,
    ISNULL(py.payers_count, 0) AS payers_count,
    ISNULL(m.attributable_recovered_amount, 0) AS attributable_recovered_amount
FROM SupervisorList AS s
LEFT JOIN Management AS m
    ON m.supervisor_key = s.supervisor_key
LEFT JOIN ContactAgg AS c
    ON c.supervisor_key = s.supervisor_key
LEFT JOIN PromiseDebtorAgg AS pd
    ON pd.supervisor_key = s.supervisor_key
LEFT JOIN PromiseAgg AS pa
    ON pa.supervisor_key = s.supervisor_key
LEFT JOIN PayerAgg AS py
    ON py.supervisor_key = s.supervisor_key
LEFT JOIN TeamSize AS t
    ON t.supervisor_key = s.supervisor_key
ORDER BY s.supervisor_name;


/* ============================================================
   6. Guardrail: no exponer cartera/meta como atribución supervisor
   ============================================================ */

DECLARE @forbidden_supervisor_metric_columns INT;

SELECT @forbidden_supervisor_metric_columns = COUNT(*)
FROM sys.columns AS c
INNER JOIN sys.views AS v
    ON v.object_id = c.object_id
INNER JOIN sys.schemas AS s
    ON s.schema_id = v.schema_id
WHERE s.name = 'analytics'
  AND v.name IN
  (
      'v_supervisor_advisor_daily_attribution',
      'v_supervisor_debtor_contact_daily',
      'v_supervisor_debtor_payment_daily',
      'v_supervisor_promise_operational'
  )
  AND c.name IN
  (
      'assigned_portfolio',
      'assigned_clients',
      'assigned_amount',
      'target_amount',
      'monthly_target',
      'progress_rate',
      'contactability_rate'
  );

SELECT @forbidden_supervisor_metric_columns
    AS forbidden_supervisor_metric_columns;


/* ============================================================
   7. Resultado final
   ============================================================ */

DECLARE @current_mapping_differences INT;
DECLARE @assessment VARCHAR(20);

SELECT @current_mapping_differences = SUM(mapping_difference)
FROM #CurrentMapping;

SET @assessment = CASE
    WHEN ISNULL(@current_mapping_differences, 0) = 0
     AND @current_mapping_coverage_differences = 0
     AND @overlapping_historical_periods = 0
     AND @advisor_daily_differences = 0
     AND @contact_grain_differences = 0
     AND @payer_grain_differences = 0
     AND @promise_grain_differences = 0
     AND @forbidden_supervisor_metric_columns = 0
        THEN 'OK'
    ELSE 'FAIL'
END;

SELECT
    @date_from AS date_from,
    @date_to AS date_to,
    ISNULL(@current_mapping_differences, 0) AS current_mapping_differences,
    @current_mapping_coverage_differences AS current_mapping_coverage_differences,
    @overlapping_historical_periods AS overlapping_historical_periods,
    @advisor_daily_differences AS advisor_daily_differences,
    @contact_grain_differences AS contact_grain_differences,
    @payer_grain_differences AS payer_grain_differences,
    @promise_grain_differences AS promise_grain_differences,
    @forbidden_supervisor_metric_columns AS forbidden_supervisor_metric_columns,
    @assessment AS assessment;

IF @assessment <> 'OK'
    THROW 52503, 'La semántica de atribución de supervisor no pasó validación.', 1;
