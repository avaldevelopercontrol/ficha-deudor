/*
Portfolio Control Center - ETAPA 6
Validación de RPC / close rate exactos por asesor en rangos multi-día

PRECONDICIONES:
- 009_portfolio_v1_advisor_range_support.sql aplicado.
- etl.usp_load_claro_live_operations actualizado.
- etl.usp_load_claro_advisor_daily actualizado.

La validación sincroniza LIVE -> ADVISOR, compara el nuevo grain contra la
fuente, prueba exactitud multi-día y vuelve a ejecutar ADVISOR para validar
idempotencia funcional.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_at DATETIME2(3) = SYSDATETIME();
DECLARE @as_of_date DATE = CONVERT(DATE, @as_of_at);
DECLARE @campaign_year SMALLINT = YEAR(@as_of_at);
DECLARE @campaign_month TINYINT = MONTH(@as_of_at);
DECLARE @campaign_start DATE = DATEFROMPARTS(@campaign_year, @campaign_month, 1);
DECLARE @end_exclusive DATETIME2(3) =
    DATEADD(DAY, 1, CONVERT(DATETIME2(3), @as_of_date));

DECLARE @campaign_code VARCHAR(20) =
    CONCAT(
        @campaign_year,
        '-',
        RIGHT(CONCAT('0', @campaign_month), 2)
    );

DECLARE @client_key INT;
DECLARE @campaign_key INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id
  AND is_active = 1;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @client_key IS NULL OR @campaign_key IS NULL
    THROW 52000, 'Cliente/campaña no encontrados en Analytics.', 1;


PRINT '============================================================';
PRINT '1. SINCRONIZAR LIVE -> ADVISOR';
PRINT '============================================================';

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

EXEC etl.usp_load_claro_advisor_daily
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;


/* ============================================================
   2. Baseline funcional después de primera corrida ADVISOR
   ============================================================ */

IF OBJECT_ID('tempdb..#AfterFirstContact') IS NOT NULL
    DROP TABLE #AfterFirstContact;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id,
    f.had_direct_contact,
    f.had_indirect_contact,
    f.had_no_contact
INTO #AfterFirstContact
FROM analytics.fact_advisor_debtor_contact_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @after_first_contact_rows BIGINT;

SELECT @after_first_contact_rows = COUNT_BIG(*)
FROM #AfterFirstContact;

IF @after_first_contact_rows = 0
    THROW 52001, 'La nueva fact de contacto por asesor quedó vacía.', 1;


/* ============================================================
   3. Fuente canonical del mismo rango
   ============================================================ */

IF OBJECT_ID('tempdb..#Source') IS NOT NULL
    DROP TABLE #Source;

SELECT
    p.portfolio_key,
    CONVERT(INT, t.nId_Usuario) AS source_advisor_id,
    a.advisor_key,
    CONVERT(BIGINT, t.nId_PersDeudor) AS source_debtor_id,
    CONVERT(BIGINT, t.nId_DocxCobrarOpe) AS source_operation_id,
    CONVERT(DATETIME2(3), t.dDocCobOpe_FecIni) AS management_at,
    CONVERT(DATE, t.dDocCobOpe_FecIni) AS management_date,
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, t.dDocCobOpe_FecIni), 112)
    ) AS date_key,
    UPPER(LTRIM(RTRIM(ISNULL(t.indicador_equiv, '')))) AS contact_code,
    CONVERT(BIT, ISNULL(t.marca_promesa_valida, 0)) AS is_valid_promise_source,
    NULLIF(LTRIM(RTRIM(t.estado_pdp)), '') AS source_status,
    CONVERT(DECIMAL(19,4), ISNULL(t.montoPromesa, 0)) AS promise_amount
INTO #Source
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
INNER JOIN analytics.dim_advisor AS a
    ON a.client_key = @client_key
   AND a.source_advisor_id = CONVERT(VARCHAR(50), t.nId_Usuario)
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni < @end_exclusive
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%';

CREATE INDEX IX_Source_AdvisorDebtor
    ON #Source(advisor_key, portfolio_key, source_debtor_id, date_key);


