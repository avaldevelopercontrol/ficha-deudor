/*
Portfolio Control Center - ETAPA 6
Validación: snapshot real vs fila creada por flows en fact_portfolio_daily.

OBJETIVO:
- comprobar consistencia de has_source_snapshot;
- comprobar que LIVE no degrada snapshots reales ya cargados;
- comprobar que las filas nuevas creadas por LIVE nacen sin snapshot real;
- comprobar que LIVE no modifica columnas snapshot/provenance existentes;
- comprobar idempotencia de la semántica de snapshot en dos ejecuciones LIVE;
- comprobar que las views propagan la nueva marca.

IMPORTANTE:
- este script EJECUTA etl.usp_load_claro_live_operations dos veces;
- ejecutar primero:
    008_portfolio_v1_snapshot_presence.sql
    002_portfolio_v1_contract_views.sql
    etl/010_load_claro_portfolio_snapshot.sql
    etl/020_load_claro_live_operations.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_at DATETIME2(3) = SYSDATETIME();
DECLARE @campaign_year SMALLINT = YEAR(@as_of_at);
DECLARE @campaign_month TINYINT = MONTH(@as_of_at);
DECLARE @campaign_code VARCHAR(20) =
    CONCAT(
        @campaign_year,
        '-',
        RIGHT(CONCAT('0', @campaign_month), 2)
    );

DECLARE @client_key INT;
DECLARE @campaign_key INT;

IF COL_LENGTH('analytics.fact_portfolio_daily', 'has_source_snapshot') IS NULL
    THROW 52100, 'Falta analytics.fact_portfolio_daily.has_source_snapshot. Ejecutar 008.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('analytics.v_portfolio_daily_metrics')
      AND name = 'has_source_snapshot'
)
    THROW 52101, 'v_portfolio_daily_metrics no expone has_source_snapshot. Reejecutar 002.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('analytics.v_campaign_daily_summary')
      AND name = 'has_source_snapshot'
)
    THROW 52102, 'v_campaign_daily_summary no expone has_source_snapshot. Reejecutar 002.', 1;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id
  AND is_active = 1;

IF @client_key IS NULL
    THROW 52103, 'Cliente no encontrado en analytics.dim_client.', 1;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @campaign_key IS NULL
    THROW 52104, 'Campaña no encontrada en analytics.dim_campaign.', 1;


/* ============================================================
   1. Baseline y consistencia semántica
   ============================================================ */

IF OBJECT_ID('tempdb..#Before') IS NOT NULL
    DROP TABLE #Before;

SELECT
    f.date_key,
    f.portfolio_key,
    f.assigned_clients_snapshot,
    f.managed_clients_snapshot,
    f.pending_clients_snapshot,
    f.contacted_clients_snapshot,
    f.direct_contact_snapshot,
    f.assigned_amount_snapshot,
    f.managed_amount_snapshot,
    f.has_source_snapshot,
    f.source_as_of_at
INTO #Before
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_year = @campaign_year
  AND d.calendar_month = @campaign_month;

DECLARE @before_rows INT;
DECLARE @before_real_snapshot_rows INT;
DECLARE @before_flow_only_rows INT;
DECLARE @before_carried_rows INT;
DECLARE @before_flow_rows_without_snapshot INT;
DECLARE @invalid_real_snapshot_rows INT;
DECLARE @invalid_flow_only_same_date_rows INT;

