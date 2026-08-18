/*
Portfolio Control Center - ETAPA 6
Validación de pagadores exactos Portfolio en rangos multi-día

PRECONDICIONES:
- 012_portfolio_v1_payer_range_support.sql aplicado.
- etl.usp_load_claro_live_operations actualizado.

La validación:
1. ejecuta LIVE;
2. compara el grain fecha + cartera + deudor pagador contra GESTION-COB2;
3. concilia payers_count_day;
4. valida el distinct exacto multi-día;
5. ejecuta LIVE otra vez para comprobar idempotencia funcional.

Las filas "Pago Sin Promesa" se incluyen deliberadamente: representan pago y
pagador Portfolio aunque no sean gestión/contacto/promesa.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @source_client_name VARCHAR(150) = 'CLARO CORPORATIVO';
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
    THROW 52200, 'Cliente/campaña no encontrados en Analytics.', 1;

IF OBJECT_ID('analytics.fact_debtor_payment_daily', 'U') IS NULL
    THROW 52201, 'Falta analytics.fact_debtor_payment_daily. Ejecute 012 primero.', 1;


/* ============================================================
   1. Firma de fuente antes de la prueba
   ============================================================ */

DECLARE @source_rows_before BIGINT;
DECLARE @source_max_updated_before DATETIME2(3);

SELECT
    @source_rows_before = COUNT_BIG(*),
    @source_max_updated_before = MAX(CONVERT(DATETIME2(3), g.ultima_fecha_registro))
FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.portfolio_name COLLATE DATABASE_DEFAULT
       = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
      = @source_client_name COLLATE DATABASE_DEFAULT
  AND g.anio = @campaign_year
  AND g.nCampCar = @campaign_month
  AND g.dDocCobOpe_FecIni >= @campaign_start
  AND g.dDocCobOpe_FecIni < @end_exclusive;


PRINT '============================================================';
PRINT '2. EJECUTAR LIVE #1';
PRINT '============================================================';

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month,
    @source_client_name = @source_client_name;


/* ============================================================
   3. Baseline Analytics después de LIVE #1
   ============================================================ */

IF OBJECT_ID('tempdb..#AfterFirstPayer') IS NOT NULL
    DROP TABLE #AfterFirstPayer;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.source_debtor_id
INTO #AfterFirstPayer
FROM analytics.fact_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

DECLARE @after_first_payer_rows BIGINT;
SELECT @after_first_payer_rows = COUNT_BIG(*) FROM #AfterFirstPayer;

IF @after_first_payer_rows = 0
    THROW 52202, 'La fact de pagadores Portfolio quedó vacía.', 1;


/* ============================================================
   4. Fuente canonical de pagadores Portfolio
   ============================================================ */

DECLARE @source_paid_rows_without_debtor BIGINT;

SELECT @source_paid_rows_without_debtor = COUNT_BIG(*)
FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.portfolio_name COLLATE DATABASE_DEFAULT
       = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
      = @source_client_name COLLATE DATABASE_DEFAULT
  AND g.anio = @campaign_year
  AND g.nCampCar = @campaign_month
  AND g.dDocCobOpe_FecIni >= @campaign_start
  AND g.dDocCobOpe_FecIni < @end_exclusive
  AND CONVERT(DECIMAL(19,4), ISNULL(g.total_pagado, 0)) > 0
  AND g.nId_PersDeudor IS NULL;

IF @source_paid_rows_without_debtor > 0
    THROW 52203, 'La fuente tiene pagos sin nId_PersDeudor.', 1;

IF OBJECT_ID('tempdb..#SourcePayerDaily') IS NOT NULL
    DROP TABLE #SourcePayerDaily;

SELECT
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, g.dDocCobOpe_FecIni), 112)
    ) AS date_key,
    p.portfolio_key,
    CONVERT(BIGINT, g.nId_PersDeudor) AS source_debtor_id
INTO #SourcePayerDaily
FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.portfolio_name COLLATE DATABASE_DEFAULT
       = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
      = @source_client_name COLLATE DATABASE_DEFAULT
  AND g.anio = @campaign_year
  AND g.nCampCar = @campaign_month
  AND g.dDocCobOpe_FecIni >= @campaign_start
  AND g.dDocCobOpe_FecIni < @end_exclusive
  AND CONVERT(DECIMAL(19,4), ISNULL(g.total_pagado, 0)) > 0
GROUP BY
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, g.dDocCobOpe_FecIni), 112)
    ),
    p.portfolio_key,
    CONVERT(BIGINT, g.nId_PersDeudor);

