/*
Validación ETAPA 6 - EVOL CLARO

Valida:
- grain fecha + nid_cartera;
- mapping completo a dim_portfolio;
- SOURCE vs fact_portfolio_evolution_daily;
- agregado campaña por fecha;
- managed canonical como acumulado MTD de CLIENTE_GESTIONADO_NVO por cartera;
- CLIENTES_GESTIONADOS directo solo como diagnóstico legacy;
- recovered_amount de las views contra flows LIVE canonical;
- diferencia legacy EVOL vs LIVE solo como diagnóstico;
- watermark;
- idempotencia de una segunda ejecución.

No modifica fuentes legacy. Ejecuta el ETL de evolución dos veces.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

DECLARE @crm_client_id INT = 95;
DECLARE @campaign_year SMALLINT = 2026;
DECLARE @campaign_month TINYINT = 8;

DECLARE @campaign_code VARCHAR(20) =
    CONCAT(@campaign_year, '-', RIGHT(CONCAT('0', @campaign_month), 2));
DECLARE @source_campaign_code VARCHAR(15) =
    CONCAT('C-', RIGHT(CONCAT('0', @campaign_month), 2));
DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);
DECLARE @campaign_end DATE = EOMONTH(@campaign_start);

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
    THROW 51600, 'Cliente/campaña Analytics no están preparados.', 1;

/* ============================================================
   1. Baseline de fuente antes del ETL
   ============================================================ */

IF OBJECT_ID('tempdb..#SourceBaseline') IS NOT NULL
    DROP TABLE #SourceBaseline;

