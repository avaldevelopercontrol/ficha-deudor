/*
Portfolio Control Center - ETAPA 6
Soporte para pagadores exactos por asesor en rangos multi-día
Motor: SQL Server

Ejecutar DENTRO de aval_analytics después de:
  001_portfolio_v1_schema.sql
  005_portfolio_v1_advisor_support.sql
  009_portfolio_v1_advisor_range_support.sql

Este script NO carga datos.
La carga la realiza etl.usp_load_claro_advisor_daily.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   Pagador por asesor/deudor/día

   Grain:
   date + client + campaign + portfolio + advisor + debtor

   Solo existe una fila cuando el deudor tiene paid_amount > 0 en
   una gestión real atribuible al asesor. Las filas sintéticas
   "Pago Sin Promesa" continúan fuera del scope del asesor.

   Motivo:
   fact_advisor_daily.payers_count es un distinct diario. Sumarlo
   en un rango puede duplicar al mismo pagador entre fechas.
   ============================================================ */

IF OBJECT_ID('analytics.fact_advisor_debtor_payment_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_advisor_debtor_payment_daily
    (
        advisor_debtor_payment_daily_key BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_advisor_debtor_payment_daily PRIMARY KEY,

        date_key                 INT NOT NULL,
        client_key               INT NOT NULL,
        campaign_key             INT NOT NULL,
        portfolio_key            BIGINT NOT NULL,
        advisor_key              INT NOT NULL,
        source_debtor_id         BIGINT NOT NULL,

        source_as_of_at          DATETIME2(3) NULL,
        loaded_at                DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_advisor_debtor_payment_daily_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_advisor_debtor_payment_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_advisor_debtor_payment_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_advisor_debtor_payment_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_advisor_debtor_payment_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT FK_fact_advisor_debtor_payment_daily_advisor
            FOREIGN KEY (advisor_key)
            REFERENCES analytics.dim_advisor(advisor_key)
    );
END;
GO


IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.fact_advisor_debtor_payment_daily')
      AND name = 'UX_fact_advisor_debtor_payment_daily_grain'
)
BEGIN
    CREATE UNIQUE INDEX UX_fact_advisor_debtor_payment_daily_grain
        ON analytics.fact_advisor_debtor_payment_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key,
            source_debtor_id
        );
END;
GO


IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.fact_advisor_debtor_payment_daily')
      AND name = 'IX_fact_advisor_debtor_payment_daily_range'
)
BEGIN
    CREATE INDEX IX_fact_advisor_debtor_payment_daily_range
        ON analytics.fact_advisor_debtor_payment_daily
        (
            client_key,
            campaign_key,
            advisor_key,
            date_key
        )
        INCLUDE
        (
            portfolio_key,
            source_debtor_id
        );
END;
GO


CREATE OR ALTER VIEW analytics.v_advisor_debtor_payment_daily
AS
SELECT
    f.advisor_debtor_payment_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,
    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,
    f.source_debtor_id,
    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_debtor_payment_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key;
GO
