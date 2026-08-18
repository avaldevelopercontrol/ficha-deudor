/*
Portfolio Control Center - ETAPA 6
Soporte físico de evolución histórica CLARO
Motor: SQL Server

PRERREQUISITOS:
- 001_portfolio_v1_schema.sql
- 003_portfolio_v1_etl_support.sql

Este script NO carga datos.

Semántica:
- EVOL conserva el estado histórico de cartera a grain fecha + cartera;
- el recaudo NO se toma de MONTO_DE_PAGOS de EVOL porque GESTION-COB2 es la
  fuente canonical de pagos/recaudo para Portfolio Control Center;
- las views combinan estado EVOL con recovered_amount_day canonical ya cargado
  en fact_portfolio_daily.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


IF OBJECT_ID('analytics.fact_portfolio_evolution_daily', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.fact_portfolio_evolution_daily
    (
        portfolio_evolution_daily_key BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_fact_portfolio_evolution_daily PRIMARY KEY,

        date_key                     INT NOT NULL,
        client_key                   INT NOT NULL,
        campaign_key                 INT NOT NULL,
        portfolio_key                BIGINT NOT NULL,

        assigned_clients             INT NOT NULL,
        managed_clients              INT NOT NULL,
        pending_clients              INT NOT NULL,

        source_as_of_at              DATETIME2(3) NULL,
        loaded_at                    DATETIME2(3) NOT NULL
            CONSTRAINT DF_fact_portfolio_evolution_daily_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_fact_portfolio_evolution_daily_date
            FOREIGN KEY (date_key)
            REFERENCES analytics.dim_date(date_key),

        CONSTRAINT FK_fact_portfolio_evolution_daily_client
            FOREIGN KEY (client_key)
            REFERENCES analytics.dim_client(client_key),

        CONSTRAINT FK_fact_portfolio_evolution_daily_campaign
            FOREIGN KEY (campaign_key)
            REFERENCES analytics.dim_campaign(campaign_key),

        CONSTRAINT FK_fact_portfolio_evolution_daily_portfolio
            FOREIGN KEY (portfolio_key)
            REFERENCES analytics.dim_portfolio(portfolio_key),

        CONSTRAINT CK_fact_portfolio_evolution_daily_nonnegative
            CHECK
            (
                assigned_clients >= 0
                AND managed_clients >= 0
                AND pending_clients >= 0
            ),

        CONSTRAINT CK_fact_portfolio_evolution_daily_balance
            CHECK (pending_clients = assigned_clients - managed_clients)
    );

    CREATE UNIQUE INDEX UX_fact_portfolio_evolution_daily_grain
        ON analytics.fact_portfolio_evolution_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key
        );

    CREATE INDEX IX_fact_portfolio_evolution_daily_range
        ON analytics.fact_portfolio_evolution_daily
        (
            client_key,
            campaign_key,
            date_key
        )
        INCLUDE
        (
            portfolio_key,
            assigned_clients,
            managed_clients,
            pending_clients
        );
END;
GO


/* ============================================================
   Evolución por cartera

   recovered_amount_to_date se calcula únicamente con flows canonical de
   fact_portfolio_daily. EVOL no reemplaza la semántica de recaudo LIVE.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_portfolio_evolution_daily
AS
WITH RecoveryDaily AS
(
    SELECT
        f.date_key,
        f.client_key,
        f.campaign_key,
        f.portfolio_key,
        SUM(f.recovered_amount_day) AS recovered_amount_day
    FROM analytics.fact_portfolio_daily AS f
    GROUP BY
        f.date_key,
        f.client_key,
        f.campaign_key,
        f.portfolio_key
),
EvolutionWithRecovery AS
(
    SELECT
        e.portfolio_evolution_daily_key,
        e.date_key,
        d.calendar_date,
        e.client_key,
        e.campaign_key,
        e.portfolio_key,
        e.assigned_clients,
        e.managed_clients,
        e.pending_clients,
        ISNULL(r.recovered_amount_day, 0) AS recovered_amount_day,
        e.source_as_of_at,
        e.loaded_at
    FROM analytics.fact_portfolio_evolution_daily AS e
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = e.date_key
    LEFT JOIN RecoveryDaily AS r
        ON r.date_key = e.date_key
       AND r.client_key = e.client_key
       AND r.campaign_key = e.campaign_key
       AND r.portfolio_key = e.portfolio_key
)
SELECT
    portfolio_evolution_daily_key,
    date_key,
    calendar_date,
    client_key,
    campaign_key,
    portfolio_key,
    assigned_clients,
    managed_clients,
    pending_clients,
    recovered_amount_day,
    SUM(recovered_amount_day) OVER
    (
        PARTITION BY client_key, campaign_key, portfolio_key
        ORDER BY date_key
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS recovered_amount_to_date,
    source_as_of_at,
    loaded_at
FROM EvolutionWithRecovery;
GO


/* ============================================================
   Evolución agregada de campaña
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_campaign_evolution_daily
AS
WITH EvolutionDaily AS
(
    SELECT
        e.date_key,
        d.calendar_date,
        e.client_key,
        e.campaign_key,
        SUM(e.assigned_clients) AS assigned_clients,
        SUM(e.managed_clients) AS managed_clients,
        SUM(e.pending_clients) AS pending_clients,
        MAX(e.source_as_of_at) AS source_as_of_at,
        MAX(e.loaded_at) AS loaded_at
    FROM analytics.fact_portfolio_evolution_daily AS e
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = e.date_key
    GROUP BY
        e.date_key,
        d.calendar_date,
        e.client_key,
        e.campaign_key
),
RecoveryDaily AS
(
    SELECT
        f.date_key,
        f.client_key,
        f.campaign_key,
        SUM(f.recovered_amount_day) AS recovered_amount_day
    FROM analytics.fact_portfolio_daily AS f
    GROUP BY
        f.date_key,
        f.client_key,
        f.campaign_key
),
Combined AS
(
    SELECT
        e.date_key,
        e.calendar_date,
        e.client_key,
        e.campaign_key,
        e.assigned_clients,
        e.managed_clients,
        e.pending_clients,
        ISNULL(r.recovered_amount_day, 0) AS recovered_amount_day,
        e.source_as_of_at,
        e.loaded_at
    FROM EvolutionDaily AS e
    LEFT JOIN RecoveryDaily AS r
        ON r.date_key = e.date_key
       AND r.client_key = e.client_key
       AND r.campaign_key = e.campaign_key
)
SELECT
    date_key,
    calendar_date,
    client_key,
    campaign_key,
    assigned_clients,
    managed_clients,
    pending_clients,
    recovered_amount_day,
    SUM(recovered_amount_day) OVER
    (
        PARTITION BY client_key, campaign_key
        ORDER BY date_key
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS recovered_amount_to_date,
    CAST(
        1.0 * managed_clients / NULLIF(assigned_clients, 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,
    source_as_of_at,
    loaded_at
FROM Combined;
GO
