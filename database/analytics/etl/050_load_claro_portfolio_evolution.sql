/*
Portfolio Control Center - ETAPA 6
ETL CLARO: evolución histórica de cartera

FUENTE:
    aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL

DESTINO:
    analytics.fact_portfolio_evolution_daily

GRAIN FUENTE VALIDADO:
    fecha + nid_cartera

REGLAS:
- campaña Analytics estable YYYY-MM;
- scope de carteras limitado a dim_portfolio, previamente poblado desde el
  snapshot canonical CLARO;
- TOTAL_CLIENTES -> assigned_clients;
- managed_clients = acumulado month-to-date de CLIENTE_GESTIONADO_NVO por nid_cartera;
- CLIENTES_GESTIONADOS se conserva solo como señal diagnóstica del legado;
- pending_clients = assigned - managed;
- MONTO_DE_PAGOS NO se materializa aquí como recaudo canonical;
- V1 reprocesa el mes completo porque EVOL puede corregir días históricos.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

CREATE OR ALTER PROCEDURE etl.usp_load_claro_portfolio_evolution
    @crm_client_id   INT,
    @campaign_year   SMALLINT,
    @campaign_month  TINYINT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @crm_client_id IS NULL OR @crm_client_id <= 0
        THROW 51500, '@crm_client_id es obligatorio.', 1;

    IF @campaign_year IS NULL OR @campaign_year < 2000
        THROW 51501, '@campaign_year no es válido.', 1;

    IF @campaign_month NOT BETWEEN 1 AND 12
        THROW 51502, '@campaign_month debe estar entre 1 y 12.', 1;

    DECLARE @campaign_start DATE =
        DATEFROMPARTS(@campaign_year, @campaign_month, 1);

    DECLARE @campaign_end DATE = EOMONTH(@campaign_start);

    DECLARE @source_campaign_code VARCHAR(15) =
        CONCAT('C-', RIGHT(CONCAT('0', @campaign_month), 2));

    DECLARE @campaign_code VARCHAR(20) =
        CONCAT(@campaign_year, '-', RIGHT(CONCAT('0', @campaign_month), 2));

    DECLARE @client_key INT;
    DECLARE @campaign_key INT;
    DECLARE @source_rows BIGINT;
    DECLARE @source_as_of_at DATETIME2(3);
    DECLARE @invalid_date_rows BIGINT;
    DECLARE @duplicate_grain_rows BIGINT;
    DECLARE @unmapped_portfolio_rows BIGINT;
    DECLARE @invalid_balance_rows BIGINT;

    SELECT @client_key = c.client_key
    FROM analytics.dim_client AS c
    WHERE c.crm_client_id = @crm_client_id;

    IF @client_key IS NULL
        THROW 51503, 'El cliente no existe en analytics.dim_client.', 1;

    SELECT @campaign_key = c.campaign_key
    FROM analytics.dim_campaign AS c
    WHERE c.client_key = @client_key
      AND c.campaign_code = @campaign_code;

    IF @campaign_key IS NULL
        THROW 51504, 'La campaña no existe en analytics.dim_campaign. Ejecute primero el ETL snapshot.', 1;

    SELECT
        @source_rows = COUNT_BIG(*),
        @source_as_of_at = MAX(CONVERT(DATETIME2(3), s.fecha))
    FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
    WHERE s.AñoAval = @campaign_year
      AND s.CampAval = @source_campaign_code;

    IF ISNULL(@source_rows, 0) = 0
        THROW 51505, 'EVOL no tiene filas para la campaña solicitada.', 1;

    SELECT @invalid_date_rows = COUNT_BIG(*)
    FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
    WHERE s.AñoAval = @campaign_year
      AND s.CampAval = @source_campaign_code
      AND
      (
          s.fecha IS NULL
          OR s.fecha < @campaign_start
          OR s.fecha > @campaign_end
      );

    IF ISNULL(@invalid_date_rows, 0) > 0
        THROW 51506, 'EVOL contiene fechas nulas o fuera del mes de campaña.', 1;

    SELECT @duplicate_grain_rows = COUNT_BIG(*)
    FROM
    (
        SELECT
            s.fecha,
            s.nid_cartera
        FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
        WHERE s.AñoAval = @campaign_year
          AND s.CampAval = @source_campaign_code
        GROUP BY
            s.fecha,
            s.nid_cartera
        HAVING COUNT_BIG(*) <> 1
    ) AS q;

    IF ISNULL(@duplicate_grain_rows, 0) > 0
        THROW 51507, 'EVOL no respeta el grain fecha + nid_cartera.', 1;

    SELECT @unmapped_portfolio_rows = COUNT_BIG(*)
    FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
    LEFT JOIN analytics.dim_portfolio AS p
        ON p.client_key = @client_key
       AND p.source_portfolio_id = s.nid_cartera
    WHERE s.AñoAval = @campaign_year
      AND s.CampAval = @source_campaign_code
      AND p.portfolio_key IS NULL;

    IF ISNULL(@unmapped_portfolio_rows, 0) > 0
        THROW 51508, 'EVOL contiene carteras fuera del scope snapshot canonical.', 1;

    ;WITH ManagedNormalized AS
    (
        SELECT
            s.fecha,
            s.nid_cartera,
            CONVERT(INT, ISNULL(s.TOTAL_CLIENTES, 0)) AS assigned_clients,
            CONVERT(INT, ISNULL(s.CLIENTE_GESTIONADO_NVO, 0)) AS new_managed_clients_day,
            SUM(CONVERT(BIGINT, ISNULL(s.CLIENTE_GESTIONADO_NVO, 0))) OVER
            (
                PARTITION BY s.nid_cartera
                ORDER BY s.fecha
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS managed_clients
        FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
        WHERE s.AñoAval = @campaign_year
          AND s.CampAval = @source_campaign_code
    )
    SELECT @invalid_balance_rows = COUNT_BIG(*)
    FROM ManagedNormalized AS s
    WHERE s.assigned_clients < 0
       OR s.new_managed_clients_day < 0
       OR s.managed_clients < 0
       OR s.managed_clients > s.assigned_clients;

    IF ISNULL(@invalid_balance_rows, 0) > 0
        THROW 51509, 'EVOL contiene assigned o acumulado CLIENTE_GESTIONADO_NVO incompatibles.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        EXEC etl.usp_ensure_date_range
            @date_from = @campaign_start,
            @date_to = @campaign_end;

        IF OBJECT_ID('tempdb..#EvolutionSource') IS NOT NULL
            DROP TABLE #EvolutionSource;

        ;WITH EvolutionNormalized AS
        (
            SELECT
                s.fecha,
                s.nid_cartera,
                CONVERT(INT, ISNULL(s.TOTAL_CLIENTES, 0)) AS assigned_clients,
                SUM(CONVERT(BIGINT, ISNULL(s.CLIENTE_GESTIONADO_NVO, 0))) OVER
                (
                    PARTITION BY s.nid_cartera
                    ORDER BY s.fecha
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS managed_clients
            FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
            WHERE s.AñoAval = @campaign_year
              AND s.CampAval = @source_campaign_code
        )
        SELECT
            CONVERT(INT, CONVERT(CHAR(8), s.fecha, 112)) AS date_key,
            p.portfolio_key,
            s.assigned_clients,
            CONVERT(INT, s.managed_clients) AS managed_clients,
            CONVERT(INT, s.assigned_clients - s.managed_clients) AS pending_clients
        INTO #EvolutionSource
        FROM EvolutionNormalized AS s
        INNER JOIN analytics.dim_portfolio AS p
            ON p.client_key = @client_key
           AND p.source_portfolio_id = s.nid_cartera;

        UPDATE f
        SET
            f.assigned_clients = s.assigned_clients,
            f.managed_clients = s.managed_clients,
            f.pending_clients = s.pending_clients,
            f.source_as_of_at = @source_as_of_at,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_portfolio_evolution_daily AS f
        INNER JOIN #EvolutionSource AS s
            ON s.date_key = f.date_key
           AND s.portfolio_key = f.portfolio_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key;

        INSERT INTO analytics.fact_portfolio_evolution_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            assigned_clients,
            managed_clients,
            pending_clients,
            source_as_of_at
        )
        SELECT
            s.date_key,
            @client_key,
            @campaign_key,
            s.portfolio_key,
            s.assigned_clients,
            s.managed_clients,
            s.pending_clients,
            @source_as_of_at
        FROM #EvolutionSource AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_portfolio_evolution_daily AS f
            WHERE f.date_key = s.date_key
              AND f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = s.portfolio_key
        );

        /*
          Reproceso completo del mes: una fila removida de EVOL debe dejar de
          existir en Analytics. Esto no afecta snapshots/live porque viven en
          facts separadas.
        */
        DELETE f
        FROM analytics.fact_portfolio_evolution_daily AS f
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND NOT EXISTS
          (
              SELECT 1
              FROM #EvolutionSource AS s
              WHERE s.date_key = f.date_key
                AND s.portfolio_key = f.portfolio_key
          );

        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime = @source_as_of_at,
            last_source_id = NULL,
            overlap_days = 0,
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'CLARO_EVOLUTION_DAILY';

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO etl.watermark
            (
                source_code,
                last_success_at,
                last_source_datetime,
                overlap_days
            )
            VALUES
            (
                'CLARO_EVOLUTION_DAILY',
                SYSUTCDATETIME(),
                @source_as_of_at,
                0
            );
        END;

        COMMIT TRANSACTION;

        SELECT
            @campaign_code AS campaign_code,
            @source_as_of_at AS source_as_of_at,
            @source_rows AS source_rows,
            COUNT(*) AS evolution_rows,
            COUNT(DISTINCT f.date_key) AS evolution_days,
            COUNT(DISTINCT f.portfolio_key) AS portfolios,
            MIN(d.calendar_date) AS first_evolution_date,
            MAX(d.calendar_date) AS last_evolution_date,
            'CLARO_EVOLUTION_DAILY_OK' AS assessment
        FROM analytics.fact_portfolio_evolution_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
