/*
Portfolio Control Center - ETAPA 6 / Avance 1
Validación del snapshot cargado

Ejecutar DENTRO de la base Analytics después de:
    etl.usp_load_claro_portfolio_snapshot

Completar únicamente:
    @crm_client_id
    @snapshot_date
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 0;       -- COMPLETAR
DECLARE @snapshot_date DATE = '2026-08-12';

IF @crm_client_id <= 0
    THROW 51200, 'Completa @crm_client_id antes de ejecutar.', 1;

DECLARE @client_key INT;
DECLARE @campaign_key INT;
DECLARE @date_key INT =
    CONVERT(INT, CONVERT(CHAR(8), @snapshot_date, 112));

DECLARE @campaign_code VARCHAR(20) =
    CONCAT(
        YEAR(@snapshot_date),
        '-',
        RIGHT(CONCAT('0', MONTH(@snapshot_date)), 2)
    );

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;


PRINT '============================================================';
PRINT '1. DIMENSIONES';
PRINT '============================================================';

SELECT *
FROM analytics.dim_client
WHERE client_key = @client_key;

SELECT *
FROM analytics.dim_campaign
WHERE campaign_key = @campaign_key;

SELECT
    COUNT(*) AS active_portfolios
FROM analytics.dim_portfolio
WHERE client_key = @client_key
  AND is_active = 1;


PRINT '============================================================';
PRINT '2. SNAPSHOT ANALYTICS';
PRINT '============================================================';

SELECT
    COUNT(*) AS portfolios_loaded,
    SUM(assigned_clients_snapshot) AS assigned_clients,
    SUM(managed_clients_snapshot) AS managed_clients,
    SUM(pending_clients_snapshot) AS pending_clients,
    SUM(contacted_clients_snapshot) AS contacted_clients,
    SUM(direct_contact_snapshot) AS direct_contact_clients,
    SUM(assigned_amount_snapshot) AS assigned_amount,
    CAST(
        1.0 * SUM(managed_clients_snapshot)
        / NULLIF(SUM(assigned_clients_snapshot), 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,
    CAST(
        1.0 * SUM(contacted_clients_snapshot)
        / NULLIF(SUM(assigned_clients_snapshot), 0)
        AS DECIMAL(18,6)
    ) AS contactability_rate,
    MAX(source_as_of_at) AS source_as_of_at
FROM analytics.fact_portfolio_daily
WHERE date_key = @date_key
  AND client_key = @client_key
  AND campaign_key = @campaign_key;


PRINT '============================================================';
PRINT '3. INVARIANTES';
PRINT '============================================================';

SELECT
    SUM(
        CASE
            WHEN assigned_clients_snapshot
               <> managed_clients_snapshot + pending_clients_snapshot
                THEN 1
            ELSE 0
        END
    ) AS portfolios_breaking_assigned_equals_managed_plus_pending,

    SUM(
        CASE
            WHEN managed_clients_snapshot > assigned_clients_snapshot
                THEN 1
            ELSE 0
        END
    ) AS portfolios_managed_gt_assigned,

    SUM(
        CASE
            WHEN pending_clients_snapshot < 0
                THEN 1
            ELSE 0
        END
    ) AS portfolios_negative_pending
FROM analytics.fact_portfolio_daily
WHERE date_key = @date_key
  AND client_key = @client_key
  AND campaign_key = @campaign_key;


PRINT '============================================================';
PRINT '4. WATERMARK';
PRINT '============================================================';

SELECT *
FROM etl.watermark
WHERE source_code = 'CLARO_PORTFOLIO_SNAPSHOT';
