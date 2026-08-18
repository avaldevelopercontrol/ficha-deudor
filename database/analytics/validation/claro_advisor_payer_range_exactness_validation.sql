/*
Portfolio Control Center - ETAPA 6
Validación de pagadores exactos por asesor en rangos multi-día

PRECONDICIONES:
- 010_portfolio_v1_advisor_payer_range_support.sql aplicado.
- etl.usp_load_claro_advisor_daily actualizado.

La validación ejecuta ADVISOR, compara el grain de pagador contra la fuente,
verifica el agregado diario, prueba el distinct exacto multi-día y vuelve a
ejecutar ADVISOR para validar idempotencia funcional.
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
    THROW 52100, 'Cliente/campaña no encontrados en Analytics.', 1;

IF OBJECT_ID('analytics.fact_advisor_debtor_payment_daily', 'U') IS NULL
    THROW 52101, 'Falta analytics.fact_advisor_debtor_payment_daily. Ejecute 010 primero.', 1;


/* ============================================================
   1. Firma de fuente para detectar cambios durante la prueba
   ============================================================ */

DECLARE @source_rows_before BIGINT;
DECLARE @source_max_updated_before DATETIME2(3);

SELECT
    @source_rows_before = COUNT_BIG(*),
    @source_max_updated_before = MAX(CONVERT(DATETIME2(3), t.fecha_proceso))
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni < @end_exclusive
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%';


PRINT '============================================================';
PRINT '2. EJECUTAR ADVISOR #1';
PRINT '============================================================';

EXEC etl.usp_load_claro_advisor_daily
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;


/* ============================================================
   3. Baseline funcional después de primera corrida
   ============================================================ */

IF OBJECT_ID('tempdb..#AfterFirstPayer') IS NOT NULL
    DROP TABLE #AfterFirstPayer;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id
INTO #AfterFirstPayer
FROM analytics.fact_advisor_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @after_first_payer_rows BIGINT;
SELECT @after_first_payer_rows = COUNT_BIG(*) FROM #AfterFirstPayer;

IF @after_first_payer_rows = 0
    THROW 52102, 'La fact de pagadores por asesor quedó vacía.', 1;


/* ============================================================
   4. Fuente canonical de pagadores atribuibles al asesor
   ============================================================ */

IF OBJECT_ID('tempdb..#SourcePayerDaily') IS NOT NULL
    DROP TABLE #SourcePayerDaily;

SELECT
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, t.dDocCobOpe_FecIni), 112)
    ) AS date_key,
    p.portfolio_key,
    a.advisor_key,
    CONVERT(BIGINT, t.nId_PersDeudor) AS source_debtor_id
INTO #SourcePayerDaily
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
      NOT LIKE '%PAGO SIN PROMESA%'
  AND CONVERT(DECIMAL(19,4), ISNULL(t.total_pagado, 0)) > 0
GROUP BY
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, t.dDocCobOpe_FecIni), 112)
    ),
    p.portfolio_key,
    a.advisor_key,
    CONVERT(BIGINT, t.nId_PersDeudor);

CREATE UNIQUE INDEX UX_SourcePayerDaily_Grain
    ON #SourcePayerDaily
    (
        date_key,
        portfolio_key,
        advisor_key,
        source_debtor_id
    );


/* ============================================================
   5. Grain SOURCE vs ANALYTICS
   ============================================================ */

DECLARE @payer_grain_differences BIGINT;

;WITH Differences AS
(
    SELECT
        COALESCE(s.date_key, a.date_key) AS date_key,
        COALESCE(s.portfolio_key, a.portfolio_key) AS portfolio_key,
        COALESCE(s.advisor_key, a.advisor_key) AS advisor_key,
        COALESCE(s.source_debtor_id, a.source_debtor_id) AS source_debtor_id
    FROM #SourcePayerDaily AS s
    FULL OUTER JOIN #AfterFirstPayer AS a
        ON a.date_key = s.date_key
       AND a.portfolio_key = s.portfolio_key
       AND a.advisor_key = s.advisor_key
       AND a.source_debtor_id = s.source_debtor_id
    WHERE s.date_key IS NULL
       OR a.date_key IS NULL
)
SELECT @payer_grain_differences = COUNT_BIG(*)
FROM Differences;

