/*
Portfolio Control Center - ETAPA 6 / Avance 4
Soporte para meta mensual CLARO desde base-goals.xlsx
Motor: SQL Server

PRERREQUISITOS:
- 001_portfolio_v1_schema.sql
- 003_portfolio_v1_etl_support.sql
- staging schema (007 o equivalente)

Este script:
- crea staging normalizado para la meta mensual CLARO;
- crea el loader idempotente hacia analytics.fact_target_monthly;
- NO consulta SharePoint ni Excel directamente.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF SCHEMA_ID('staging') IS NULL
    EXEC('CREATE SCHEMA staging AUTHORIZATION dbo;');
GO

IF OBJECT_ID('staging.claro_goal_monthly', 'U') IS NULL
BEGIN
    CREATE TABLE staging.claro_goal_monthly
    (
        source_code                 VARCHAR(50) NOT NULL,
        campaign_code               VARCHAR(7) NOT NULL,
        campaign_year               SMALLINT NOT NULL,
        campaign_month              TINYINT NOT NULL,
        target_recovered_amount     DECIMAL(19,4) NOT NULL,
        source_rows                 INT NOT NULL,
        source_reference            VARCHAR(200) NULL,
        source_as_of_at             DATETIME2(3) NOT NULL,
        loaded_at                   DATETIME2(3) NOT NULL
            CONSTRAINT DF_staging_claro_goal_monthly_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_staging_claro_goal_monthly
            PRIMARY KEY (source_code, campaign_code),

        CONSTRAINT CK_staging_claro_goal_monthly_month
            CHECK (campaign_month BETWEEN 1 AND 12),

        CONSTRAINT CK_staging_claro_goal_monthly_amount
            CHECK (target_recovered_amount >= 0),

        CONSTRAINT CK_staging_claro_goal_monthly_rows
            CHECK (source_rows > 0)
    );
END;
GO


CREATE OR ALTER PROCEDURE etl.usp_load_claro_target_monthly
    @crm_client_id   INT,
    @campaign_code   VARCHAR(7),
    @source_code     VARCHAR(50) = 'CLARO_BASE_GOALS'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @crm_client_id IS NULL OR @crm_client_id <= 0
        THROW 52100, '@crm_client_id es obligatorio.', 1;

    SET @campaign_code = NULLIF(LTRIM(RTRIM(@campaign_code)), '');
    SET @source_code = NULLIF(LTRIM(RTRIM(@source_code)), '');

    IF @campaign_code IS NULL
        THROW 52101, '@campaign_code es obligatorio.', 1;

    IF @source_code IS NULL
        THROW 52102, '@source_code es obligatorio.', 1;

    IF @campaign_code NOT LIKE '[1-2][0-9][0-9][0-9]-[0-1][0-9]'
       OR TRY_CONVERT(INT, RIGHT(@campaign_code, 2)) NOT BETWEEN 1 AND 12
        THROW 52103, '@campaign_code debe tener formato YYYY-MM.', 1;

    DECLARE @client_key INT;
    DECLARE @campaign_key INT;
    DECLARE @target_recovered_amount DECIMAL(19,4);
    DECLARE @source_reference VARCHAR(200);
    DECLARE @source_as_of_at DATETIME2(3);
    DECLARE @source_rows INT;
    DECLARE @stage_rows INT;

    SELECT @client_key = c.client_key
    FROM analytics.dim_client AS c
    WHERE c.crm_client_id = @crm_client_id;

    IF @client_key IS NULL
        THROW 52104, 'El cliente no existe en analytics.dim_client.', 1;

    SELECT @campaign_key = c.campaign_key
    FROM analytics.dim_campaign AS c
    WHERE c.client_key = @client_key
      AND c.campaign_code = @campaign_code;

    IF @campaign_key IS NULL
        THROW 52105, 'La campaña no existe en analytics.dim_campaign. Cargar primero el snapshot de cartera.', 1;

    SELECT
        @stage_rows = COUNT(*),
        @target_recovered_amount = MAX(s.target_recovered_amount),
        @source_reference = MAX(s.source_reference),
        @source_as_of_at = MAX(s.source_as_of_at),
        @source_rows = MAX(s.source_rows)
    FROM staging.claro_goal_monthly AS s
    WHERE s.source_code = @source_code
      AND s.campaign_code = @campaign_code;

    IF ISNULL(@stage_rows, 0) <> 1
        THROW 52106, 'Debe existir exactamente una meta staged para source/campaign.', 1;

    IF @target_recovered_amount IS NULL
        THROW 52107, 'La meta staged no contiene target_recovered_amount.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE t
        SET
            t.target_recovered_amount = @target_recovered_amount,
            /*
              V1 no usa META_EFECTIVIDAD como regla canonical.
              La tasa de cumplimiento se deriva contra la meta monetaria.
            */
            t.target_effectiveness_rate = NULL,
            t.source_reference = @source_reference,
            t.source_as_of_at = @source_as_of_at,
            t.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_target_monthly AS t
        WHERE t.client_key = @client_key
          AND t.campaign_key = @campaign_key
          AND t.portfolio_key IS NULL;

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO analytics.fact_target_monthly
            (
                client_key,
                campaign_key,
                portfolio_key,
                target_recovered_amount,
                target_effectiveness_rate,
                source_reference,
                source_as_of_at
            )
            VALUES
            (
                @client_key,
                @campaign_key,
                NULL,
                @target_recovered_amount,
                NULL,
                @source_reference,
                @source_as_of_at
            );
        END;

        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime = @source_as_of_at,
            last_source_id = @source_rows,
            overlap_days = 0,
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'CLARO_TARGET_MONTHLY';

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO etl.watermark
            (
                source_code,
                last_success_at,
                last_source_datetime,
                last_source_id,
                overlap_days,
                updated_at
            )
            VALUES
            (
                'CLARO_TARGET_MONTHLY',
                SYSUTCDATETIME(),
                @source_as_of_at,
                @source_rows,
                0,
                SYSUTCDATETIME()
            );
        END;

        COMMIT TRANSACTION;

        SELECT
            @campaign_code AS campaign_code,
            @target_recovered_amount AS target_recovered_amount,
            @source_rows AS source_rows,
            @source_as_of_at AS source_as_of_at,
            'TARGET_MONTHLY_OK' AS assessment;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