CREATE UNIQUE INDEX UX_SourcePayerDaily_Grain
    ON #SourcePayerDaily(date_key, portfolio_key, source_debtor_id);


/* ============================================================
   5. Grain SOURCE vs ANALYTICS
   ============================================================ */

DECLARE @payer_grain_differences BIGINT;

;WITH SourceMinusAnalytics AS
(
    SELECT date_key, portfolio_key, source_debtor_id
    FROM #SourcePayerDaily
    EXCEPT
    SELECT date_key, portfolio_key, source_debtor_id
    FROM #AfterFirstPayer
),
AnalyticsMinusSource AS
(
    SELECT date_key, portfolio_key, source_debtor_id
    FROM #AfterFirstPayer
    EXCEPT
    SELECT date_key, portfolio_key, source_debtor_id
    FROM #SourcePayerDaily
),
Differences AS
(
    SELECT * FROM SourceMinusAnalytics
    UNION ALL
    SELECT * FROM AnalyticsMinusSource
)
SELECT @payer_grain_differences = COUNT_BIG(*)
FROM Differences;

SELECT
    (SELECT COUNT_BIG(*) FROM #SourcePayerDaily) AS source_payer_rows,
    @after_first_payer_rows AS analytics_payer_rows,
    @payer_grain_differences AS payer_grain_differences;


/* ============================================================
   6. Consistencia diaria con fact_portfolio_daily
   ============================================================ */

IF OBJECT_ID('tempdb..#PayerDailyAgg') IS NOT NULL
    DROP TABLE #PayerDailyAgg;

SELECT
    p.date_key,
    p.portfolio_key,
    COUNT_BIG(*) AS payers_count
INTO #PayerDailyAgg
FROM #AfterFirstPayer AS p
GROUP BY
    p.date_key,
    p.portfolio_key;

IF OBJECT_ID('tempdb..#FactDailyPayer') IS NOT NULL
    DROP TABLE #FactDailyPayer;

SELECT
    f.date_key,
    f.portfolio_key,
    CONVERT(BIGINT, f.payers_count_day) AS payers_count
INTO #FactDailyPayer
FROM analytics.fact_portfolio_daily AS f
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
        COALESCE(d.portfolio_key, f.portfolio_key) AS portfolio_key
    FROM #PayerDailyAgg AS d
    FULL OUTER JOIN #FactDailyPayer AS f
        ON f.date_key = d.date_key
       AND f.portfolio_key = d.portfolio_key
    WHERE ISNULL(d.payers_count, 0) <> ISNULL(f.payers_count, 0)
)
SELECT @daily_payer_differences = COUNT_BIG(*)
FROM Differences;

SELECT @daily_payer_differences AS daily_payer_differences;


/* ============================================================
   7. Distinct exacto multi-día Portfolio
   ============================================================ */

IF OBJECT_ID('tempdb..#SourceRangePayer') IS NOT NULL
    DROP TABLE #SourceRangePayer;

SELECT
    portfolio_key,
    source_debtor_id
INTO #SourceRangePayer
FROM #SourcePayerDaily
GROUP BY
    portfolio_key,
    source_debtor_id;

IF OBJECT_ID('tempdb..#AnalyticsRangePayer') IS NOT NULL
    DROP TABLE #AnalyticsRangePayer;

SELECT
    portfolio_key,
    source_debtor_id
INTO #AnalyticsRangePayer
FROM #AfterFirstPayer
GROUP BY
    portfolio_key,
    source_debtor_id;

IF OBJECT_ID('tempdb..#SourceRangeCount') IS NOT NULL
    DROP TABLE #SourceRangeCount;

SELECT portfolio_key, COUNT_BIG(*) AS payers_count
INTO #SourceRangeCount
FROM #SourceRangePayer
GROUP BY portfolio_key;

IF OBJECT_ID('tempdb..#AnalyticsRangeCount') IS NOT NULL
    DROP TABLE #AnalyticsRangeCount;

SELECT portfolio_key, COUNT_BIG(*) AS payers_count
INTO #AnalyticsRangeCount
FROM #AnalyticsRangePayer
GROUP BY portfolio_key;

DECLARE @range_payer_differences BIGINT;

SELECT @range_payer_differences = COUNT_BIG(*)
FROM
(
    SELECT
        COALESCE(s.portfolio_key, a.portfolio_key) AS portfolio_key,
        ISNULL(s.payers_count, 0) AS source_payers_count,
        ISNULL(a.payers_count, 0) AS analytics_payers_count
    FROM #SourceRangeCount AS s
    FULL OUTER JOIN #AnalyticsRangeCount AS a
        ON a.portfolio_key = s.portfolio_key
    WHERE ISNULL(s.payers_count, 0) <> ISNULL(a.payers_count, 0)
) AS x;