SELECT
    (SELECT COUNT_BIG(*) FROM #SourcePayerDaily) AS source_payer_rows,
    @after_first_payer_rows AS analytics_payer_rows,
    @payer_grain_differences AS payer_grain_differences;


/* ============================================================
   6. Consistencia diaria con fact_advisor_daily
   ============================================================ */

IF OBJECT_ID('tempdb..#PayerDailyAgg') IS NOT NULL
    DROP TABLE #PayerDailyAgg;

SELECT
    p.date_key,
    p.portfolio_key,
    p.advisor_key,
    COUNT_BIG(*) AS payers_count
INTO #PayerDailyAgg
FROM #AfterFirstPayer AS p
GROUP BY
    p.date_key,
    p.portfolio_key,
    p.advisor_key;

IF OBJECT_ID('tempdb..#FactDailyPayer') IS NOT NULL
    DROP TABLE #FactDailyPayer;

SELECT
    f.date_key,
    f.portfolio_key,
    f.advisor_key,
    CONVERT(BIGINT, f.payers_count) AS payers_count
INTO #FactDailyPayer
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @daily_payer_differences BIGINT;

;WITH Differences AS
(
    SELECT
        COALESCE(d.date_key, f.date_key) AS date_key,
        COALESCE(d.portfolio_key, f.portfolio_key) AS portfolio_key,
        COALESCE(d.advisor_key, f.advisor_key) AS advisor_key
    FROM #PayerDailyAgg AS d
    FULL OUTER JOIN #FactDailyPayer AS f
        ON f.date_key = d.date_key
       AND f.portfolio_key = d.portfolio_key
       AND f.advisor_key = d.advisor_key
    WHERE ISNULL(d.payers_count, 0) <> ISNULL(f.payers_count, 0)
)
SELECT @daily_payer_differences = COUNT_BIG(*)
FROM Differences;

SELECT @daily_payer_differences AS daily_payer_differences;


/* ============================================================
   7. Distinct exacto multi-día por asesor
   ============================================================ */

IF OBJECT_ID('tempdb..#SourceRangePayer') IS NOT NULL
    DROP TABLE #SourceRangePayer;

SELECT
    portfolio_key,
    advisor_key,
    source_debtor_id
INTO #SourceRangePayer
FROM #SourcePayerDaily
GROUP BY
    portfolio_key,
    advisor_key,
    source_debtor_id;

IF OBJECT_ID('tempdb..#AnalyticsRangePayer') IS NOT NULL
    DROP TABLE #AnalyticsRangePayer;

SELECT
    portfolio_key,
    advisor_key,
    source_debtor_id
INTO #AnalyticsRangePayer
FROM #AfterFirstPayer
GROUP BY
    portfolio_key,
    advisor_key,
    source_debtor_id;

IF OBJECT_ID('tempdb..#SourceRangeCount') IS NOT NULL
    DROP TABLE #SourceRangeCount;

SELECT advisor_key, COUNT_BIG(*) AS payers_count
INTO #SourceRangeCount
FROM #SourceRangePayer
GROUP BY advisor_key;

IF OBJECT_ID('tempdb..#AnalyticsRangeCount') IS NOT NULL
    DROP TABLE #AnalyticsRangeCount;

SELECT advisor_key, COUNT_BIG(*) AS payers_count
INTO #AnalyticsRangeCount
FROM #AnalyticsRangePayer
GROUP BY advisor_key;

DECLARE @range_payer_differences BIGINT;

SELECT @range_payer_differences = COUNT_BIG(*)
FROM
(
    SELECT
        COALESCE(s.advisor_key, a.advisor_key) AS advisor_key,
        ISNULL(s.payers_count, 0) AS source_payers_count,
        ISNULL(a.payers_count, 0) AS analytics_payers_count
    FROM #SourceRangeCount AS s
    FULL OUTER JOIN #AnalyticsRangeCount AS a
        ON a.advisor_key = s.advisor_key
    WHERE ISNULL(s.payers_count, 0) <> ISNULL(a.payers_count, 0)
) AS x;

SELECT
    COALESCE(s.advisor_key, an.advisor_key) AS advisor_key,
    a.advisor_name,
    ISNULL(s.payers_count, 0) AS source_exact_payers,
    ISNULL(an.payers_count, 0) AS analytics_exact_payers
FROM #SourceRangeCount AS s
FULL OUTER JOIN #AnalyticsRangeCount AS an
    ON an.advisor_key = s.advisor_key
LEFT JOIN analytics.dim_advisor AS a
    ON a.advisor_key = COALESCE(s.advisor_key, an.advisor_key)
ORDER BY a.advisor_name;


/* ============================================================
   8. Diagnóstico: SUM diario vs distinct exacto del rango
   ============================================================ */

IF OBJECT_ID('tempdb..#DailySumByAdvisor') IS NOT NULL
    DROP TABLE #DailySumByAdvisor;

SELECT
    f.advisor_key,
    SUM(CONVERT(BIGINT, f.payers_count)) AS daily_sum_payers
INTO #DailySumByAdvisor
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date
GROUP BY f.advisor_key;

SELECT
    COALESCE(ds.advisor_key, ex.advisor_key) AS advisor_key,
    a.advisor_name,
    ISNULL(ds.daily_sum_payers, 0) AS daily_sum_payers,
    ISNULL(ex.payers_count, 0) AS exact_range_payers,
    ISNULL(ds.daily_sum_payers, 0) - ISNULL(ex.payers_count, 0)
        AS overcount_if_daily_sum
FROM #DailySumByAdvisor AS ds
FULL OUTER JOIN #AnalyticsRangeCount AS ex
    ON ex.advisor_key = ds.advisor_key
LEFT JOIN analytics.dim_advisor AS a
    ON a.advisor_key = COALESCE(ds.advisor_key, ex.advisor_key)
ORDER BY a.advisor_name;

DECLARE @multi_day_payer_pairs BIGINT;
DECLARE @multi_advisor_payer_pairs BIGINT;

SELECT @multi_day_payer_pairs = COUNT_BIG(*)
FROM
(
    SELECT portfolio_key, advisor_key, source_debtor_id
    FROM #AfterFirstPayer
    GROUP BY portfolio_key, advisor_key, source_debtor_id
    HAVING COUNT(DISTINCT date_key) > 1
) AS x;

SELECT @multi_advisor_payer_pairs = COUNT_BIG(*)
FROM
(
    SELECT portfolio_key, source_debtor_id
    FROM #AfterFirstPayer
    GROUP BY portfolio_key, source_debtor_id
    HAVING COUNT(DISTINCT advisor_key) > 1
) AS x;

SELECT
    @multi_day_payer_pairs AS multi_day_payer_pairs,
    @multi_advisor_payer_pairs AS multi_advisor_payer_pairs;


/* ============================================================
   9. ADVISOR #2 e idempotencia funcional
   ============================================================ */

EXEC etl.usp_load_claro_advisor_daily
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

DECLARE @source_rows_after BIGINT;
DECLARE @source_max_updated_after DATETIME2(3);

SELECT
    @source_rows_after = COUNT_BIG(*),
    @source_max_updated_after = MAX(CONVERT(DATETIME2(3), t.fecha_proceso))
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni < @end_exclusive
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%';

DECLARE @source_changed_during_test BIT =
    CASE
        WHEN ISNULL(@source_rows_before, -1) <> ISNULL(@source_rows_after, -1)
          OR ISNULL(@source_max_updated_before, '19000101')
             <> ISNULL(@source_max_updated_after, '19000101')
            THEN 1
        ELSE 0
    END;

IF @source_changed_during_test = 1
    THROW 52103, 'La fuente cambió durante la prueba. Reejecute la validación para probar idempotencia con fuente estable.', 1;

IF OBJECT_ID('tempdb..#AfterSecondPayer') IS NOT NULL
    DROP TABLE #AfterSecondPayer;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,
    f.source_debtor_id
INTO #AfterSecondPayer
FROM analytics.fact_advisor_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @idempotence_differences BIGINT;

;WITH FirstMinusSecond AS
(
    SELECT * FROM #AfterFirstPayer
    EXCEPT
    SELECT * FROM #AfterSecondPayer
),
SecondMinusFirst AS
(
    SELECT * FROM #AfterSecondPayer
    EXCEPT
    SELECT * FROM #AfterFirstPayer
),
Differences AS
(
    SELECT * FROM FirstMinusSecond
    UNION ALL
    SELECT * FROM SecondMinusFirst
)
SELECT @idempotence_differences = COUNT_BIG(*)
FROM Differences;


/* ============================================================
   10. Resultado final
   ============================================================ */

DECLARE @assessment VARCHAR(10) =
    CASE
        WHEN @payer_grain_differences = 0
         AND @daily_payer_differences = 0
         AND @range_payer_differences = 0
         AND @idempotence_differences = 0
         AND @source_changed_during_test = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END;

SELECT
    @after_first_payer_rows AS advisor_debtor_payer_rows,
    @payer_grain_differences AS payer_grain_differences,
    @daily_payer_differences AS daily_payer_differences,
    @range_payer_differences AS range_payer_differences,
    @multi_day_payer_pairs AS multi_day_payer_pairs,
    @multi_advisor_payer_pairs AS multi_advisor_payer_pairs,
    @idempotence_differences AS idempotence_differences,
    @source_changed_during_test AS source_changed_during_test,
    @assessment AS assessment;

IF @assessment <> 'OK'
    THROW 52104, 'La validación de pagadores exactos por asesor no pasó.', 1;