IF OBJECT_ID('tempdb..#SourceContactDaily') IS NOT NULL
    DROP TABLE #SourceContactDaily;

SELECT
    s.date_key,
    s.portfolio_key,
    s.advisor_key,
    s.source_debtor_id,
    CONVERT(BIT, MAX(CASE WHEN s.contact_code = 'CD' THEN 1 ELSE 0 END))
        AS had_direct_contact,
    CONVERT(BIT, MAX(CASE WHEN s.contact_code = 'CI' THEN 1 ELSE 0 END))
        AS had_indirect_contact,
    CONVERT(BIT, MAX(CASE WHEN s.contact_code = 'NC' THEN 1 ELSE 0 END))
        AS had_no_contact
INTO #SourceContactDaily
FROM #Source AS s
GROUP BY
    s.date_key,
    s.portfolio_key,
    s.advisor_key,
    s.source_debtor_id;


/* ============================================================
   4. Grain nuevo: SOURCE vs ANALYTICS
   ============================================================ */

DECLARE @contact_grain_differences BIGINT;

;WITH Differences AS
(
    SELECT
        COALESCE(s.date_key, a.date_key) AS date_key,
        COALESCE(s.portfolio_key, a.portfolio_key) AS portfolio_key,
        COALESCE(s.advisor_key, a.advisor_key) AS advisor_key,
        COALESCE(s.source_debtor_id, a.source_debtor_id) AS source_debtor_id
    FROM #SourceContactDaily AS s
    FULL OUTER JOIN #AfterFirstContact AS a
        ON a.date_key = s.date_key
       AND a.portfolio_key = s.portfolio_key
       AND a.advisor_key = s.advisor_key
       AND a.source_debtor_id = s.source_debtor_id
    WHERE s.date_key IS NULL
       OR a.date_key IS NULL
       OR s.had_direct_contact <> a.had_direct_contact
       OR s.had_indirect_contact <> a.had_indirect_contact
       OR s.had_no_contact <> a.had_no_contact
)
SELECT @contact_grain_differences = COUNT_BIG(*)
FROM Differences;