SELECT
    @before_rows = COUNT(*),
    @before_real_snapshot_rows =
        SUM(CASE WHEN f.has_source_snapshot = 1 THEN 1 ELSE 0 END),
    @before_flow_only_rows =
        SUM(CASE WHEN f.has_source_snapshot = 0 THEN 1 ELSE 0 END),
    @before_carried_rows =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 0
                 AND f.source_as_of_at IS NOT NULL
                 AND CONVERT(DATE, f.source_as_of_at) < d.calendar_date
                    THEN 1
                ELSE 0
            END
        ),
    @before_flow_rows_without_snapshot =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 0
                 AND (
                        f.management_events_day > 0
                     OR f.new_managed_clients_day > 0
                     OR f.new_direct_contacts_day > 0
                     OR f.promises_count_day > 0
                     OR f.promises_amount_day > 0
                     OR f.payers_count_day > 0
                     OR f.recovered_amount_day > 0
                 )
                    THEN 1
                ELSE 0
            END
        ),
    @invalid_real_snapshot_rows =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 1
                 AND (
                        f.source_as_of_at IS NULL
                     OR CONVERT(DATE, f.source_as_of_at) <> d.calendar_date
                 )
                    THEN 1
                ELSE 0
            END
        ),
    @invalid_flow_only_same_date_rows =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 0
                 AND f.source_as_of_at IS NOT NULL
                 AND CONVERT(DATE, f.source_as_of_at) = d.calendar_date
                    THEN 1
                ELSE 0
            END
        )
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_year = @campaign_year
  AND d.calendar_month = @campaign_month;

SELECT
    @before_rows AS before_rows,
    @before_real_snapshot_rows AS before_real_snapshot_rows,
    @before_flow_only_rows AS before_flow_only_rows,
    @before_carried_rows AS before_carried_rows,
    @before_flow_rows_without_snapshot AS before_flow_rows_without_snapshot,
    @invalid_real_snapshot_rows AS invalid_real_snapshot_rows,
    @invalid_flow_only_same_date_rows AS invalid_flow_only_same_date_rows;

IF ISNULL(@before_rows, 0) = 0
    THROW 52105, 'No existen filas Portfolio para la campaña actual.', 1;

IF ISNULL(@before_real_snapshot_rows, 0) = 0
    THROW 52106, 'No existe ningún snapshot real marcado para la campaña actual.', 1;

IF ISNULL(@invalid_real_snapshot_rows, 0) > 0
    THROW 52107, 'Existen filas marcadas como snapshot real cuya fecha no coincide con source_as_of_at.', 1;

IF ISNULL(@invalid_flow_only_same_date_rows, 0) > 0
    THROW 52108, 'Existen filas flow-only con source_as_of_at del mismo día; revisar el backfill de 008.', 1;


/* ============================================================
   2. Primera ejecución LIVE
   ============================================================ */

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

DECLARE @lost_real_snapshots_after_live INT;
DECLARE @changed_existing_snapshot_payload_after_live INT;
DECLARE @new_rows_marked_as_real_snapshot INT;

SELECT
    @lost_real_snapshots_after_live = COUNT(*)
FROM #Before AS b
LEFT JOIN analytics.fact_portfolio_daily AS f
    ON f.client_key = @client_key
   AND f.campaign_key = @campaign_key
   AND f.date_key = b.date_key
   AND f.portfolio_key = b.portfolio_key
WHERE b.has_source_snapshot = 1
  AND (
        f.portfolio_daily_key IS NULL
     OR f.has_source_snapshot <> 1
  );

SELECT
    @changed_existing_snapshot_payload_after_live = COUNT(*)
FROM #Before AS b
INNER JOIN analytics.fact_portfolio_daily AS f
    ON f.client_key = @client_key
   AND f.campaign_key = @campaign_key
   AND f.date_key = b.date_key
   AND f.portfolio_key = b.portfolio_key
WHERE
       f.assigned_clients_snapshot <> b.assigned_clients_snapshot
    OR f.managed_clients_snapshot <> b.managed_clients_snapshot
    OR f.pending_clients_snapshot <> b.pending_clients_snapshot
    OR f.contacted_clients_snapshot <> b.contacted_clients_snapshot
    OR f.direct_contact_snapshot <> b.direct_contact_snapshot
    OR f.assigned_amount_snapshot <> b.assigned_amount_snapshot
    OR f.managed_amount_snapshot <> b.managed_amount_snapshot
    OR f.has_source_snapshot <> b.has_source_snapshot
    OR ISNULL(f.source_as_of_at, CONVERT(DATETIME2(3), '19000101'))
       <> ISNULL(b.source_as_of_at, CONVERT(DATETIME2(3), '19000101'));

