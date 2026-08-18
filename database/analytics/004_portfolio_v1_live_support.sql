/*
Portfolio Control Center - ETAPA 6 / Avance 2
Soporte de grain para contacto intradía
Motor: SQL Server

Ejecutar DENTRO de la base Analytics, después de:
  001_portfolio_v1_schema.sql
  002_portfolio_v1_contract_views.sql
  003_portfolio_v1_etl_support.sql

Este script NO carga datos.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   Contacto por deudor/día

   Motivo:
   RPC requiere DISTINCT cartera + deudor, no SUM de filas de gestión.
   Mantener este grain permite recalcular RPC para cualquier rango sin
   inflarlo si un deudor tuvo varias gestiones el mismo día.
   ============================================================ */

IF OBJECT_ID('analytics.fact_debtor_contact_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_debtor_contact_daily
    (
        debtor_contact_daily_key BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_debtor_contact_daily PRIMARY KEY,

        date_key                 INT NOT NULL,
        client_key               INT NOT NULL,
        campaign_key             INT NOT NULL,
        portfolio_key            BIGINT NOT NULL,
        source_debtor_id         BIGINT NOT NULL,

        had_direct_contact       BIT NOT NULL DEFAULT (0), -- CD
        had_indirect_contact     BIT NOT NULL DEFAULT (0), -- CI
        had_no_contact           BIT NOT NULL DEFAULT (0), -- NC

        source_as_of_at          DATETIME2(3) NULL,
        loaded_at                DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_debtor_contact_daily_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_debtor_contact_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_debtor_contact_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_debtor_contact_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_debtor_contact_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key)
    );

    CREATE UNIQUE INDEX UX_fact_debtor_contact_daily_grain
        ON analytics.fact_debtor_contact_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            source_debtor_id
        );

    CREATE INDEX IX_fact_debtor_contact_daily_range
        ON analytics.fact_debtor_contact_daily
        (
            client_key,
            campaign_key,
            date_key
        )
        INCLUDE
        (
            portfolio_key,
            source_debtor_id,
            had_direct_contact,
            had_indirect_contact,
            had_no_contact
        );
END;
GO


CREATE OR ALTER VIEW analytics.v_debtor_contact_daily
AS
SELECT
    f.debtor_contact_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.source_debtor_id,
    f.had_direct_contact,
    f.had_indirect_contact,
    f.had_no_contact,

    CASE
        WHEN f.had_direct_contact = 1
          OR f.had_indirect_contact = 1
          OR f.had_no_contact = 1
            THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_classifiable_contact,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_debtor_contact_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key;
GO
