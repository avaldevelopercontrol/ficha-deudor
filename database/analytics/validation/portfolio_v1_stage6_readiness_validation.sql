/*
Portfolio Control Center - ETAPA 6
Gate consolidado de readiness funcional antes de ETAPA 7
Motor: SQL Server 2017+

Objetivo:
- validar que el modelo Analytics V1 requerido por Portfolio Control Center
  existe y tiene datos reales para una campaña;
- consolidar en una sola ejecución los checks estructurales que bloquean API;
- NO validar scheduling/red del transporte 45 -> 180, porque esa deuda es
  operativa de infraestructura y no cambia la semántica funcional del modelo.

Este script es READ-ONLY.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @campaign_code VARCHAR(20) = '2026-08';
DECLARE @calendar_year INT = 2026;
DECLARE @expected_national_holidays INT = 16;

DECLARE @client_key INT;
DECLARE @campaign_key INT;

SELECT @client_key = c.client_key
FROM analytics.dim_client AS c
WHERE c.crm_client_id = @crm_client_id;

SELECT @campaign_key = c.campaign_key
FROM analytics.dim_campaign AS c
WHERE c.client_key = @client_key
  AND c.campaign_code = @campaign_code;

DECLARE @Failures TABLE
(
    check_name VARCHAR(150) NOT NULL,
    actual_value VARCHAR(200) NULL,
    expected_value VARCHAR(200) NULL,
    detail VARCHAR(500) NULL
);

/* ============================================================
   1. OBJETOS REQUERIDOS
   ============================================================ */
DECLARE @RequiredObjects TABLE
(
    object_name SYSNAME NOT NULL,
    object_type VARCHAR(2) NOT NULL
);

INSERT INTO @RequiredObjects(object_name, object_type)
VALUES
    ('analytics.dim_client', 'U'),
    ('analytics.dim_campaign', 'U'),
    ('analytics.dim_portfolio', 'U'),
    ('analytics.dim_advisor', 'U'),
    ('analytics.dim_supervisor', 'U'),
    ('analytics.bridge_supervisor_advisor', 'U'),
    ('analytics.dim_date', 'U'),
    ('analytics.ref_business_holiday', 'U'),
    ('analytics.fact_portfolio_daily', 'U'),
    ('analytics.fact_debtor_contact_daily', 'U'),
    ('analytics.fact_debtor_payment_daily', 'U'),
    ('analytics.fact_advisor_daily', 'U'),
    ('analytics.fact_advisor_debtor_contact_daily', 'U'),
    ('analytics.fact_advisor_debtor_payment_daily', 'U'),
    ('analytics.fact_promise', 'U'),
    ('analytics.fact_target_monthly', 'U'),
    ('analytics.fact_portfolio_evolution_daily', 'U'),
    ('analytics.v_portfolio_daily_metrics', 'V'),
    ('analytics.v_campaign_daily_summary', 'V'),
    ('analytics.v_advisor_daily_metrics', 'V'),
    ('analytics.v_promise_operational', 'V'),
    ('analytics.v_campaign_target_progress', 'V'),
    ('analytics.v_portfolio_evolution_daily', 'V'),
    ('analytics.v_campaign_evolution_daily', 'V'),
    ('analytics.v_advisor_supervisor_current', 'V'),
    ('analytics.v_supervisor_advisor_daily_attribution', 'V'),
    ('analytics.v_supervisor_debtor_contact_daily', 'V'),
    ('analytics.v_supervisor_debtor_payment_daily', 'V'),
    ('analytics.v_supervisor_promise_operational', 'V'),
    ('etl.usp_load_claro_portfolio_snapshot', 'P'),
    ('etl.usp_load_claro_live_operations', 'P'),
    ('etl.usp_load_claro_advisor_daily', 'P'),
    ('etl.usp_load_claro_supervisor_hierarchy', 'P'),
    ('etl.usp_load_claro_target_monthly', 'P'),
    ('etl.usp_load_claro_portfolio_evolution', 'P');

INSERT INTO @Failures(check_name, actual_value, expected_value, detail)
SELECT
    CONCAT('required_object:', r.object_name),
    'MISSING',
    'PRESENT',
    CONCAT('Falta objeto requerido de tipo ', r.object_type, '.')