SELECT
    @new_rows_marked_as_real_snapshot = COUNT(*)
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_year = @campaign_year
  AND d.calendar_month = @campaign_month
  AND f.has_source_snapshot = 1
  AND NOT EXISTS
  (
      SELECT 1
      FROM #Before AS b
      WHERE b.date_key = f.date_key
        AND b.portfolio_key = f.portfolio_key
  );

SELECT
    @lost_real_snapshots_after_live AS lost_real_snapshots_after_live,
    @changed_existing_snapshot_payload_after_live
        AS changed_existing_snapshot_payload_after_live,
    @new_rows_marked_as_real_snapshot AS new_rows_marked_as_real_snapshot;

IF @lost_real_snapshots_after_live > 0
    THROW 52109, 'LIVE degradó filas que ya tenían snapshot real.', 1;

IF @changed_existing_snapshot_payload_after_live > 0
    THROW 52110, 'LIVE modificó snapshot/provenance de filas existentes.', 1;

IF @new_rows_marked_as_real_snapshot > 0
    THROW 52111, 'LIVE creó filas nuevas marcadas incorrectamente como snapshot real.', 1;


/* ============================================================
   3. Baseline después de LIVE #1
   ============================================================ */

IF OBJECT_ID('tempdb..#AfterFirst') IS NOT NULL
    DROP TABLE #AfterFirst;

SELECT
    f.date_key,
    f.portfolio_key,
    f.assigned_clients_snapshot,
    f.managed_clients_snapshot,
    f.pending_clients_snapshot,
    f.contacted_clients_snapshot,
    f.direct_contact_snapshot,
    f.assigned_amount_snapshot,
    f.managed_amount_snapshot,
    f.has_source_snapshot,
    f.source_as_of_at
INTO #AfterFirst
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_year = @campaign_year
  AND d.calendar_month = @campaign_month;


/* ============================================================
   4. Segunda ejecución LIVE e idempotencia
   ============================================================ */

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month;

DECLARE @idempotence_differences INT;

;WITH AfterSecond AS
(
    SELECT
        f.date_key,
        f.portfolio_key,
        f.assigned_clients_snapshot,
        f.managed_clients_snapshot,
        f.pending_clients_snapshot,
        f.contacted_clients_snapshot,
        f.direct_contact_snapshot,
        f.assigned_amount_snapshot,
        f.managed_amount_snapshot,
        f.has_source_snapshot,
        f.source_as_of_at
    FROM analytics.fact_portfolio_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_year = @campaign_year
      AND d.calendar_month = @campaign_month
), OnlyAfterFirst AS
(
    SELECT * FROM #AfterFirst
    EXCEPT
    SELECT * FROM AfterSecond
), OnlyAfterSecond AS
(
    SELECT * FROM AfterSecond
    EXCEPT
    SELECT * FROM #AfterFirst
), Differences AS
(
    SELECT * FROM OnlyAfterFirst
    UNION ALL
    SELECT * FROM OnlyAfterSecond
)
SELECT @idempotence_differences = COUNT(*)
FROM Differences;

IF @idempotence_differences > 0
    THROW 52112, 'LIVE no es idempotente para la semántica snapshot/provenance.', 1;


/* ============================================================
   5. Contratos de lectura
   ============================================================ */

DECLARE @portfolio_view_presence_mismatches INT;
DECLARE @campaign_view_presence_mismatches INT;

SELECT
    @portfolio_view_presence_mismatches = COUNT(*)
FROM analytics.v_portfolio_daily_metrics AS v
INNER JOIN analytics.fact_portfolio_daily AS f
    ON f.portfolio_daily_key = v.portfolio_daily_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND v.has_source_snapshot <> f.has_source_snapshot;