SELECT
    COALESCE(s.portfolio_key, a.portfolio_key) AS portfolio_key,
    p.portfolio_name,
    ISNULL(s.payers_count, 0) AS source_exact_payers,
    ISNULL(a.payers_count, 0) AS analytics_exact_payers
FROM #SourceRangeCount AS s
FULL OUTER JOIN #AnalyticsRangeCount AS a
    ON a.portfolio_key = s.portfolio_key
LEFT JOIN analytics.dim_portfolio AS p
    ON p.portfolio_key = COALESCE(s.portfolio_key, a.portfolio_key)
ORDER BY p.portfolio_name;

DECLARE @source_campaign_exact_payers BIGINT =
    (SELECT COUNT_BIG(*) FROM #SourceRangePayer);
DECLARE @analytics_campaign_exact_payers BIGINT =
    (SELECT COUNT_BIG(*) FROM #AnalyticsRangePayer);

SELECT
    @source_campaign_exact_payers AS source_campaign_exact_payers,
    @analytics_campaign_exact_payers AS analytics_campaign_exact_payers;


/* ============================================================
   8. Diagnóstico SUM diario vs distinct exacto
   ============================================================ */

DECLARE @daily_sum_payers BIGINT;
DECLARE @multi_day_payer_pairs BIGINT;

SELECT @daily_sum_payers = SUM(CONVERT(BIGINT, f.payers_count_day))
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

SELECT @multi_day_payer_pairs = COUNT_BIG(*)
FROM
(
    SELECT portfolio_key, source_debtor_id
    FROM #AfterFirstPayer
    GROUP BY portfolio_key, source_debtor_id
    HAVING COUNT(DISTINCT date_key) > 1
) AS x;

SELECT
    ISNULL(@daily_sum_payers, 0) AS daily_sum_payers,
    @analytics_campaign_exact_payers AS exact_range_payers,
    ISNULL(@daily_sum_payers, 0) - @analytics_campaign_exact_payers
        AS overcount_if_daily_sum,
    @multi_day_payer_pairs AS multi_day_payer_pairs;


/* ============================================================
   9. LIVE #2 e idempotencia funcional
   ============================================================ */

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month,
    @source_client_name = @source_client_name;

DECLARE @source_rows_after BIGINT;
DECLARE @source_max_updated_after DATETIME2(3);

SELECT
    @source_rows_after = COUNT_BIG(*),
    @source_max_updated_after = MAX(CONVERT(DATETIME2(3), g.ultima_fecha_registro))
FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.portfolio_name COLLATE DATABASE_DEFAULT
       = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
      = @source_client_name COLLATE DATABASE_DEFAULT
  AND g.anio = @campaign_year
  AND g.nCampCar = @campaign_month
  AND g.dDocCobOpe_FecIni >= @campaign_start
  AND g.dDocCobOpe_FecIni < @end_exclusive;

DECLARE @source_changed_during_test BIT =
    CASE
        WHEN ISNULL(@source_rows_before, -1) <> ISNULL(@source_rows_after, -1)
          OR ISNULL(@source_max_updated_before, '19000101')
             <> ISNULL(@source_max_updated_after, '19000101')
            THEN 1
        ELSE 0
    END;

IF @source_changed_during_test = 1
    THROW 52204, 'La fuente cambió durante la prueba. Reejecute la validación con fuente estable.', 1;

IF OBJECT_ID('tempdb..#AfterSecondPayer') IS NOT NULL
    DROP TABLE #AfterSecondPayer;

SELECT
    f.date_key,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.source_debtor_id
INTO #AfterSecondPayer
FROM analytics.fact_debtor_payment_daily AS f
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
         AND @source_campaign_exact_payers = @analytics_campaign_exact_payers
         AND @idempotence_differences = 0
         AND @source_changed_during_test = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END;

SELECT
    @after_first_payer_rows AS debtor_payer_rows,
    @payer_grain_differences AS payer_grain_differences,
    @daily_payer_differences AS daily_payer_differences,
    @range_payer_differences AS range_payer_differences,
    @source_campaign_exact_payers AS source_campaign_exact_payers,
    @analytics_campaign_exact_payers AS analytics_campaign_exact_payers,
    @multi_day_payer_pairs AS multi_day_payer_pairs,
    @idempotence_differences AS idempotence_differences,
    @source_changed_during_test AS source_changed_during_test,
    @assessment AS assessment;

IF @assessment <> 'OK'
    THROW 52205, 'La validación de pagadores exactos Portfolio no pasó.', 1;