FROM @RequiredObjects AS r
WHERE OBJECT_ID(r.object_name, r.object_type) IS NULL;

IF @client_key IS NULL
BEGIN
    INSERT INTO @Failures VALUES
    ('client_scope', NULL, CONCAT('crm_client_id=', @crm_client_id), 'No existe el cliente Analytics esperado.');
END;

IF @campaign_key IS NULL
BEGIN
    INSERT INTO @Failures VALUES
    ('campaign_scope', NULL, @campaign_code, 'No existe la campaña Analytics esperada para el cliente.');
END;

/* Si falta el scope, devolver objetos/fallos sin ejecutar checks dependientes. */
IF @client_key IS NOT NULL AND @campaign_key IS NOT NULL
BEGIN
    /* ========================================================
       2. WATERMARKS FUNCIONALES
       ======================================================== */
    DECLARE @RequiredWatermarks TABLE(source_code VARCHAR(100) NOT NULL);

    INSERT INTO @RequiredWatermarks(source_code)
    VALUES
        ('CLARO_PORTFOLIO_SNAPSHOT'),
        ('GESTION_COB2_LIVE'),
        ('CLARO_ADVISOR_DAILY'),
        ('CLARO_SUPERVISOR_HIERARCHY'),
        ('CLARO_TARGET_MONTHLY'),
        ('CLARO_EVOLUTION_DAILY');

    INSERT INTO @Failures(check_name, actual_value, expected_value, detail)
    SELECT
        CONCAT('watermark:', r.source_code),
        CASE WHEN w.source_code IS NULL THEN 'MISSING' ELSE 'INCOMPLETE' END,
        'last_success_at + last_source_datetime',
        'El proceso requerido no tiene watermark funcional completo.'
    FROM @RequiredWatermarks AS r
    LEFT JOIN etl.watermark AS w
        ON w.source_code = r.source_code
    WHERE w.source_code IS NULL
       OR w.last_success_at IS NULL
       OR w.last_source_datetime IS NULL;

    /* ========================================================
       3. SNAPSHOT / LIVE / GRAINS EXACTOS
       ======================================================== */
    DECLARE @portfolio_count INT =
    (
        SELECT COUNT(DISTINCT f.portfolio_key)
        FROM analytics.fact_portfolio_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    DECLARE @real_snapshot_rows INT =
    (
        SELECT COUNT(*)
        FROM analytics.fact_portfolio_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND f.has_source_snapshot = 1
    );

    DECLARE @live_rows INT =
    (
        SELECT COUNT(*)
        FROM analytics.fact_portfolio_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND (
                f.management_events_day <> 0
             OR f.promises_count_day <> 0
             OR f.recovered_amount_day <> 0
          )
    );

    DECLARE @portfolio_contact_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_debtor_contact_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    DECLARE @portfolio_payer_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_debtor_payment_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    IF ISNULL(@portfolio_count, 0) = 0
        INSERT INTO @Failures VALUES ('portfolio_scope_rows', '0', '> 0', 'No existen carteras materializadas para la campaña.');

    IF ISNULL(@real_snapshot_rows, 0) = 0
        INSERT INTO @Failures VALUES ('real_snapshot_rows', '0', '> 0', 'No existe ningún snapshot real para la campaña.');

    IF ISNULL(@live_rows, 0) = 0
        INSERT INTO @Failures VALUES ('live_flow_rows', '0', '> 0', 'No existen flows LIVE materializados para la campaña.');

    IF ISNULL(@portfolio_contact_rows, 0) = 0
        INSERT INTO @Failures VALUES ('portfolio_contact_detail', '0', '> 0', 'Falta grain exacto de contacto Portfolio.');

    IF ISNULL(@portfolio_payer_rows, 0) = 0
        INSERT INTO @Failures VALUES ('portfolio_payer_detail', '0', '> 0', 'Falta grain exacto de pagadores Portfolio.');

    DECLARE @invalid_snapshot_presence BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_portfolio_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND (
                (f.has_source_snapshot = 1 AND CONVERT(DATE, f.source_as_of_at) <> d.calendar_date)
             OR (f.has_source_snapshot = 0 AND f.source_as_of_at IS NOT NULL AND CONVERT(DATE, f.source_as_of_at) = d.calendar_date)
          )
    );

    IF @invalid_snapshot_presence <> 0
        INSERT INTO @Failures VALUES
        ('snapshot_presence_semantics', CONVERT(VARCHAR(50), @invalid_snapshot_presence), '0', 'Hay filas cuya marca has_source_snapshot contradice source_as_of_at/date_key.');

    /* ========================================================
       4. PROMESAS / ASESOR
       ======================================================== */
    DECLARE @valid_promises BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_promise AS p
        WHERE p.client_key = @client_key
          AND p.campaign_key = @campaign_key
          AND p.is_valid_promise = 1
    );

    DECLARE @advisor_daily_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_advisor_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    DECLARE @advisor_contact_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_advisor_debtor_contact_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    DECLARE @advisor_payer_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_advisor_debtor_payment_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
    );

    IF ISNULL(@valid_promises, 0) = 0
        INSERT INTO @Failures VALUES ('valid_promises', '0', '> 0', 'No hay promesas válidas materializadas para la campaña.');

    IF ISNULL(@advisor_daily_rows, 0) = 0
        INSERT INTO @Failures VALUES ('advisor_daily_rows', '0', '> 0', 'No hay productividad diaria de asesor.');

    IF ISNULL(@advisor_contact_rows, 0) = 0
        INSERT INTO @Failures VALUES ('advisor_contact_detail', '0', '> 0', 'Falta grain exacto asesor-deudor-contacto.');

    IF ISNULL(@advisor_payer_rows, 0) = 0
        INSERT INTO @Failures VALUES ('advisor_payer_detail', '0', '> 0', 'Falta grain exacto asesor-deudor-pago.');

    /* Frescura informativa: puede haber nuevas promesas LIVE aún no enriquecidas
       si ADVISOR no corrió después de LIVE. Se reporta, pero no cambia el gate
       funcional porque el proceso y la preservación ya están validados. */
    DECLARE @valid_promises_without_advisor BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_promise AS p
        WHERE p.client_key = @client_key
          AND p.campaign_key = @campaign_key
          AND p.is_valid_promise = 1
          AND p.advisor_key IS NULL
    );

    /* ========================================================
       5. SUPERVISOR
       ======================================================== */
    DECLARE @current_supervisor_links INT =
    (
        SELECT COUNT(*)
        FROM analytics.bridge_supervisor_advisor AS b
        INNER JOIN analytics.dim_advisor AS a
            ON a.advisor_key = b.advisor_key
        WHERE a.client_key = @client_key
          AND b.is_current = 1
    );

    DECLARE @overlapping_supervisor_periods INT =
    (
        SELECT COUNT(*)
        FROM analytics.bridge_supervisor_advisor AS a
        INNER JOIN analytics.bridge_supervisor_advisor AS b
            ON b.advisor_key = a.advisor_key
           AND b.supervisor_advisor_key > a.supervisor_advisor_key
           AND b.valid_from <= ISNULL(a.valid_to, CONVERT(DATE, '99991231', 112))
           AND a.valid_from <= ISNULL(b.valid_to, CONVERT(DATE, '99991231', 112))
        INNER JOIN analytics.dim_advisor AS da
            ON da.advisor_key = a.advisor_key
        WHERE da.client_key = @client_key
    );

    IF ISNULL(@current_supervisor_links, 0) = 0
        INSERT INTO @Failures VALUES ('supervisor_current_links', '0', '> 0', 'No existe ninguna relación current supervisor-asesor.');

    IF @overlapping_supervisor_periods <> 0
        INSERT INTO @Failures VALUES
        ('supervisor_period_overlap', CONVERT(VARCHAR(50), @overlapping_supervisor_periods), '0', 'Hay periodos históricos de supervisor solapados para un asesor.');

    /* ========================================================
       6. TARGET / CALENDARIO / EVOLUCIÓN
       ======================================================== */
    DECLARE @campaign_target_rows INT =
    (
        SELECT COUNT(*)
        FROM analytics.fact_target_monthly AS t
        WHERE t.client_key = @client_key
          AND t.campaign_key = @campaign_key
          AND t.portfolio_key IS NULL
          AND t.target_recovered_amount > 0
    );

    DECLARE @target_curve_rows INT =
    (
        SELECT COUNT(*)
        FROM analytics.v_campaign_target_progress AS t
        WHERE t.client_key = @client_key
          AND t.campaign_key = @campaign_key
          AND t.target_recovered_amount IS NOT NULL
    );

    DECLARE @evolution_rows BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_portfolio_evolution_daily AS e
        WHERE e.client_key = @client_key
          AND e.campaign_key = @campaign_key
    );

    DECLARE @evolution_days INT =
    (
        SELECT COUNT(DISTINCT e.date_key)
        FROM analytics.fact_portfolio_evolution_daily AS e
        WHERE e.client_key = @client_key
          AND e.campaign_key = @campaign_key
    );

    DECLARE @evolution_balance_violations BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM analytics.fact_portfolio_evolution_daily AS e
        WHERE e.client_key = @client_key
          AND e.campaign_key = @campaign_key
          AND (
                e.managed_clients < 0
             OR e.assigned_clients < e.managed_clients
             OR e.pending_clients <> e.assigned_clients - e.managed_clients
          )
    );

    DECLARE @holiday_rows INT =
    (
        SELECT COUNT(*)
        FROM analytics.ref_business_holiday AS h
        WHERE h.country_code = 'PE'
          AND h.holiday_scope = 'NATIONAL'
          AND YEAR(h.holiday_date) = @calendar_year
    );

    DECLARE @holiday_dim_mismatches INT =
    (
        SELECT COUNT(*)
        FROM analytics.ref_business_holiday AS h
        LEFT JOIN analytics.dim_date AS d
            ON d.calendar_date = h.holiday_date
        WHERE h.country_code = 'PE'
          AND h.holiday_scope = 'NATIONAL'
          AND YEAR(h.holiday_date) = @calendar_year
          AND (d.date_key IS NULL OR d.is_holiday <> 1 OR d.is_business_day <> 0)
    );

    IF @campaign_target_rows <> 1
        INSERT INTO @Failures VALUES
        ('campaign_target_rows', CONVERT(VARCHAR(50), @campaign_target_rows), '1', 'La campaña debe tener una única meta campaign-level vigente.');

    IF ISNULL(@target_curve_rows, 0) = 0
        INSERT INTO @Failures VALUES ('target_curve_rows', '0', '> 0', 'La curva esperada no produce filas con meta.');

    IF ISNULL(@evolution_rows, 0) = 0 OR ISNULL(@evolution_days, 0) = 0
        INSERT INTO @Failures VALUES ('evolution_rows', CONVERT(VARCHAR(50), ISNULL(@evolution_rows, 0)), '> 0', 'No existe evolución histórica materializada.');

    IF @evolution_balance_violations <> 0
        INSERT INTO @Failures VALUES
        ('evolution_balance', CONVERT(VARCHAR(50), @evolution_balance_violations), '0', 'Hay filas EVOL con balance assigned/managed/pending inválido.');

    IF @holiday_rows <> @expected_national_holidays
        INSERT INTO @Failures VALUES
        ('national_holidays', CONVERT(VARCHAR(50), @holiday_rows), CONVERT(VARCHAR(50), @expected_national_holidays), 'Cantidad inesperada de feriados nacionales del calendario V1.');

    IF @holiday_dim_mismatches <> 0
        INSERT INTO @Failures VALUES
        ('holiday_dim_application', CONVERT(VARCHAR(50), @holiday_dim_mismatches), '0', 'Hay feriados de referencia no aplicados correctamente a dim_date.');

    /* ========================================================
       7. GUARDRAILS DE CONTRATO ASESOR / SUPERVISOR
       ======================================================== */
    DECLARE @forbidden_advisor_metric_columns INT =
    (
        SELECT COUNT(*)
        FROM sys.columns AS c
        WHERE c.object_id = OBJECT_ID('analytics.v_advisor_daily_metrics')
          AND LOWER(c.name) IN
          (
              'assigned_clients', 'assigned_amount', 'pending_clients',
              'progress_rate', 'contactability_rate', 'target_amount',
              'monthly_target', 'expected_to_date', 'pace_achievement_rate',
              'gap_amount', 'gap_rate'
          )
    );

    DECLARE @forbidden_supervisor_metric_columns INT =
    (
        SELECT COUNT(*)
        FROM sys.columns AS c
        WHERE c.object_id IN
        (
            OBJECT_ID('analytics.v_supervisor_advisor_daily_attribution'),
            OBJECT_ID('analytics.v_supervisor_debtor_contact_daily'),
            OBJECT_ID('analytics.v_supervisor_debtor_payment_daily'),
            OBJECT_ID('analytics.v_supervisor_promise_operational')
        )
          AND LOWER(c.name) IN
          (
              'assigned_portfolio', 'assigned_clients', 'assigned_amount',
              'pending_portfolio', 'pending_clients', 'progress_rate',
              'contactability_rate', 'target_amount', 'monthly_target',
              'expected_to_date', 'pace_achievement_rate', 'gap_amount',
              'gap_rate'
          )
    );

    IF @forbidden_advisor_metric_columns <> 0
        INSERT INTO @Failures VALUES
        ('advisor_forbidden_metrics', CONVERT(VARCHAR(50), @forbidden_advisor_metric_columns), '0', 'El contrato SQL de asesor expone métricas sin denominador canonical.');

    IF @forbidden_supervisor_metric_columns <> 0
        INSERT INTO @Failures VALUES
        ('supervisor_forbidden_metrics', CONVERT(VARCHAR(50), @forbidden_supervisor_metric_columns), '0', 'El contrato SQL de supervisor expone cartera/meta no atribuible.');

    /* ========================================================
       8. RESUMEN DE FRESCURA / COBERTURA
       ======================================================== */
    SELECT
        @campaign_code AS campaign_code,
        @portfolio_count AS portfolios,
        @real_snapshot_rows AS real_snapshot_rows,
        @live_rows AS live_flow_rows,
        @portfolio_contact_rows AS portfolio_contact_detail_rows,
        @portfolio_payer_rows AS portfolio_payer_detail_rows,
        @valid_promises AS valid_promises,
        @valid_promises_without_advisor AS valid_promises_without_advisor,
        @advisor_daily_rows AS advisor_daily_rows,
        @advisor_contact_rows AS advisor_contact_detail_rows,
        @advisor_payer_rows AS advisor_payer_detail_rows,
        @current_supervisor_links AS current_supervisor_links,
        @campaign_target_rows AS campaign_target_rows,
        @target_curve_rows AS target_curve_rows,
        @evolution_rows AS evolution_rows,
        @evolution_days AS evolution_days,
        @holiday_rows AS national_holidays;

    SELECT
        w.source_code,
        w.last_success_at,
        w.last_source_datetime,
        w.last_source_id,
        w.updated_at
    FROM etl.watermark AS w
    INNER JOIN @RequiredWatermarks AS r
        ON r.source_code = w.source_code
    ORDER BY w.source_code;
END;

/* ============================================================
   9. RESULTADO CONSOLIDADO
   ============================================================ */
SELECT
    check_name,
    actual_value,
    expected_value,
    detail
FROM @Failures
ORDER BY check_name;

DECLARE @failure_count INT = (SELECT COUNT(*) FROM @Failures);

SELECT
    @crm_client_id AS crm_client_id,
    @campaign_code AS campaign_code,
    @calendar_year AS calendar_year,
    @failure_count AS functional_failures,
    CASE WHEN @failure_count = 0 THEN 'OK' ELSE 'REVIEW' END AS functional_assessment,
    'SUPERVISOR_TRANSPORT_SCHEDULING_PENDING_INFRASTRUCTURE' AS operational_note;

IF @failure_count > 0
BEGIN
    THROW 51990, 'ETAPA 6 no supera el gate funcional de readiness. Revise los checks devueltos.', 1;
END;