;WITH SourceRaw AS
(
    SELECT
        CONVERT(INT, CONVERT(CHAR(8), s.fecha, 112)) AS date_key,
        s.fecha AS calendar_date,
        s.nid_cartera AS source_portfolio_id,
        CONVERT(INT, ISNULL(s.TOTAL_CLIENTES, 0)) AS assigned_clients,
        CONVERT(INT, ISNULL(s.CLIENTES_GESTIONADOS, 0)) AS legacy_direct_managed_clients,
        CONVERT(INT, ISNULL(s.CLIENTE_GESTIONADO_NVO, 0)) AS new_managed_clients_day,
        CONVERT(DECIMAL(19,4), ISNULL(s.MONTO_DE_PAGOS, 0)) AS legacy_recovered_amount_day
    FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
    WHERE s.AñoAval = @campaign_year
      AND s.CampAval = @source_campaign_code
),
SourceNormalized AS
(
    SELECT
        r.*,
        SUM(CONVERT(BIGINT, r.new_managed_clients_day)) OVER
        (
            PARTITION BY r.source_portfolio_id
            ORDER BY r.date_key
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS managed_clients
    FROM SourceRaw AS r
)
SELECT
    date_key,
    calendar_date,
    source_portfolio_id,
    assigned_clients,
    CONVERT(INT, managed_clients) AS managed_clients,
    CONVERT(INT, assigned_clients - managed_clients) AS pending_clients,
    legacy_direct_managed_clients,
    new_managed_clients_day,
    legacy_recovered_amount_day
INTO #SourceBaseline
FROM SourceNormalized;

DECLARE @source_rows BIGINT = (SELECT COUNT_BIG(*) FROM #SourceBaseline);
DECLARE @source_days INT = (SELECT COUNT(DISTINCT date_key) FROM #SourceBaseline);
DECLARE @source_portfolios INT =
    (SELECT COUNT(DISTINCT source_portfolio_id) FROM #SourceBaseline);
DECLARE @source_assigned_checksum BIGINT =
    (SELECT SUM(CONVERT(BIGINT, assigned_clients)) FROM #SourceBaseline);
DECLARE @source_new_managed_checksum BIGINT =
    (SELECT SUM(CONVERT(BIGINT, new_managed_clients_day)) FROM #SourceBaseline);
DECLARE @source_legacy_recovery_checksum DECIMAL(38,4) =
    (SELECT SUM(CONVERT(DECIMAL(38,4), legacy_recovered_amount_day)) FROM #SourceBaseline);
DECLARE @source_max_date DATE =
    (SELECT MAX(calendar_date) FROM #SourceBaseline);

DECLARE @source_duplicate_grain_rows BIGINT =
(
    SELECT COUNT_BIG(*)
    FROM
    (
        SELECT date_key, source_portfolio_id
        FROM #SourceBaseline
        GROUP BY date_key, source_portfolio_id
        HAVING COUNT_BIG(*) <> 1
    ) AS q
);

DECLARE @source_mapping_differences BIGINT =
(
    SELECT COUNT_BIG(*)
    FROM #SourceBaseline AS s
    LEFT JOIN analytics.dim_portfolio AS p
        ON p.client_key = @client_key
       AND p.source_portfolio_id = s.source_portfolio_id
    WHERE p.portfolio_key IS NULL
);

SELECT
    @source_rows AS source_rows,
    @source_days AS source_days,
    @source_portfolios AS source_portfolios,
    @source_duplicate_grain_rows AS source_duplicate_grain_rows,
    @source_mapping_differences AS source_mapping_differences,
    MIN(calendar_date) AS first_evolution_date,
    MAX(calendar_date) AS last_evolution_date
FROM #SourceBaseline;

IF @source_rows = 0
    THROW 51601, 'EVOL no tiene filas para la campaña de validación.', 1;

IF @source_duplicate_grain_rows <> 0
    THROW 51602, 'La fuente EVOL no respeta fecha + nid_cartera.', 1;

IF @source_mapping_differences <> 0
    THROW 51603, 'Existen carteras EVOL fuera del scope de dim_portfolio.', 1;

/* ============================================================
   2. Semántica de managed

   Canonical para evolución:
       SUM(CLIENTE_GESTIONADO_NVO) MTD por nid_cartera.

   CLIENTES_GESTIONADOS directo se conserva solo como diagnóstico porque la
   ejecución real demostró que puede caer entre días y no representa la serie
   acumulada que necesita PortfolioEvolutionPoint.
   ============================================================ */

DECLARE @legacy_direct_managed_differences BIGINT =
(
    SELECT COUNT_BIG(*)
    FROM #SourceBaseline
    WHERE legacy_direct_managed_clients <> managed_clients
);

DECLARE @managed_monotonicity_violations BIGINT =
(
    SELECT COUNT_BIG(*)
    FROM
    (
        SELECT
            source_portfolio_id,
            date_key,
            managed_clients,
            LAG(managed_clients) OVER
            (
                PARTITION BY source_portfolio_id
                ORDER BY date_key
            ) AS previous_managed_clients
        FROM #SourceBaseline
    ) AS q
    WHERE previous_managed_clients IS NOT NULL
      AND managed_clients < previous_managed_clients
);

DECLARE @managed_balance_violations BIGINT =
(
    SELECT COUNT_BIG(*)
    FROM #SourceBaseline
    WHERE managed_clients < 0
       OR managed_clients > assigned_clients
       OR pending_clients <> assigned_clients - managed_clients
);

SELECT
    @legacy_direct_managed_differences AS legacy_direct_managed_differences,
    @managed_monotonicity_violations AS managed_monotonicity_violations,
    @managed_balance_violations AS managed_balance_violations;

/* ============================================================
   3. ETL #1
   ============================================================ */

EXEC etl.usp_load_claro_portfolio_evolution
    @crm_client_id = @crm_client_id,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

/* ============================================================
   4. SOURCE vs fact exacta
   ============================================================ */

IF OBJECT_ID('tempdb..#AnalyticsBaseline') IS NOT NULL
    DROP TABLE #AnalyticsBaseline;

SELECT
    f.date_key,
    p.source_portfolio_id,
    f.assigned_clients,
    f.managed_clients,
    f.pending_clients
INTO #AnalyticsBaseline
FROM analytics.fact_portfolio_evolution_daily AS f
INNER JOIN analytics.dim_portfolio AS p
    ON p.portfolio_key = f.portfolio_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key;

DECLARE @analytics_rows BIGINT =
    (SELECT COUNT_BIG(*) FROM #AnalyticsBaseline);

DECLARE @managed_semantics_differences BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT date_key, source_portfolio_id, managed_clients
            FROM #SourceBaseline
            EXCEPT
            SELECT date_key, source_portfolio_id, managed_clients
            FROM #AnalyticsBaseline
        ) AS source_minus_analytics_managed
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT date_key, source_portfolio_id, managed_clients
            FROM #AnalyticsBaseline
            EXCEPT
            SELECT date_key, source_portfolio_id, managed_clients
            FROM #SourceBaseline
        ) AS analytics_minus_source_managed
    );

DECLARE @source_fact_differences BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                date_key,
                source_portfolio_id,
                assigned_clients,
                managed_clients,
                pending_clients
            FROM #SourceBaseline
            EXCEPT
            SELECT
                date_key,
                source_portfolio_id,
                assigned_clients,
                managed_clients,
                pending_clients
            FROM #AnalyticsBaseline
        ) AS source_minus_analytics
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                date_key,
                source_portfolio_id,
                assigned_clients,
                managed_clients,
                pending_clients
            FROM #AnalyticsBaseline
            EXCEPT
            SELECT
                date_key,
                source_portfolio_id,
                assigned_clients,
                managed_clients,
                pending_clients
            FROM #SourceBaseline
        ) AS analytics_minus_source
    );

SELECT
    @source_rows AS source_rows,
    @analytics_rows AS analytics_rows,
    @managed_semantics_differences AS managed_semantics_differences,
    @source_fact_differences AS source_fact_differences;

/* ============================================================
   5. Agregado de campaña SOURCE vs view
   ============================================================ */

IF OBJECT_ID('tempdb..#SourceCampaignDaily') IS NOT NULL
    DROP TABLE #SourceCampaignDaily;

SELECT
    date_key,
    calendar_date,
    SUM(assigned_clients) AS assigned_clients,
    SUM(managed_clients) AS managed_clients,
    SUM(pending_clients) AS pending_clients
INTO #SourceCampaignDaily
FROM #SourceBaseline
GROUP BY date_key, calendar_date;

DECLARE @campaign_daily_differences BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                s.date_key,
                s.assigned_clients,
                s.managed_clients,
                s.pending_clients
            FROM #SourceCampaignDaily AS s
            EXCEPT
            SELECT
                v.date_key,
                v.assigned_clients,
                v.managed_clients,
                v.pending_clients
            FROM analytics.v_campaign_evolution_daily AS v
            WHERE v.client_key = @client_key
              AND v.campaign_key = @campaign_key
        ) AS source_minus_view
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                v.date_key,
                v.assigned_clients,
                v.managed_clients,
                v.pending_clients
            FROM analytics.v_campaign_evolution_daily AS v
            WHERE v.client_key = @client_key
              AND v.campaign_key = @campaign_key
            EXCEPT
            SELECT
                s.date_key,
                s.assigned_clients,
                s.managed_clients,
                s.pending_clients
            FROM #SourceCampaignDaily AS s
        ) AS view_minus_source
    );

