/*
Portfolio Control Center - ETAPA 6 / Avance 1
ETL CLARO: dimensiones + snapshot de cartera

FUENTE:
    aval_reporteria.dbo.PBI_CLARO_CORP_ADMINISTRATIVO

DESTINO:
    base Analytics actual

CARACTERÍSTICAS:
- idempotente para una fecha de snapshot;
- no borra los flows que posteriormente cargará GESTION-COB2;
- no hardcodea el ID del cliente CRM;
- CLARO está encapsulado en este adaptador de fuente, nunca en React;
- no recorre la BD transaccional de 80M+ filas.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

CREATE OR ALTER PROCEDURE etl.usp_load_claro_portfolio_snapshot
    @crm_client_id    INT,
    @client_code      VARCHAR(50),
    @client_name      VARCHAR(150),
    @snapshot_date    DATE,
    @campaign_year    SMALLINT = NULL,
    @campaign_month   TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @crm_client_id IS NULL OR @crm_client_id <= 0
        THROW 51100, '@crm_client_id es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@client_code)), '') IS NULL
        THROW 51101, '@client_code es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@client_name)), '') IS NULL
        THROW 51102, '@client_name es obligatorio.', 1;

    IF @snapshot_date IS NULL
        THROW 51103, '@snapshot_date es obligatorio.', 1;

    SET @campaign_year = ISNULL(@campaign_year, YEAR(@snapshot_date));
    SET @campaign_month = ISNULL(@campaign_month, MONTH(@snapshot_date));

    IF @campaign_month NOT BETWEEN 1 AND 12
        THROW 51104, '@campaign_month debe estar entre 1 y 12.', 1;

    DECLARE @source_campaign_code VARCHAR(15) =
        CONCAT('C-', RIGHT(CONCAT('0', @campaign_month), 2));

    DECLARE @campaign_code VARCHAR(20) =
        CONCAT(@campaign_year, '-', RIGHT(CONCAT('0', @campaign_month), 2));

    DECLARE @campaign_name VARCHAR(100) =
        CONCAT(
            CASE @campaign_month
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
            END,
            ' ',
            @campaign_year
        );

    DECLARE @campaign_start DATE =
        DATEFROMPARTS(@campaign_year, @campaign_month, 1);

    DECLARE @campaign_end DATE =
        EOMONTH(@campaign_start);

    DECLARE @date_key INT =
        CONVERT(INT, CONVERT(CHAR(8), @snapshot_date, 112));

    DECLARE @client_key INT;
    DECLARE @campaign_key INT;
    DECLARE @source_as_of_at DATETIME2(3) = CONVERT(DATETIME2(3), @snapshot_date);
    DECLARE @source_rows BIGINT;

    SELECT @source_rows = COUNT_BIG(*)
    FROM aval_reporteria.dbo.PBI_CLARO_CORP_ADMINISTRATIVO AS s
    WHERE s.AñoAval = @campaign_year
      AND s.CampAval = @source_campaign_code;

    IF ISNULL(@source_rows, 0) = 0
        THROW 51105, 'La fuente CLARO no tiene filas para la campaña solicitada.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        /* --------------------------------------------------------
           1. Cliente
           -------------------------------------------------------- */

        UPDATE analytics.dim_client
        SET
            client_code = LTRIM(RTRIM(@client_code)),
            client_name = LTRIM(RTRIM(@client_name)),
            is_active = 1,
            updated_at = SYSUTCDATETIME()
        WHERE crm_client_id = @crm_client_id;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO analytics.dim_client
            (
                crm_client_id,
                client_code,
                client_name
            )
            VALUES
            (
                @crm_client_id,
                LTRIM(RTRIM(@client_code)),
                LTRIM(RTRIM(@client_name))
            );
        END;

        SELECT @client_key = client_key
        FROM analytics.dim_client
        WHERE crm_client_id = @crm_client_id;

        /* --------------------------------------------------------
           2. Campaña canónica YYYY-MM
           -------------------------------------------------------- */

        UPDATE analytics.dim_campaign
        SET
            campaign_name = @campaign_name,
            campaign_year = @campaign_year,
            campaign_month = @campaign_month,
            start_date = @campaign_start,
            end_date = @campaign_end,
            updated_at = SYSUTCDATETIME()
        WHERE client_key = @client_key
          AND campaign_code = @campaign_code;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO analytics.dim_campaign
            (
                client_key,
                campaign_code,
                campaign_name,
                campaign_year,
                campaign_month,
                start_date,
                end_date
            )
            VALUES
            (
                @client_key,
                @campaign_code,
                @campaign_name,
                @campaign_year,
                @campaign_month,
                @campaign_start,
                @campaign_end
            );
        END;

        SELECT @campaign_key = campaign_key
        FROM analytics.dim_campaign
        WHERE client_key = @client_key
          AND campaign_code = @campaign_code;

        /* --------------------------------------------------------
           3. Calendario
           -------------------------------------------------------- */

        EXEC etl.usp_ensure_date_range
            @date_from = @campaign_start,
            @date_to = @campaign_end;

        /* --------------------------------------------------------
           4. Carteras
           -------------------------------------------------------- */

        IF OBJECT_ID('tempdb..#SourcePortfolio') IS NOT NULL
            DROP TABLE #SourcePortfolio;

        SELECT
            s.nId_Cartera AS source_portfolio_id,
            CONVERT(VARCHAR(100), s.nId_Cartera) AS portfolio_code,
            MAX(LTRIM(RTRIM(s.cartera))) AS portfolio_name,
            MAX(NULLIF(LTRIM(RTRIM(s.Cliente)), '')) AS source_business_unit
        INTO #SourcePortfolio
        FROM aval_reporteria.dbo.PBI_CLARO_CORP_ADMINISTRATIVO AS s
        WHERE s.AñoAval = @campaign_year
          AND s.CampAval = @source_campaign_code
        GROUP BY
            s.nId_Cartera;

        UPDATE p
        SET
            p.portfolio_code = s.portfolio_code,
            p.portfolio_name = s.portfolio_name,
            p.source_business_unit = s.source_business_unit,
            p.is_active = 1,
            p.updated_at = SYSUTCDATETIME()
        FROM analytics.dim_portfolio AS p
        INNER JOIN #SourcePortfolio AS s
            ON s.source_portfolio_id = p.source_portfolio_id
        WHERE p.client_key = @client_key;

        INSERT INTO analytics.dim_portfolio
        (
            client_key,
            source_portfolio_id,
            portfolio_code,
            portfolio_name,
            source_business_unit
        )
        SELECT
            @client_key,
            s.source_portfolio_id,
            s.portfolio_code,
            s.portfolio_name,
            s.source_business_unit
        FROM #SourcePortfolio AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.dim_portfolio AS p
            WHERE p.client_key = @client_key
              AND p.source_portfolio_id = s.source_portfolio_id
        );

        /*
          No se desactivan carteras por ausencia en una campaña concreta.
          Un backfill histórico no debe alterar la vigencia actual del catálogo.
          La baja de carteras se implementará únicamente cuando exista una
          fuente maestra de vigencia explícita.
        */

        /* --------------------------------------------------------
           5. Agregado snapshot por cartera

           managed_amount_snapshot queda en 0 deliberadamente:
           todavía no existe una definición física validada para ese monto.
           -------------------------------------------------------- */

        IF OBJECT_ID('tempdb..#Snapshot') IS NOT NULL
            DROP TABLE #Snapshot;

        SELECT
            s.nId_Cartera AS source_portfolio_id,

            SUM(CASE
                    WHEN s.Deudor_unico = 1 THEN 1
                    ELSE 0
                END) AS assigned_clients_snapshot,

            SUM(CASE
                    WHEN s.Deudor_unico = 1
                     AND TRY_CONVERT(INT, s.CANT_GEST_TOTAL) > 0
                    THEN 1
                    ELSE 0
                END) AS managed_clients_snapshot,

            SUM(CASE
                    WHEN s.Deudor_unico = 1
                     AND ISNULL(TRY_CONVERT(INT, s.CANT_GEST_TOTAL), 0) = 0
                    THEN 1
                    ELSE 0
                END) AS pending_clients_snapshot,

            SUM(CASE
                    WHEN s.Deudor_unico = 1
                     AND UPPER(LTRIM(RTRIM(ISNULL(
                            s.MEJOR_RPTA_EQUIV_tipocontacto_gruponv1, ''
                         )))) = 'CONTACTO'
                    THEN 1
                    ELSE 0
                END) AS contacted_clients_snapshot,

            SUM(CASE
                    WHEN s.Deudor_unico = 1
                     AND UPPER(LTRIM(RTRIM(ISNULL(
                            s.MEJOR_RPTA_EQUIV_indicador, ''
                         )))) = 'CD'
                    THEN 1
                    ELSE 0
                END) AS direct_contact_snapshot,

            SUM(ISNULL(CONVERT(DECIMAL(19,4), s.Asignacion), 0))
                AS assigned_amount_snapshot

        INTO #Snapshot
        FROM aval_reporteria.dbo.PBI_CLARO_CORP_ADMINISTRATIVO AS s
        WHERE s.AñoAval = @campaign_year
          AND s.CampAval = @source_campaign_code
        GROUP BY
            s.nId_Cartera;

        /*
          Update solo de columnas snapshot.
          NO toca management_events_day / promises / recaudo, que serán
          cargados por el adaptador live en el siguiente avance.
        */
        UPDATE f
        SET
            f.assigned_clients_snapshot = s.assigned_clients_snapshot,
            f.managed_clients_snapshot = s.managed_clients_snapshot,
            f.pending_clients_snapshot = s.pending_clients_snapshot,
            f.contacted_clients_snapshot = s.contacted_clients_snapshot,
            f.direct_contact_snapshot = s.direct_contact_snapshot,
            f.assigned_amount_snapshot = s.assigned_amount_snapshot,
            f.managed_amount_snapshot = 0,
            f.has_source_snapshot = 1,
            f.source_as_of_at = @source_as_of_at,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_portfolio_daily AS f
        INNER JOIN analytics.dim_portfolio AS p
            ON p.portfolio_key = f.portfolio_key
        INNER JOIN #Snapshot AS s
            ON s.source_portfolio_id = p.source_portfolio_id
        WHERE f.date_key = @date_key
          AND f.client_key = @client_key
          AND f.campaign_key = @campaign_key;

        INSERT INTO analytics.fact_portfolio_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,

            assigned_clients_snapshot,
            managed_clients_snapshot,
            pending_clients_snapshot,
            contacted_clients_snapshot,
            direct_contact_snapshot,

            assigned_amount_snapshot,
            managed_amount_snapshot,

            has_source_snapshot,
            source_as_of_at
        )
        SELECT
            @date_key,
            @client_key,
            @campaign_key,
            p.portfolio_key,

            s.assigned_clients_snapshot,
            s.managed_clients_snapshot,
            s.pending_clients_snapshot,
            s.contacted_clients_snapshot,
            s.direct_contact_snapshot,

            s.assigned_amount_snapshot,
            0,

            1,
            @source_as_of_at
        FROM #Snapshot AS s
        INNER JOIN analytics.dim_portfolio AS p
            ON p.client_key = @client_key
           AND p.source_portfolio_id = s.source_portfolio_id
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_portfolio_daily AS f
            WHERE f.date_key = @date_key
              AND f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = p.portfolio_key
        );

        /*
          Si el mismo snapshot se reprocesa y una cartera desapareció de la
          fuente, se deja snapshot 0 sin borrar los flows de esa fecha.
        */
        UPDATE f
        SET
            f.assigned_clients_snapshot = 0,
            f.managed_clients_snapshot = 0,
            f.pending_clients_snapshot = 0,
            f.contacted_clients_snapshot = 0,
            f.direct_contact_snapshot = 0,
            f.assigned_amount_snapshot = 0,
            f.managed_amount_snapshot = 0,
            f.has_source_snapshot = 1,
            f.source_as_of_at = @source_as_of_at,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_portfolio_daily AS f
        INNER JOIN analytics.dim_portfolio AS p
            ON p.portfolio_key = f.portfolio_key
        WHERE f.date_key = @date_key
          AND f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND NOT EXISTS
          (
              SELECT 1
              FROM #Snapshot AS s
              WHERE s.source_portfolio_id = p.source_portfolio_id
          );

        /* --------------------------------------------------------
           6. Watermark
           -------------------------------------------------------- */

        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime =
                CONVERT(DATETIME2(3), @snapshot_date),
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'CLARO_PORTFOLIO_SNAPSHOT';

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
                'CLARO_PORTFOLIO_SNAPSHOT',
                SYSUTCDATETIME(),
                CONVERT(DATETIME2(3), @snapshot_date),
                1
            );
        END;

        COMMIT TRANSACTION;

        /* --------------------------------------------------------
           7. Resumen verificable
           -------------------------------------------------------- */

        SELECT
            @snapshot_date AS snapshot_date,
            @campaign_code AS campaign_code,
            @source_rows AS source_rows,
            COUNT(*) AS portfolios_loaded,
            SUM(f.assigned_clients_snapshot) AS assigned_clients,
            SUM(f.managed_clients_snapshot) AS managed_clients,
            SUM(f.pending_clients_snapshot) AS pending_clients,
            SUM(f.contacted_clients_snapshot) AS contacted_clients,
            SUM(f.direct_contact_snapshot) AS direct_contact_clients,
            SUM(f.assigned_amount_snapshot) AS assigned_amount,
            MAX(f.source_as_of_at) AS source_as_of_at
        FROM analytics.fact_portfolio_daily AS f
        WHERE f.date_key = @date_key
          AND f.client_key = @client_key
          AND f.campaign_key = @campaign_key;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