;WITH Expected AS
(
    SELECT
        f.date_key,
        f.client_key,
        f.campaign_key,
        CAST(MAX(CONVERT(TINYINT, f.has_source_snapshot)) AS BIT)
            AS has_source_snapshot
    FROM analytics.fact_portfolio_daily AS f
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
    GROUP BY
        f.date_key,
        f.client_key,
        f.campaign_key
)
SELECT
    @campaign_view_presence_mismatches = COUNT(*)
FROM Expected AS e
INNER JOIN analytics.v_campaign_daily_summary AS v
    ON v.date_key = e.date_key
   AND v.client_key = e.client_key
   AND v.campaign_key = e.campaign_key
WHERE v.has_source_snapshot <> e.has_source_snapshot;

IF @portfolio_view_presence_mismatches > 0
    THROW 52113, 'v_portfolio_daily_metrics no propaga correctamente has_source_snapshot.', 1;

IF @campaign_view_presence_mismatches > 0
    THROW 52114, 'v_campaign_daily_summary no propaga correctamente has_source_snapshot.', 1;


/* ============================================================
   6. Resultado final
   ============================================================ */

DECLARE @after_real_snapshot_rows INT;
DECLARE @after_flow_only_rows INT;
DECLARE @after_carried_rows INT;
DECLARE @after_flow_rows_without_snapshot INT;

SELECT
    @after_real_snapshot_rows =
        SUM(CASE WHEN f.has_source_snapshot = 1 THEN 1 ELSE 0 END),
    @after_flow_only_rows =
        SUM(CASE WHEN f.has_source_snapshot = 0 THEN 1 ELSE 0 END),
    @after_carried_rows =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 0
                 AND f.source_as_of_at IS NOT NULL
                 AND CONVERT(DATE, f.source_as_of_at) < d.calendar_date
                    THEN 1
                ELSE 0
            END
        ),
    @after_flow_rows_without_snapshot =
        SUM(
            CASE
                WHEN f.has_source_snapshot = 0
                 AND (
                        f.management_events_day > 0
                     OR f.new_managed_clients_day > 0
                     OR f.new_direct_contacts_day > 0
                     OR f.promises_count_day > 0
                     OR f.promises_amount_day > 0
                     OR f.payers_count_day > 0
                     OR f.recovered_amount_day > 0
                 )
                    THEN 1
                ELSE 0
            END
        )
FROM analytics.fact_portfolio_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
WHERE f.client_key = @client_key
  AND f.campaign_key = @campaign_key
  AND d.calendar_year = @campaign_year
  AND d.calendar_month = @campaign_month;

SELECT
    @before_real_snapshot_rows AS before_real_snapshot_rows,
    @after_real_snapshot_rows AS after_real_snapshot_rows,
    @before_flow_only_rows AS before_flow_only_rows,
    @after_flow_only_rows AS after_flow_only_rows,
    @before_carried_rows AS before_carried_rows,
    @after_carried_rows AS after_carried_rows,
    @before_flow_rows_without_snapshot AS before_flow_rows_without_snapshot,
    @after_flow_rows_without_snapshot AS after_flow_rows_without_snapshot,
    @lost_real_snapshots_after_live AS lost_real_snapshots_after_live,
    @changed_existing_snapshot_payload_after_live
        AS changed_existing_snapshot_payload_after_live,
    @new_rows_marked_as_real_snapshot AS new_rows_marked_as_real_snapshot,
    @idempotence_differences AS idempotence_differences,
    @portfolio_view_presence_mismatches AS portfolio_view_presence_mismatches,
    @campaign_view_presence_mismatches AS campaign_view_presence_mismatches,
    CASE
        WHEN @lost_real_snapshots_after_live = 0
         AND @changed_existing_snapshot_payload_after_live = 0
         AND @new_rows_marked_as_real_snapshot = 0
         AND @idempotence_differences = 0
         AND @portfolio_view_presence_mismatches = 0
         AND @campaign_view_presence_mismatches = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END AS assessment;