SELECT
    v.calendar_date,
    v.assigned_clients,
    v.managed_clients,
    v.pending_clients,
    v.recovered_amount_to_date,
    v.portfolio_progress_rate
FROM analytics.v_campaign_evolution_daily AS v
WHERE v.client_key = @client_key
  AND v.campaign_key = @campaign_key
ORDER BY v.date_key;

/* ============================================================
   6. Recaudo canonical de la view vs LIVE
   ============================================================ */

IF OBJECT_ID('tempdb..#CanonicalRecovery') IS NOT NULL
    DROP TABLE #CanonicalRecovery;

;WITH Dates AS
(
    SELECT DISTINCT date_key, calendar_date
    FROM #SourceBaseline
),
LiveByDay AS
(
    SELECT
        f.date_key,
        SUM(f.recovered_amount_day) AS recovered_amount_day
    FROM analytics.fact_portfolio_daily AS f
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
    GROUP BY f.date_key
)
SELECT
    d.date_key,
    d.calendar_date,
    CONVERT(DECIMAL(19,4),
        SUM(ISNULL(l.recovered_amount_day, 0)) OVER
        (
            ORDER BY d.date_key
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )
    ) AS recovered_amount_to_date
INTO #CanonicalRecovery
FROM Dates AS d
LEFT JOIN LiveByDay AS l
    ON l.date_key = d.date_key;