SELECT
    (SELECT COUNT_BIG(*) FROM #SourceContactDaily) AS source_contact_rows,
    @after_first_contact_rows AS analytics_contact_rows,
    @contact_grain_differences AS contact_grain_differences;


/* ============================================================
   5. Consistencia de un día: detalle nuevo vs fact_advisor_daily
   ============================================================ */

IF OBJECT_ID('tempdb..#DetailDaily') IS NOT NULL
    DROP TABLE #DetailDaily;

SELECT
    f.date_key,
    f.portfolio_key,
    f.advisor_key,
    SUM(CASE WHEN f.had_direct_contact = 1 THEN 1 ELSE 0 END)
        AS direct_contact_clients,
    SUM(
        CASE
            WHEN f.had_direct_contact = 0
             AND f.had_indirect_contact = 1 THEN 1
            ELSE 0
        END
    ) AS indirect_contact_clients,
    SUM(
        CASE
            WHEN f.had_direct_contact = 0
             AND f.had_indirect_contact = 0
             AND f.had_no_contact = 1 THEN 1
            ELSE 0
        END
    ) AS no_contact_clients
INTO #DetailDaily
FROM #AfterFirstContact AS f
GROUP BY
    f.date_key,
    f.portfolio_key,
    f.advisor_key;

IF OBJECT_ID('tempdb..#FactDailyContact') IS NOT NULL
    DROP TABLE #FactDailyContact;

SELECT
    f.date_key,
    f.portfolio_key,
    f.advisor_key,
    f.direct_contact_clients,
    f.indirect_contact_clients,
    f.no_contact_clients
INTO #FactDailyContact
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS cal
    ON cal.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND cal.calendar_date >= @campaign_start
  AND cal.calendar_date <= @as_of_date;

DECLARE @daily_aggregate_differences BIGINT;

;WITH Differences AS
(
    SELECT
        COALESCE(d.date_key, f.date_key) AS date_key,
        COALESCE(d.portfolio_key, f.portfolio_key) AS portfolio_key,
        COALESCE(d.advisor_key, f.advisor_key) AS advisor_key
    FROM #DetailDaily AS d
    FULL OUTER JOIN #FactDailyContact AS f
        ON f.date_key = d.date_key
       AND f.portfolio_key = d.portfolio_key
       AND f.advisor_key = d.advisor_key
    WHERE d.date_key IS NULL
       OR f.date_key IS NULL
       OR ISNULL(d.direct_contact_clients, 0)
          <> ISNULL(f.direct_contact_clients, 0)
       OR ISNULL(d.indirect_contact_clients, 0)
          <> ISNULL(f.indirect_contact_clients, 0)
       OR ISNULL(d.no_contact_clients, 0)
          <> ISNULL(f.no_contact_clients, 0)
)
SELECT @daily_aggregate_differences = COUNT_BIG(*)
FROM Differences;

SELECT @daily_aggregate_differences AS daily_aggregate_differences;


/* ============================================================
   6. RPC exacto multi-día por asesor
   ============================================================ */

IF OBJECT_ID('tempdb..#SourceRangeContact') IS NOT NULL
    DROP TABLE #SourceRangeContact;

SELECT
    s.portfolio_key,
    s.advisor_key,
    s.source_debtor_id,
    MAX(CONVERT(INT, s.had_direct_contact)) AS has_cd,
    MAX(CONVERT(INT, s.had_indirect_contact)) AS has_ci,
    MAX(CONVERT(INT, s.had_no_contact)) AS has_nc
INTO #SourceRangeContact
FROM #SourceContactDaily AS s
GROUP BY
    s.portfolio_key,
    s.advisor_key,
    s.source_debtor_id;

IF OBJECT_ID('tempdb..#AnalyticsRangeContact') IS NOT NULL
    DROP TABLE #AnalyticsRangeContact;

SELECT
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id,
    MAX(CONVERT(INT, f.had_direct_contact)) AS has_cd,
    MAX(CONVERT(INT, f.had_indirect_contact)) AS has_ci,
    MAX(CONVERT(INT, f.had_no_contact)) AS has_nc
INTO #AnalyticsRangeContact
FROM #AfterFirstContact AS f
GROUP BY
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id;

IF OBJECT_ID('tempdb..#SourceRpc') IS NOT NULL
    DROP TABLE #SourceRpc;

SELECT
    advisor_key,
    SUM(CASE WHEN has_cd = 1 THEN 1 ELSE 0 END) AS direct_contact_clients,
    SUM(CASE WHEN has_cd = 1 OR has_ci = 1 OR has_nc = 1 THEN 1 ELSE 0 END)
        AS classifiable_clients
INTO #SourceRpc
FROM #SourceRangeContact
GROUP BY advisor_key;

IF OBJECT_ID('tempdb..#AnalyticsRpc') IS NOT NULL
    DROP TABLE #AnalyticsRpc;

SELECT
    advisor_key,
    SUM(CASE WHEN has_cd = 1 THEN 1 ELSE 0 END) AS direct_contact_clients,
    SUM(CASE WHEN has_cd = 1 OR has_ci = 1 OR has_nc = 1 THEN 1 ELSE 0 END)
        AS classifiable_clients
INTO #AnalyticsRpc
FROM #AnalyticsRangeContact
GROUP BY advisor_key;

DECLARE @range_rpc_differences BIGINT;

SELECT @range_rpc_differences = COUNT_BIG(*)
FROM #SourceRpc AS s
FULL OUTER JOIN #AnalyticsRpc AS a
    ON a.advisor_key = s.advisor_key
WHERE ISNULL(s.direct_contact_clients, 0) <> ISNULL(a.direct_contact_clients, 0)
   OR ISNULL(s.classifiable_clients, 0) <> ISNULL(a.classifiable_clients, 0);

SELECT
    COALESCE(s.advisor_key, a.advisor_key) AS advisor_key,
    da.advisor_name,
    ISNULL(s.direct_contact_clients, 0) AS source_direct_contact_clients,
    ISNULL(a.direct_contact_clients, 0) AS analytics_direct_contact_clients,
    ISNULL(s.classifiable_clients, 0) AS source_classifiable_clients,
    ISNULL(a.classifiable_clients, 0) AS analytics_classifiable_clients,
    CAST(
        1.0 * ISNULL(s.direct_contact_clients, 0)
        / NULLIF(ISNULL(s.classifiable_clients, 0), 0)
        AS DECIMAL(18,6)
    ) AS source_rpc_rate,
    CAST(
        1.0 * ISNULL(a.direct_contact_clients, 0)
        / NULLIF(ISNULL(a.classifiable_clients, 0), 0)
        AS DECIMAL(18,6)
    ) AS analytics_rpc_rate
FROM #SourceRpc AS s
FULL OUTER JOIN #AnalyticsRpc AS a
    ON a.advisor_key = s.advisor_key
LEFT JOIN analytics.dim_advisor AS da
    ON da.advisor_key = COALESCE(s.advisor_key, a.advisor_key)
ORDER BY da.advisor_name;


/* ============================================================
   7. Close rate exacto multi-día por asesor
   ============================================================ */

IF OBJECT_ID('tempdb..#SourcePromiseDebtor') IS NOT NULL
    DROP TABLE #SourcePromiseDebtor;

SELECT DISTINCT
    s.portfolio_key,
    s.advisor_key,
    s.source_debtor_id
INTO #SourcePromiseDebtor
FROM #Source AS s
WHERE s.is_valid_promise_source = 1
  AND s.promise_amount > 0
  AND UPPER(ISNULL(s.source_status, '')) NOT LIKE '%NO PDP%';

IF OBJECT_ID('tempdb..#AnalyticsPromiseDebtor') IS NOT NULL
    DROP TABLE #AnalyticsPromiseDebtor;

SELECT DISTINCT
    p.portfolio_key,
    p.advisor_key,
    p.source_debtor_id
INTO #AnalyticsPromiseDebtor
FROM analytics.fact_promise AS p
WHERE p.client_key = @client_key
  AND p.campaign_key = @campaign_key
  AND p.advisor_key IS NOT NULL
  AND p.is_valid_promise = 1
  AND p.management_at >= @campaign_start
  AND p.management_at < @end_exclusive;

IF OBJECT_ID('tempdb..#SourceClose') IS NOT NULL
    DROP TABLE #SourceClose;

SELECT
    advisors.advisor_key,
    ISNULL(p.valid_promise_clients, 0) AS valid_promise_clients,
    ISNULL(r.direct_contact_clients, 0) AS direct_contact_clients
INTO #SourceClose
FROM
(
    SELECT advisor_key FROM #SourceRpc
    UNION
    SELECT advisor_key FROM #SourcePromiseDebtor
) AS advisors
LEFT JOIN
(
    SELECT advisor_key, COUNT_BIG(*) AS valid_promise_clients
    FROM #SourcePromiseDebtor
    GROUP BY advisor_key
) AS p
    ON p.advisor_key = advisors.advisor_key
LEFT JOIN #SourceRpc AS r
    ON r.advisor_key = advisors.advisor_key;

IF OBJECT_ID('tempdb..#AnalyticsClose') IS NOT NULL
    DROP TABLE #AnalyticsClose;

SELECT
    advisors.advisor_key,
    ISNULL(p.valid_promise_clients, 0) AS valid_promise_clients,
    ISNULL(r.direct_contact_clients, 0) AS direct_contact_clients
INTO #AnalyticsClose
FROM
(
    SELECT advisor_key FROM #AnalyticsRpc
    UNION
    SELECT advisor_key FROM #AnalyticsPromiseDebtor
) AS advisors
LEFT JOIN
(
    SELECT advisor_key, COUNT_BIG(*) AS valid_promise_clients
    FROM #AnalyticsPromiseDebtor
    GROUP BY advisor_key
) AS p
    ON p.advisor_key = advisors.advisor_key
LEFT JOIN #AnalyticsRpc AS r
    ON r.advisor_key = advisors.advisor_key;

DECLARE @range_close_differences BIGINT;

SELECT @range_close_differences = COUNT_BIG(*)
FROM #SourceClose AS s
FULL OUTER JOIN #AnalyticsClose AS a
    ON a.advisor_key = s.advisor_key
WHERE ISNULL(s.valid_promise_clients, 0) <> ISNULL(a.valid_promise_clients, 0)
   OR ISNULL(s.direct_contact_clients, 0) <> ISNULL(a.direct_contact_clients, 0);

SELECT
    COALESCE(s.advisor_key, a.advisor_key) AS advisor_key,
    da.advisor_name,
    ISNULL(s.valid_promise_clients, 0) AS source_valid_promise_clients,
    ISNULL(a.valid_promise_clients, 0) AS analytics_valid_promise_clients,
    ISNULL(s.direct_contact_clients, 0) AS source_direct_contact_clients,
    ISNULL(a.direct_contact_clients, 0) AS analytics_direct_contact_clients,
    CAST(
        1.0 * ISNULL(s.valid_promise_clients, 0)
        / NULLIF(ISNULL(s.direct_contact_clients, 0), 0)
        AS DECIMAL(18,6)
    ) AS source_close_rate,
    CAST(
        1.0 * ISNULL(a.valid_promise_clients, 0)
        / NULLIF(ISNULL(a.direct_contact_clients, 0), 0)
        AS DECIMAL(18,6)
    ) AS analytics_close_rate
FROM #SourceClose AS s
FULL OUTER JOIN #AnalyticsClose AS a
    ON a.advisor_key = s.advisor_key
LEFT JOIN analytics.dim_advisor AS da
    ON da.advisor_key = COALESCE(s.advisor_key, a.advisor_key)
ORDER BY da.advisor_name;


/* ============================================================
   8. Diagnóstico: deudores tocados por más de un asesor

   No es error. Demuestra por qué no debemos meter advisor_key en la
   fact transversal cuyo grain es solo cartera + deudor + día.
   ============================================================ */

DECLARE @multi_advisor_debtor_pairs BIGINT;

SELECT @multi_advisor_debtor_pairs = COUNT_BIG(*)
FROM
(
    SELECT
        portfolio_key,
        source_debtor_id
    FROM #SourceRangeContact
    GROUP BY
        portfolio_key,
        source_debtor_id
    HAVING COUNT(DISTINCT advisor_key) > 1
) AS x;

SELECT @multi_advisor_debtor_pairs AS multi_advisor_debtor_pairs;


/* ============================================================
   9. Segunda ejecución ADVISOR: idempotencia funcional
   ============================================================ */

EXEC etl.usp_load_claro_advisor_daily
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

IF OBJECT_ID('tempdb..#AfterSecondContact') IS NOT NULL
    DROP TABLE #AfterSecondContact;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id,
    f.had_direct_contact,
    f.had_indirect_contact,
    f.had_no_contact
INTO #AfterSecondContact
FROM analytics.fact_advisor_debtor_contact_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @idempotence_differences BIGINT;

SELECT @idempotence_differences =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT * FROM #AfterFirstContact
            EXCEPT
            SELECT * FROM #AfterSecondContact
        ) AS x
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT * FROM #AfterSecondContact
            EXCEPT
            SELECT * FROM #AfterFirstContact
        ) AS x
    );


/* ============================================================
   10. Resultado final
   ============================================================ */

DECLARE @assessment VARCHAR(10) =
    CASE
        WHEN @contact_grain_differences = 0
         AND @daily_aggregate_differences = 0
         AND @range_rpc_differences = 0
         AND @range_close_differences = 0
         AND @idempotence_differences = 0
            THEN 'OK'
        ELSE 'FAIL'
    END;

SELECT
    @after_first_contact_rows AS advisor_debtor_contact_rows,
    @contact_grain_differences AS contact_grain_differences,
    @daily_aggregate_differences AS daily_aggregate_differences,
    @range_rpc_differences AS range_rpc_differences,
    @range_close_differences AS range_close_differences,
    @multi_advisor_debtor_pairs AS multi_advisor_debtor_pairs,
    @idempotence_differences AS idempotence_differences,
    @assessment AS assessment;

IF @assessment <> 'OK'
    THROW 52002, 'Validación de métricas exactas de asesor en rango falló.', 1;
