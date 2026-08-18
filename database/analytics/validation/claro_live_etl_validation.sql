/*
Portfolio Control Center - ETAPA 6 / Avance 2
Validación SOURCE vs ANALYTICS del ETL live CLARO

Ejecutar DENTRO de la base Analytics después de:
    etl.usp_load_claro_live_operations

Completar solo @crm_client_id si fuera necesario.

La comparación se hace contra la FUENTE ACTUAL, no contra la baseline antigua
de las 11:31, porque GESTION-COB2 continúa cambiando durante el día.
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_date DATE = CAST(GETDATE() AS DATE);
DECLARE @campaign_year SMALLINT = YEAR(@as_of_date);
DECLARE @campaign_month TINYINT = MONTH(@as_of_date);

DECLARE @client_key INT;
DECLARE @campaign_key INT;
DECLARE @campaign_code VARCHAR(20) =
    CONCAT(
        @campaign_year,
        '-',
        RIGHT(CONCAT('0', @campaign_month), 2)
    );

DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @client_key IS NULL OR @campaign_key IS NULL
    THROW 51400, 'Cliente/campaña no encontrados en Analytics.', 1;


PRINT '============================================================';
PRINT '1. SOURCE ACTUAL';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#SourceLive') IS NOT NULL
    DROP TABLE #SourceLive;

SELECT
    p.portfolio_key,
    CONVERT(BIGINT, g.nId_PersDeudor) AS source_debtor_id,
    UPPER(LTRIM(RTRIM(ISNULL(g.indicador_equiv, ''))))
        AS contact_code,
    CONVERT(DECIMAL(19,4), ISNULL(g.montoPromesa, 0))
        AS promise_amount,
    CONVERT(DECIMAL(19,4), ISNULL(g.total_pagado, 0))
        AS paid_amount,
    CONVERT(BIT, ISNULL(g.marca_promesa_valida, 0))
        AS source_valid_promise,
    CONVERT(
        BIT,
        CASE
            WHEN UPPER(LTRIM(RTRIM(ISNULL(g.estado_pdp, ''))))
                 LIKE '%PAGO SIN PROMESA%'
                THEN 1
            ELSE 0
        END
    ) AS is_payment_only_row,
    g.estado_pdp,
    CONVERT(DATE, g.dDocCobOpe_FecIni) AS management_date,
    CONVERT(BIGINT, g.nId_DocxCobrarOpe) AS source_operation_id,
    CONVERT(DATETIME2(3), g.ultima_fecha_registro) AS source_as_of_at
INTO #SourceLive
FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.portfolio_name COLLATE DATABASE_DEFAULT
       = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND g.anio = @campaign_year
  AND g.nCampCar = @campaign_month
  AND g.dDocCobOpe_FecIni >= @campaign_start
  AND g.dDocCobOpe_FecIni < DATEADD(DAY, 1, CONVERT(DATETIME, @as_of_date));


;WITH ContactPairs AS
(
    SELECT
        portfolio_key,
        source_debtor_id,
        MAX(CASE WHEN contact_code = 'CD' THEN 1 ELSE 0 END) AS has_cd,
        MAX(CASE WHEN contact_code = 'CI' THEN 1 ELSE 0 END) AS has_ci,
        MAX(CASE WHEN contact_code = 'NC' THEN 1 ELSE 0 END) AS has_nc
    FROM #SourceLive
    WHERE is_payment_only_row = 0
    GROUP BY
        portfolio_key,
        source_debtor_id
)
SELECT
    COUNT_BIG(*) AS source_rows,
    SUM(CASE WHEN is_payment_only_row = 0 THEN 1 ELSE 0 END)
        AS source_management_rows,
    SUM(CASE WHEN is_payment_only_row = 1 THEN 1 ELSE 0 END)
        AS source_payment_only_rows,

    (
        SELECT COUNT_BIG(*)
        FROM ContactPairs
        WHERE has_cd = 1 OR has_ci = 1 OR has_nc = 1
    ) AS classifiable_pairs,

    (
        SELECT COUNT_BIG(*)
        FROM ContactPairs
        WHERE has_cd = 1
    ) AS direct_contact_pairs,

    CAST(
        1.0 *
        (
            SELECT COUNT_BIG(*)
            FROM ContactPairs
            WHERE has_cd = 1
        )
        /
        NULLIF(
            (
                SELECT COUNT_BIG(*)
                FROM ContactPairs
                WHERE has_cd = 1 OR has_ci = 1 OR has_nc = 1
            ),
            0
        )
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    SUM(
        CASE
            WHEN source_valid_promise = 1
             AND promise_amount > 0
             AND is_payment_only_row = 0
             AND UPPER(ISNULL(estado_pdp, '')) NOT LIKE '%NO PDP%'
                THEN 1
            ELSE 0
        END
    ) AS valid_promise_rows,

    SUM(
        CASE
            WHEN source_valid_promise = 1
             AND promise_amount > 0
             AND is_payment_only_row = 0
             AND UPPER(ISNULL(estado_pdp, '')) NOT LIKE '%NO PDP%'
                THEN promise_amount
            ELSE 0
        END
    ) AS valid_promise_amount,

    SUM(paid_amount) AS recovered_amount,

    MAX(source_as_of_at) AS source_as_of_at
FROM #SourceLive;


PRINT '============================================================';
PRINT '2. ANALYTICS';
PRINT '============================================================';

;WITH ContactPairs AS
(
    SELECT
        f.portfolio_key,
        f.source_debtor_id,
        MAX(CONVERT(INT, f.had_direct_contact)) AS has_cd,
        MAX(CONVERT(INT, f.had_indirect_contact)) AS has_ci,
        MAX(CONVERT(INT, f.had_no_contact)) AS has_nc
    FROM analytics.fact_debtor_contact_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_date >= @campaign_start
      AND d.calendar_date <= @as_of_date
    GROUP BY
        f.portfolio_key,
        f.source_debtor_id
)
SELECT
    SUM(f.management_events_day) AS management_events,

    (
        SELECT COUNT_BIG(*)
        FROM ContactPairs
        WHERE has_cd = 1 OR has_ci = 1 OR has_nc = 1
    ) AS classifiable_pairs,

    (
        SELECT COUNT_BIG(*)
        FROM ContactPairs
        WHERE has_cd = 1
    ) AS direct_contact_pairs,

    CAST(
        1.0 *
        (
            SELECT COUNT_BIG(*)
            FROM ContactPairs
            WHERE has_cd = 1
        )
        /
        NULLIF(
            (
                SELECT COUNT_BIG(*)
                FROM ContactPairs
                WHERE has_cd = 1 OR has_ci = 1 OR has_nc = 1
            ),
            0
        )
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    SUM(f.promises_count_day) AS valid_promise_rows,
    SUM(f.promises_amount_day) AS valid_promise_amount,
    SUM(f.recovered_amount_day) AS recovered_amount
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;


PRINT '============================================================';
PRINT '3. PDP ANALYTICS';
PRINT '============================================================';

SELECT
    SUM(
        CASE
            WHEN is_valid_promise = 1
             AND status_code = 'DUE_TODAY'
                THEN 1 ELSE 0
        END
    ) AS due_today_count,

    SUM(
        CASE
            WHEN is_valid_promise = 1
             AND status_code = 'DUE_TODAY'
                THEN promise_amount ELSE 0
        END
    ) AS due_today_amount,

    SUM(
        CASE
            WHEN is_valid_promise = 1
             AND status_code = 'BROKEN'
                THEN 1 ELSE 0
        END
    ) AS broken_count,

    SUM(
        CASE
            WHEN is_valid_promise = 1
             AND status_code = 'BROKEN'
                THEN promise_amount ELSE 0
        END
    ) AS broken_amount,

    COUNT(*) AS promise_like_rows,
    SUM(CASE WHEN is_valid_promise = 1 THEN 1 ELSE 0 END)
        AS valid_promise_rows
FROM analytics.fact_promise
WHERE client_key = @client_key
  AND campaign_key = @campaign_key;


PRINT '============================================================';
PRINT '4. SNAPSHOT + LIVE DEL DIA ACTUAL';
PRINT '============================================================';

SELECT
    d.calendar_date,
    COUNT(*) AS portfolios,
    SUM(f.assigned_clients_snapshot) AS assigned_clients_snapshot,
    SUM(f.managed_clients_snapshot) AS managed_clients_snapshot,
    SUM(f.pending_clients_snapshot) AS pending_clients_snapshot,
    SUM(f.management_events_day) AS management_events_day,
    SUM(f.promises_count_day) AS promises_count_day,
    SUM(f.recovered_amount_day) AS recovered_amount_day,
    MAX(f.source_as_of_at) AS snapshot_source_as_of_at
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date = @as_of_date
GROUP BY d.calendar_date;


PRINT '============================================================';
PRINT '5. WATERMARK';
PRINT '============================================================';

SELECT *
FROM etl.watermark
WHERE source_code = 'GESTION_COB2_LIVE';