DECLARE @canonical_recovery_differences BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT date_key, recovered_amount_to_date
            FROM #CanonicalRecovery
            EXCEPT
            SELECT date_key, CONVERT(DECIMAL(19,4), recovered_amount_to_date)
            FROM analytics.v_campaign_evolution_daily
            WHERE client_key = @client_key
              AND campaign_key = @campaign_key
        ) AS canonical_minus_view
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                date_key,
                CONVERT(DECIMAL(19,4), recovered_amount_to_date) AS recovered_amount_to_date
            FROM analytics.v_campaign_evolution_daily
            WHERE client_key = @client_key
              AND campaign_key = @campaign_key
            EXCEPT
            SELECT date_key, recovered_amount_to_date
            FROM #CanonicalRecovery
        ) AS view_minus_canonical
    );

/* Diagnóstico: EVOL legacy vs recovery canonical. NO es criterio de fallo. */
IF OBJECT_ID('tempdb..#LegacyRecovery') IS NOT NULL
    DROP TABLE #LegacyRecovery;

SELECT
    date_key,
    calendar_date,
    CONVERT(DECIMAL(19,4),
        SUM(SUM(legacy_recovered_amount_day)) OVER
        (
            ORDER BY date_key
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )
    ) AS legacy_recovered_amount_to_date
INTO #LegacyRecovery
FROM #SourceBaseline
GROUP BY date_key, calendar_date;

SELECT
    l.calendar_date,
    l.legacy_recovered_amount_to_date,
    c.recovered_amount_to_date AS canonical_recovered_amount_to_date,
    CONVERT(DECIMAL(19,4),
        l.legacy_recovered_amount_to_date - c.recovered_amount_to_date
    ) AS legacy_vs_canonical_difference
FROM #LegacyRecovery AS l
INNER JOIN #CanonicalRecovery AS c
    ON c.date_key = l.date_key
ORDER BY l.date_key;

/* ============================================================
   7. Watermark
   ============================================================ */

DECLARE @expected_watermark DATETIME2(3) =
(
    SELECT MAX(CONVERT(DATETIME2(3), calendar_date))
    FROM #SourceBaseline
);

DECLARE @actual_watermark DATETIME2(3) =
(
    SELECT last_source_datetime
    FROM etl.watermark
    WHERE source_code = 'CLARO_EVOLUTION_DAILY'
);

DECLARE @watermark_differences INT =
    CASE WHEN @actual_watermark = @expected_watermark THEN 0 ELSE 1 END;

/* ============================================================
   8. Baseline funcional para idempotencia
   ============================================================ */

IF OBJECT_ID('tempdb..#BeforeSecond') IS NOT NULL
    DROP TABLE #BeforeSecond;

SELECT
    date_key,
    client_key,
    campaign_key,
    portfolio_key,
    assigned_clients,
    managed_clients,
    pending_clients,
    source_as_of_at
INTO #BeforeSecond
FROM analytics.fact_portfolio_evolution_daily
WHERE client_key = @client_key
  AND campaign_key = @campaign_key;

EXEC etl.usp_load_claro_portfolio_evolution
    @crm_client_id = @crm_client_id,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

