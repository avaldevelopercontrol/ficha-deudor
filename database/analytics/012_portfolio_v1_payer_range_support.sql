/*
Portfolio Control Center - ETAPA 6
Soporte de pagadores exactos Portfolio en rangos multi-día
Motor: SQL Server

PRERREQUISITOS:
- 001_portfolio_v1_schema.sql
- 003_portfolio_v1_etl_support.sql
- 004_portfolio_v1_live_support.sql

Este script NO carga datos.

Motivo:
fact_portfolio_daily.payers_count_day es un DISTINCT diario. Sumarlo entre
fechas puede contar varias veces al mismo deudor. Para rangos exactos se
preserva el grain fecha + cartera + deudor de toda fila con pago, incluyendo
las filas sintéticas "Pago Sin Promesa", porque sí pertenecen al recaudo y al
conteo de pagadores de Portfolio.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


IF OBJECT_ID('analytics.fact_debtor_payment_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_debtor_payment_daily
    (
        debtor_payment_daily_key BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_debtor_payment_daily PRIMARY KEY,

        date_key                 INT NOT NULL,
        client_key               INT NOT NULL,
        campaign_key             INT NOT NULL,
        portfolio_key            BIGINT NOT NULL,
        source_debtor_id         BIGINT NOT NULL,

        source_as_of_at          DATETIME2(3) NULL,
        loaded_at                DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_debtor_payment_daily_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_debtor_payment_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_debtor_payment_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_debtor_payment_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_debtor_payment_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key)
    );

    CREATE UNIQUE INDEX UX_fact_debtor_payment_daily_grain
        ON analytics.fact_debtor_payment_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            source_debtor_id
        );

    CREATE INDEX IX_fact_debtor_payment_daily_range
        ON analytics.fact_debtor_payment_daily
        (
            client_key,
            campaign_key,
            date_key
        )
        INCLUDE
        (
            portfolio_key,
            source_debtor_id
        );
END;
GO


CREATE OR ALTER VIEW analytics.v_debtor_payment_daily
AS
SELECT
    f.debtor_payment_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.source_debtor_id,
    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key;
GO
