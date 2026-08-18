/*
Portfolio Control Center - ETAPA 6 / Avance 3
Validación de dim_advisor + fact_advisor_daily
SOLO LECTURA

Ejecutar inmediatamente después de:
    EXEC etl.usp_load_claro_advisor_daily @crm_client_id = 95;
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_date DATE = CAST(GETDATE() AS DATE);
DECLARE @campaign_year INT = YEAR(@as_of_date);
DECLARE @campaign_month INT = MONTH(@as_of_date);
DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);

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
WHERE crm_client_id = @crm_client_id;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @client_key IS NULL OR @campaign_key IS NULL
    THROW 51900, 'Cliente/campaña no encontrados en Analytics.', 1;


PRINT '============================================================';
PRINT '1. DIM_ADVISOR';
PRINT '============================================================';

SELECT
    advisor_key,
    source_advisor_id,
    advisor_document,
    advisor_name,
    role_name,
    is_active
FROM analytics.dim_advisor
WHERE client_key = @client_key
ORDER BY advisor_name;


PRINT '============================================================';
PRINT '2. SOURCE AGREGADO POR ASESOR';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#Source') IS NOT NULL
    DROP TABLE #Source;

SELECT
    p.portfolio_key,
    CONVERT(INT, t.nId_Usuario) AS source_advisor_id,
    CONVERT(BIGINT, t.nId_PersDeudor) AS source_debtor_id,
    CONVERT(DATE, t.dDocCobOpe_FecIni) AS management_date,
    CONVERT(
        INT,
        CONVERT(CHAR(8), CONVERT(DATE, t.dDocCobOpe_FecIni), 112)
    ) AS date_key,

    UPPER(LTRIM(RTRIM(ISNULL(t.indicador_equiv, ''))))
        AS contact_code,

    CONVERT(BIT, ISNULL(t.marca_promesa_valida, 0))
        AS is_valid_promise_source,

    NULLIF(LTRIM(RTRIM(t.estado_pdp)), '')
        AS source_status,

    CONVERT(DECIMAL(19,4), ISNULL(t.montoPromesa, 0))
        AS promise_amount,

    CONVERT(DECIMAL(19,4), ISNULL(t.total_pagado, 0))
        AS paid_amount

INTO #Source
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni <
      DATEADD(DAY, 1, CONVERT(DATETIME, @as_of_date))
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%';


IF OBJECT_ID('tempdb..#SourceContact') IS NOT NULL
    DROP TABLE #SourceContact;

;WITH DebtorContact AS
(
    SELECT
        date_key,
        portfolio_key,
        source_advisor_id,
        source_debtor_id,

        MAX(CASE WHEN contact_code = 'CD' THEN 1 ELSE 0 END)
            AS has_cd,

        MAX(CASE WHEN contact_code = 'CI' THEN 1 ELSE 0 END)
            AS has_ci,

        MAX(CASE WHEN contact_code = 'NC' THEN 1 ELSE 0 END)
            AS has_nc

    FROM #Source
    GROUP BY
        date_key,
        portfolio_key,
        source_advisor_id,
        source_debtor_id
)
SELECT
    source_advisor_id,
    SUM(CASE WHEN has_cd = 1 THEN 1 ELSE 0 END)
        AS direct_contact_clients,

    SUM(
        CASE
            WHEN has_cd = 0 AND has_ci = 1 THEN 1
            ELSE 0
        END
    ) AS indirect_contact_clients,

    SUM(
        CASE
            WHEN has_cd = 0 AND has_ci = 0 AND has_nc = 1 THEN 1
            ELSE 0
        END
    ) AS no_contact_clients
INTO #SourceContact
FROM DebtorContact
GROUP BY source_advisor_id;


IF OBJECT_ID('tempdb..#SourceAdvisor') IS NOT NULL
    DROP TABLE #SourceAdvisor;

SELECT
    s.source_advisor_id,

    COUNT_BIG(*) AS management_events,

    SUM(
        CASE
            WHEN s.is_valid_promise_source = 1
             AND s.promise_amount > 0
             AND UPPER(ISNULL(s.source_status, ''))
                 NOT LIKE '%NO PDP%'
                THEN 1
            ELSE 0
        END
    ) AS promises_count,

    SUM(
        CASE
            WHEN s.is_valid_promise_source = 1
             AND s.promise_amount > 0
             AND UPPER(ISNULL(s.source_status, ''))
                 NOT LIKE '%NO PDP%'
                THEN s.promise_amount
            ELSE CONVERT(DECIMAL(19,4), 0)
        END
    ) AS promises_amount,

    SUM(s.paid_amount) AS recovered_amount

INTO #SourceAdvisor
FROM #Source AS s
GROUP BY s.source_advisor_id;


SELECT
    a.source_advisor_id,
    d.advisor_name,

    a.management_events,
    ISNULL(c.direct_contact_clients, 0) AS direct_contact_clients,
    ISNULL(c.indirect_contact_clients, 0) AS indirect_contact_clients,
    ISNULL(c.no_contact_clients, 0) AS no_contact_clients,

    a.promises_count,
    a.promises_amount,
    a.recovered_amount

FROM #SourceAdvisor AS a
LEFT JOIN #SourceContact AS c
    ON c.source_advisor_id = a.source_advisor_id
LEFT JOIN analytics.dim_advisor AS d
    ON d.client_key = @client_key
   AND d.source_advisor_id =
       CONVERT(VARCHAR(50), a.source_advisor_id)
ORDER BY d.advisor_name;


PRINT '============================================================';
PRINT '3. ANALYTICS AGREGADO POR ASESOR';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#AnalyticsAdvisor') IS NOT NULL
    DROP TABLE #AnalyticsAdvisor;

SELECT
    a.source_advisor_id,
    a.advisor_name,

    SUM(f.management_events) AS management_events,
    SUM(f.direct_contact_clients) AS direct_contact_clients,
    SUM(f.indirect_contact_clients) AS indirect_contact_clients,
    SUM(f.no_contact_clients) AS no_contact_clients,

    SUM(f.promises_count) AS promises_count,
    SUM(f.promises_amount) AS promises_amount,
    SUM(f.recovered_amount) AS recovered_amount

INTO #AnalyticsAdvisor
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date
GROUP BY
    a.source_advisor_id,
    a.advisor_name;

SELECT *
FROM #AnalyticsAdvisor
ORDER BY advisor_name;


PRINT '============================================================';
PRINT '4. DIFERENCIAS SOURCE VS ANALYTICS';
PRINT '============================================================';

SELECT
    COALESCE(
        CONVERT(VARCHAR(50), s.source_advisor_id),
        a.source_advisor_id
    ) AS source_advisor_id,

    COALESCE(a.advisor_name, d.advisor_name) AS advisor_name,

    ISNULL(s.management_events, 0)
        - ISNULL(a.management_events, 0)
        AS diff_management_events,

    ISNULL(c.direct_contact_clients, 0)
        - ISNULL(a.direct_contact_clients, 0)
        AS diff_direct_contact_clients,

    ISNULL(c.indirect_contact_clients, 0)
        - ISNULL(a.indirect_contact_clients, 0)
        AS diff_indirect_contact_clients,

    ISNULL(c.no_contact_clients, 0)
        - ISNULL(a.no_contact_clients, 0)
        AS diff_no_contact_clients,

    ISNULL(s.promises_count, 0)
        - ISNULL(a.promises_count, 0)
        AS diff_promises_count,

    CONVERT(
        DECIMAL(19,4),
        ISNULL(s.promises_amount, 0)
        - ISNULL(a.promises_amount, 0)
    ) AS diff_promises_amount,

    CONVERT(
        DECIMAL(19,4),
        ISNULL(s.recovered_amount, 0)
        - ISNULL(a.recovered_amount, 0)
    ) AS diff_recovered_amount

FROM #SourceAdvisor AS s
LEFT JOIN #SourceContact AS c
    ON c.source_advisor_id = s.source_advisor_id
FULL OUTER JOIN #AnalyticsAdvisor AS a
    ON a.source_advisor_id =
       CONVERT(VARCHAR(50), s.source_advisor_id)
LEFT JOIN analytics.dim_advisor AS d
    ON d.client_key = @client_key
   AND d.source_advisor_id =
       CONVERT(VARCHAR(50), s.source_advisor_id)
WHERE
       ISNULL(s.management_events, 0)
       <> ISNULL(a.management_events, 0)

    OR ISNULL(c.direct_contact_clients, 0)
       <> ISNULL(a.direct_contact_clients, 0)

    OR ISNULL(c.indirect_contact_clients, 0)
       <> ISNULL(a.indirect_contact_clients, 0)

    OR ISNULL(c.no_contact_clients, 0)
       <> ISNULL(a.no_contact_clients, 0)

    OR ISNULL(s.promises_count, 0)
       <> ISNULL(a.promises_count, 0)

    OR ISNULL(s.promises_amount, 0)
       <> ISNULL(a.promises_amount, 0)

    OR ISNULL(s.recovered_amount, 0)
       <> ISNULL(a.recovered_amount, 0);


PRINT '============================================================';
PRINT '5. PROMESAS CON ASESOR';
PRINT '============================================================';

SELECT
    COUNT(*) AS valid_promises,
    SUM(CASE WHEN advisor_key IS NOT NULL THEN 1 ELSE 0 END)
        AS valid_promises_with_advisor,
    SUM(CASE WHEN advisor_key IS NULL THEN 1 ELSE 0 END)
        AS valid_promises_without_advisor
FROM analytics.fact_promise
WHERE client_key = @client_key
  AND campaign_key = @campaign_key
  AND is_valid_promise = 1;


PRINT '============================================================';
PRINT '6. RECAUDO PORTFOLIO VS RECAUDO ATRIBUIBLE A ASESOR';
PRINT '============================================================';

DECLARE @portfolio_recovered DECIMAL(19,4);
DECLARE @advisor_recovered DECIMAL(19,4);
DECLARE @payment_only_recovered DECIMAL(19,4);

SELECT @portfolio_recovered =
    SUM(f.recovered_amount_day)
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

SELECT @advisor_recovered =
    SUM(f.recovered_amount)
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_date >= @campaign_start
  AND d.calendar_date <= @as_of_date;

SELECT @payment_only_recovered =
    SUM(CONVERT(DECIMAL(19,4), ISNULL(t.total_pagado, 0)))
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni <
      DATEADD(DAY, 1, CONVERT(DATETIME, @as_of_date))
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      LIKE '%PAGO SIN PROMESA%';

SELECT
    @portfolio_recovered AS portfolio_recovered_amount,
    @advisor_recovered AS attributable_advisor_recovered_amount,
    @payment_only_recovered AS payment_only_recovered_amount,

    CONVERT(
        DECIMAL(19,4),
        ISNULL(@portfolio_recovered, 0)
        - ISNULL(@advisor_recovered, 0)
    ) AS portfolio_minus_advisor,

    CONVERT(
        DECIMAL(19,4),
        ISNULL(@portfolio_recovered, 0)
        - ISNULL(@advisor_recovered, 0)
        - ISNULL(@payment_only_recovered, 0)
    ) AS unexplained_difference;


PRINT '============================================================';
PRINT '7. WATERMARK';
PRINT '============================================================';

SELECT *
FROM etl.watermark
WHERE source_code = 'CLARO_ADVISOR_DAILY';