DECLARE @idempotence_differences BIGINT =
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                date_key,
                client_key,
                campaign_key,
                portfolio_key,
                assigned_clients,
                managed_clients,
                pending_clients,
                source_as_of_at
            FROM #BeforeSecond
            EXCEPT
            SELECT
                date_key,
                client_key,
                campaign_key,
                portfolio_key,
                assigned_clients,
                managed_clients,
                pending_clients,
                source_as_of_at
            FROM analytics.fact_portfolio_evolution_daily
            WHERE client_key = @client_key
              AND campaign_key = @campaign_key
        ) AS before_minus_after
    )
    +
    (
        SELECT COUNT_BIG(*)
        FROM
        (
            SELECT
                date_key,
                client_key,
                campaign_key,
                portfolio_key,
                assigned_clients,
                managed_clients,
                pending_clients,
                source_as_of_at
            FROM analytics.fact_portfolio_evolution_daily
            WHERE client_key = @client_key
              AND campaign_key = @campaign_key
            EXCEPT
            SELECT
                date_key,
                client_key,
                campaign_key,
                portfolio_key,
                assigned_clients,
                managed_clients,
                pending_clients,
                source_as_of_at
            FROM #BeforeSecond
        ) AS after_minus_before
    );

/* ============================================================
   9. Resultado final
   ============================================================ */

DECLARE @source_rows_after BIGINT;
DECLARE @source_assigned_checksum_after BIGINT;
DECLARE @source_new_managed_checksum_after BIGINT;
DECLARE @source_legacy_recovery_checksum_after DECIMAL(38,4);
DECLARE @source_max_date_after DATE;

SELECT
    @source_rows_after = COUNT_BIG(*),
    @source_assigned_checksum_after =
        SUM(CONVERT(BIGINT, ISNULL(s.TOTAL_CLIENTES, 0))),
    @source_new_managed_checksum_after =
        SUM(CONVERT(BIGINT, ISNULL(s.CLIENTE_GESTIONADO_NVO, 0))),
    @source_legacy_recovery_checksum_after =
        SUM(CONVERT(DECIMAL(38,4), ISNULL(s.MONTO_DE_PAGOS, 0))),
    @source_max_date_after = MAX(s.fecha)
FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
WHERE s.AñoAval = @campaign_year
  AND s.CampAval = @source_campaign_code;

DECLARE @source_changed_during_test INT =
    CASE
        WHEN @source_rows_after = @source_rows
         AND ISNULL(@source_assigned_checksum_after, 0) = ISNULL(@source_assigned_checksum, 0)
         AND ISNULL(@source_new_managed_checksum_after, 0) = ISNULL(@source_new_managed_checksum, 0)
         AND ISNULL(@source_legacy_recovery_checksum_after, 0) = ISNULL(@source_legacy_recovery_checksum, 0)
         AND @source_max_date_after = @source_max_date
            THEN 0
        ELSE 1
    END;

DECLARE @assessment VARCHAR(10) =
    CASE
        WHEN @source_duplicate_grain_rows = 0
         AND @source_mapping_differences = 0
         AND @managed_semantics_differences = 0
         AND @managed_monotonicity_violations = 0
         AND @managed_balance_violations = 0
         AND @source_fact_differences = 0
         AND @campaign_daily_differences = 0
         AND @canonical_recovery_differences = 0
         AND @watermark_differences = 0
         AND @idempotence_differences = 0
         AND @source_changed_during_test = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END;

SELECT
    @source_rows AS source_rows,
    @analytics_rows AS analytics_rows,
    @source_days AS evolution_days,
    @source_portfolios AS portfolios,
    @source_duplicate_grain_rows AS source_duplicate_grain_rows,
    @source_mapping_differences AS source_mapping_differences,
    @legacy_direct_managed_differences AS legacy_direct_managed_differences,
    @managed_semantics_differences AS managed_semantics_differences,
    @managed_monotonicity_violations AS managed_monotonicity_violations,
    @managed_balance_violations AS managed_balance_violations,
    @source_fact_differences AS source_fact_differences,
    @campaign_daily_differences AS campaign_daily_differences,
    @canonical_recovery_differences AS canonical_recovery_differences,
    @watermark_differences AS watermark_differences,
    @idempotence_differences AS idempotence_differences,
    @source_changed_during_test AS source_changed_during_test,
    @assessment AS assessment;

IF @source_changed_during_test <> 0
    THROW 51609, 'La fuente EVOL cambió durante la prueba. Reejecute la validación.', 1;

IF @assessment <> 'OK'
    THROW 51610, 'La validación EVOL no terminó en OK.', 1;
GO
