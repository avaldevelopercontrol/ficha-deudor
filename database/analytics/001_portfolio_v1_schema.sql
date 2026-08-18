/*
Portfolio Control Center - ETAPA 5 / Avance 1
Modelo físico mínimo del Analytics DB
Motor objetivo: SQL Server

IMPORTANTE
- Ejecutar dentro de una BASE ANALÍTICA SEPARADA de la base transaccional.
- Este script NO crea la base de datos.
- Es aditivo/idempotente: no hace DROP de objetos existentes.
- Todavía NO implementa ETL, jobs ni API.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'analytics')
    EXEC('CREATE SCHEMA analytics AUTHORIZATION dbo;');
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'etl')
    EXEC('CREATE SCHEMA etl AUTHORIZATION dbo;');
GO


/* ============================================================
   1. DIMENSIONES
   ============================================================ */

IF OBJECT_ID('analytics.dim_client', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_client
    (
        client_key          INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_dim_client PRIMARY KEY,
        crm_client_id       INT NOT NULL,
        client_code         VARCHAR(50) NOT NULL,
        client_name         VARCHAR(150) NOT NULL,
        is_active           BIT NOT NULL
            CONSTRAINT DF_dim_client_is_active DEFAULT (1),
        created_at          DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_client_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at          DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_client_updated_at DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_dim_client_crm_client
        ON analytics.dim_client(crm_client_id);

    CREATE UNIQUE INDEX UX_dim_client_code
        ON analytics.dim_client(client_code);
END;
GO


IF OBJECT_ID('analytics.dim_campaign', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_campaign
    (
        campaign_key        INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_dim_campaign PRIMARY KEY,
        client_key          INT NOT NULL,
        campaign_code       VARCHAR(20) NOT NULL,   -- Ej.: 2026-08
        campaign_name       VARCHAR(100) NOT NULL,  -- Ej.: Agosto 2026
        campaign_year       SMALLINT NOT NULL,
        campaign_month      TINYINT NOT NULL,
        start_date          DATE NOT NULL,
        end_date            DATE NOT NULL,
        created_at          DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_campaign_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at          DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_campaign_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_dim_campaign_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT CK_dim_campaign_month
            CHECK (campaign_month BETWEEN 1 AND 12),

        CONSTRAINT CK_dim_campaign_dates
            CHECK (end_date >= start_date)
    );

    CREATE UNIQUE INDEX UX_dim_campaign_client_code
        ON analytics.dim_campaign(client_key, campaign_code);
END;
GO


IF OBJECT_ID('analytics.dim_portfolio', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_portfolio
    (
        portfolio_key          BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_dim_portfolio PRIMARY KEY,
        client_key             INT NOT NULL,
        source_portfolio_id    INT NULL,             -- nId_Cartera cuando exista
        portfolio_code         VARCHAR(100) NULL,
        portfolio_name         VARCHAR(200) NOT NULL,
        source_business_unit   VARCHAR(150) NULL,    -- Ej.: CLARO CORPORATIVO
        is_active              BIT NOT NULL
            CONSTRAINT DF_dim_portfolio_is_active DEFAULT (1),
        created_at             DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_portfolio_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at             DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_portfolio_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_dim_portfolio_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key)
    );

    CREATE INDEX IX_dim_portfolio_client_source
        ON analytics.dim_portfolio(client_key, source_portfolio_id);

    CREATE INDEX IX_dim_portfolio_client_name
        ON analytics.dim_portfolio(client_key, portfolio_name);
END;
GO


IF OBJECT_ID('analytics.dim_advisor', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_advisor
    (
        advisor_key          INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_dim_advisor PRIMARY KEY,
        client_key           INT NOT NULL,
        source_advisor_id    VARCHAR(50) NOT NULL,  -- DNI/código de asesor
        advisor_name         VARCHAR(200) NULL,
        role_name            VARCHAR(150) NULL,
        is_active            BIT NOT NULL
            CONSTRAINT DF_dim_advisor_is_active DEFAULT (1),
        created_at           DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_advisor_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at           DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_advisor_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_dim_advisor_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key)
    );

    CREATE UNIQUE INDEX UX_dim_advisor_client_source
        ON analytics.dim_advisor(client_key, source_advisor_id);
END;
GO


IF OBJECT_ID('analytics.dim_supervisor', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_supervisor
    (
        supervisor_key          INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_dim_supervisor PRIMARY KEY,
        client_key              INT NOT NULL,
        source_supervisor_id    VARCHAR(50) NOT NULL,
        supervisor_name         VARCHAR(200) NOT NULL,
        is_active               BIT NOT NULL
            CONSTRAINT DF_dim_supervisor_is_active DEFAULT (1),
        created_at              DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_supervisor_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at              DATETIME2(3) NOT NULL
            CONSTRAINT DF_dim_supervisor_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_dim_supervisor_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key)
    );

    CREATE UNIQUE INDEX UX_dim_supervisor_client_source
        ON analytics.dim_supervisor(client_key, source_supervisor_id);
END;
GO


IF OBJECT_ID('analytics.bridge_supervisor_advisor', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.bridge_supervisor_advisor
    (
        supervisor_advisor_key BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_bridge_supervisor_advisor PRIMARY KEY,
        supervisor_key         INT NOT NULL,
        advisor_key            INT NOT NULL,
        valid_from             DATE NOT NULL,
        valid_to               DATE NULL,
        is_current             BIT NOT NULL
            CONSTRAINT DF_bridge_supervisor_advisor_is_current DEFAULT (1),
        created_at             DATETIME2(3) NOT NULL
            CONSTRAINT DF_bridge_supervisor_advisor_created_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_bridge_supervisor
            FOREIGN KEY (supervisor_key)
            REFERENCES analytics.dim_supervisor(supervisor_key),

        CONSTRAINT FK_bridge_advisor
            FOREIGN KEY (advisor_key)
            REFERENCES analytics.dim_advisor(advisor_key),

        CONSTRAINT CK_bridge_supervisor_advisor_dates
            CHECK (valid_to IS NULL OR valid_to >= valid_from)
    );

    CREATE UNIQUE INDEX UX_bridge_supervisor_advisor_period
        ON analytics.bridge_supervisor_advisor(advisor_key, valid_from);

    CREATE INDEX IX_bridge_supervisor_current
        ON analytics.bridge_supervisor_advisor(supervisor_key, is_current)
        INCLUDE (advisor_key, valid_from, valid_to);
END;
GO


IF OBJECT_ID('analytics.dim_date', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.dim_date
    (
        date_key                INT NOT NULL
            CONSTRAINT PK_dim_date PRIMARY KEY,      -- YYYYMMDD
        calendar_date           DATE NOT NULL,
        calendar_year           SMALLINT NOT NULL,
        calendar_month          TINYINT NOT NULL,
        calendar_day            TINYINT NOT NULL,
        day_of_week_iso         TINYINT NOT NULL,     -- 1=Lunes ... 7=Domingo
        is_business_day         BIT NOT NULL,
        is_holiday              BIT NOT NULL
            CONSTRAINT DF_dim_date_is_holiday DEFAULT (0),
        holiday_name            VARCHAR(150) NULL,
        business_day_of_month   TINYINT NULL,
        business_days_in_month  TINYINT NULL,

        CONSTRAINT UX_dim_date_calendar_date UNIQUE (calendar_date),
        CONSTRAINT CK_dim_date_month CHECK (calendar_month BETWEEN 1 AND 12),
        CONSTRAINT CK_dim_date_day CHECK (calendar_day BETWEEN 1 AND 31),
        CONSTRAINT CK_dim_date_weekday CHECK (day_of_week_iso BETWEEN 1 AND 7)
    );
END;
GO


/* ============================================================
   2. FACT - PORTFOLIO DIARIO

   Grain:
   date + client + campaign + portfolio

   IMPORTANTE:
   *_snapshot representa estado acumulado al corte.
   *_day representa flujo ocurrido durante el día.
   ============================================================ */

IF OBJECT_ID('analytics.fact_portfolio_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_portfolio_daily
    (
        portfolio_daily_key            BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_portfolio_daily PRIMARY KEY,
        date_key                       INT NOT NULL,
        client_key                     INT NOT NULL,
        campaign_key                   INT NOT NULL,
        portfolio_key                  BIGINT NOT NULL,

        assigned_clients_snapshot      INT NOT NULL DEFAULT (0),
        managed_clients_snapshot       INT NOT NULL DEFAULT (0),
        pending_clients_snapshot       INT NOT NULL DEFAULT (0),
        contacted_clients_snapshot     INT NOT NULL DEFAULT (0),
        direct_contact_snapshot        INT NOT NULL DEFAULT (0),

        assigned_amount_snapshot       DECIMAL(19,4) NOT NULL DEFAULT (0),
        managed_amount_snapshot        DECIMAL(19,4) NOT NULL DEFAULT (0),

        has_source_snapshot            BIT NOT NULL
            CONSTRAINT DF_fact_portfolio_daily_has_source_snapshot DEFAULT (0),

        management_events_day          INT NOT NULL DEFAULT (0),
        new_managed_clients_day        INT NOT NULL DEFAULT (0),
        new_direct_contacts_day        INT NOT NULL DEFAULT (0),
        promises_count_day             INT NOT NULL DEFAULT (0),
        promises_amount_day            DECIMAL(19,4) NOT NULL DEFAULT (0),
        payers_count_day               INT NOT NULL DEFAULT (0),
        recovered_amount_day           DECIMAL(19,4) NOT NULL DEFAULT (0),

        source_as_of_at                DATETIME2(3) NULL,
        loaded_at                      DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_portfolio_daily_loaded_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_portfolio_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_portfolio_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_portfolio_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_portfolio_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT CK_fact_portfolio_daily_nonnegative
            CHECK (
                assigned_clients_snapshot >= 0
                AND managed_clients_snapshot >= 0
                AND pending_clients_snapshot >= 0
                AND management_events_day >= 0
                AND promises_count_day >= 0
                AND payers_count_day >= 0
            )
    );

    CREATE UNIQUE INDEX UX_fact_portfolio_daily_grain
        ON analytics.fact_portfolio_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key
        );

    CREATE INDEX IX_fact_portfolio_daily_filter
        ON analytics.fact_portfolio_daily
        (
            client_key,
            campaign_key,
            date_key
        )
        INCLUDE
        (
            portfolio_key,
            assigned_clients_snapshot,
            managed_clients_snapshot,
            pending_clients_snapshot,
            recovered_amount_day,
            promises_count_day
        );
END;
GO


/* ============================================================
   3. FACT - CANALES / INTENSIDAD

   Evita crear una columna nueva por cada canal futuro.
   ============================================================ */

IF OBJECT_ID('analytics.fact_channel_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_channel_daily
    (
        channel_daily_key       BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_channel_daily PRIMARY KEY,
        date_key                INT NOT NULL,
        client_key              INT NOT NULL,
        campaign_key            INT NOT NULL,
        portfolio_key           BIGINT NOT NULL,
        channel_code            VARCHAR(30) NOT NULL,
        interaction_count       INT NOT NULL DEFAULT (0),
        loaded_at               DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_channel_daily_loaded_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_channel_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_channel_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_channel_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_channel_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT CK_fact_channel_daily_count
            CHECK (interaction_count >= 0)
    );

    CREATE UNIQUE INDEX UX_fact_channel_daily_grain
        ON analytics.fact_channel_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            channel_code
        );
END;
GO


/* ============================================================
   4. FACT - PRODUCCION DIARIA POR ASESOR

   Grain:
   date + client + campaign + portfolio + advisor
   ============================================================ */

IF OBJECT_ID('analytics.fact_advisor_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_advisor_daily
    (
        advisor_daily_key          BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_advisor_daily PRIMARY KEY,
        date_key                   INT NOT NULL,
        client_key                 INT NOT NULL,
        campaign_key               INT NOT NULL,
        portfolio_key              BIGINT NOT NULL,
        advisor_key                INT NOT NULL,

        management_events          INT NOT NULL DEFAULT (0),
        direct_contact_clients     INT NOT NULL DEFAULT (0),
        indirect_contact_clients   INT NOT NULL DEFAULT (0),
        no_contact_clients         INT NOT NULL DEFAULT (0),
        promises_count             INT NOT NULL DEFAULT (0),
        promises_amount            DECIMAL(19,4) NOT NULL DEFAULT (0),
        payers_count               INT NOT NULL DEFAULT (0),
        recovered_amount           DECIMAL(19,4) NOT NULL DEFAULT (0),

        source_as_of_at            DATETIME2(3) NULL,
        loaded_at                  DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_advisor_daily_loaded_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_advisor_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_advisor_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_advisor_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_advisor_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT FK_fact_advisor_daily_advisor
            FOREIGN KEY (advisor_key)
            REFERENCES analytics.dim_advisor(advisor_key)
    );

    CREATE UNIQUE INDEX UX_fact_advisor_daily_grain
        ON analytics.fact_advisor_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key
        );

    CREATE INDEX IX_fact_advisor_daily_ranking
        ON analytics.fact_advisor_daily
        (
            client_key,
            campaign_key,
            date_key
        )
        INCLUDE
        (
            advisor_key,
            management_events,
            direct_contact_clients,
            promises_count,
            recovered_amount
        );
END;
GO


/* ============================================================
   5. FACT - PROMESAS / PDP

   Fuente inicial transversal:
   aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos

   El source_status se conserva para auditoría.
   status_code es el estado normalizado del producto.
   ============================================================ */

IF OBJECT_ID('analytics.fact_promise', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_promise
    (
        promise_fact_key          BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_promise PRIMARY KEY,
        client_key                INT NOT NULL,
        campaign_key              INT NOT NULL,
        portfolio_key             BIGINT NOT NULL,
        advisor_key               INT NULL,

        source_operation_id       BIGINT NULL,       -- nId_DocxCobrarOpe
        source_debtor_id          BIGINT NOT NULL,   -- nId_PersDeudor
        management_at             DATETIME2(3) NULL,
        promise_due_date          DATE NULL,
        promise_amount            DECIMAL(19,4) NOT NULL DEFAULT (0),
        paid_amount               DECIMAL(19,4) NOT NULL DEFAULT (0),
        last_payment_date         DATETIME2(3) NULL,

        source_status             VARCHAR(100) NULL,
        status_code               VARCHAR(40) NOT NULL,
        is_valid_promise          BIT NOT NULL DEFAULT (0),

        source_updated_at         DATETIME2(3) NULL,
        loaded_at                 DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_promise_loaded_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_promise_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_promise_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_promise_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT FK_fact_promise_advisor
            FOREIGN KEY (advisor_key)
            REFERENCES analytics.dim_advisor(advisor_key),

        CONSTRAINT CK_fact_promise_status_code
            CHECK (status_code IN
            (
                'ACTIVE',
                'DUE_TODAY',
                'FULFILLED',
                'PARTIAL',
                'FULFILLED_OUT_OF_RANGE',
                'PENDING_CONFIRMATION',
                'BROKEN',
                'NO_PROMISE_NO_PAYMENT',
                'UNKNOWN'
            ))
    );

    CREATE UNIQUE INDEX UX_fact_promise_source_operation
        ON analytics.fact_promise(client_key, source_operation_id)
        WHERE source_operation_id IS NOT NULL;

    CREATE INDEX IX_fact_promise_due
        ON analytics.fact_promise
        (
            client_key,
            campaign_key,
            promise_due_date,
            status_code
        )
        INCLUDE
        (
            portfolio_key,
            advisor_key,
            source_debtor_id,
            promise_amount,
            paid_amount,
            is_valid_promise
        );

    CREATE INDEX IX_fact_promise_advisor
        ON analytics.fact_promise(advisor_key, management_at)
        INCLUDE (status_code, promise_amount, paid_amount);
END;
GO


/* ============================================================
   6. FACT - META MENSUAL

   Una meta puede existir a nivel campaña o a nivel cartera.
   ============================================================ */

IF OBJECT_ID('analytics.fact_target_monthly', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_target_monthly
    (
        target_key                   BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_target_monthly PRIMARY KEY,
        client_key                   INT NOT NULL,
        campaign_key                 INT NOT NULL,
        portfolio_key                BIGINT NULL,

        target_recovered_amount      DECIMAL(19,4) NULL,
        target_effectiveness_rate    DECIMAL(9,6) NULL,

        source_reference             VARCHAR(200) NULL,
        source_as_of_at              DATETIME2(3) NULL,
        loaded_at                    DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_target_monthly_loaded_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_target_monthly_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_target_monthly_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_target_monthly_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT CK_fact_target_monthly_effectiveness
            CHECK (
                target_effectiveness_rate IS NULL
                OR target_effectiveness_rate BETWEEN 0 AND 1
            )
    );

    CREATE UNIQUE INDEX UX_fact_target_monthly_campaign
        ON analytics.fact_target_monthly(client_key, campaign_key)
        WHERE portfolio_key IS NULL;

    CREATE UNIQUE INDEX UX_fact_target_monthly_portfolio
        ON analytics.fact_target_monthly(client_key, campaign_key, portfolio_key)
        WHERE portfolio_key IS NOT NULL;
END;
GO


/* ============================================================
   7. CONTROL ETL MÍNIMO

   La implementación de procesos se realizará en ETAPA 6.
   ============================================================ */

IF OBJECT_ID('etl.watermark', 'U') IS NULL
BEGIN
    CREATE TABLE etl.watermark
    (
        source_code              VARCHAR(100) NOT NULL
            CONSTRAINT PK_etl_watermark PRIMARY KEY,
        last_success_at          DATETIME2(3) NULL,
        last_source_datetime     DATETIME2(3) NULL,
        last_source_id           BIGINT NULL,
        overlap_days             INT NOT NULL
            CONSTRAINT DF_etl_watermark_overlap_days DEFAULT (2),
        updated_at               DATETIME2(3) NOT NULL
            CONSTRAINT DF_etl_watermark_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT CK_etl_watermark_overlap
            CHECK (overlap_days BETWEEN 0 AND 31)
    );
END;
GO


/* ============================================================
   8. WATERMARKS INICIALES - SIN HARDCODEAR CLIENTES EN REACT
   ============================================================ */

IF NOT EXISTS (
    SELECT 1 FROM etl.watermark
    WHERE source_code = 'CLARO_PORTFOLIO_SNAPSHOT'
)
BEGIN
    INSERT INTO etl.watermark(source_code, overlap_days)
    VALUES ('CLARO_PORTFOLIO_SNAPSHOT', 1);
END;

IF NOT EXISTS (
    SELECT 1 FROM etl.watermark
    WHERE source_code = 'CLARO_EVOLUTION_DAILY'
)
BEGIN
    INSERT INTO etl.watermark(source_code, overlap_days)
    VALUES ('CLARO_EVOLUTION_DAILY', 3);
END;

IF NOT EXISTS (
    SELECT 1 FROM etl.watermark
    WHERE source_code = 'GESTION_COB2_LIVE'
)
BEGIN
    INSERT INTO etl.watermark(source_code, overlap_days)
    VALUES ('GESTION_COB2_LIVE', 2);
END;
GO
