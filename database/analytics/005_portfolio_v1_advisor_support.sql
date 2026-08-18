/*
Portfolio Control Center - ETAPA 6 / Avance 3
Soporte de asesor
Motor: SQL Server

Ejecutar en la base Analytics.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   1. Documento estable del asesor

   source_advisor_id seguirá siendo el ID técnico de la fuente
   (nId_Usuario). El DNI se conserva como atributo/mapping.
   ============================================================ */

IF COL_LENGTH('analytics.dim_advisor', 'advisor_document') IS NULL
BEGIN
    ALTER TABLE analytics.dim_advisor
        ADD advisor_document VARCHAR(30) NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.dim_advisor')
      AND name = 'IX_dim_advisor_client_document'
)
BEGIN
    CREATE INDEX IX_dim_advisor_client_document
        ON analytics.dim_advisor(client_key, advisor_document)
        WHERE advisor_document IS NOT NULL;
END;
GO


/* ============================================================
   2. Contrato enriquecido para consumo futuro del API
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_advisor_daily_metrics
AS
SELECT
    f.advisor_daily_key,
    f.date_key,
    d.calendar_date,
    f.client_key,
    f.campaign_key,
    f.portfolio_key,
    f.advisor_key,

    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,
    a.role_name,

    f.management_events,
    f.direct_contact_clients,
    f.indirect_contact_clients,
    f.no_contact_clients,
    f.promises_count,
    f.promises_amount,
    f.payers_count,
    f.recovered_amount,

    CAST(
        1.0 * f.direct_contact_clients
        / NULLIF(
            f.direct_contact_clients
            + f.indirect_contact_clients
            + f.no_contact_clients,
            0
        )
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    CAST(
        1.0 * f.promises_count
        / NULLIF(f.direct_contact_clients, 0)
        AS DECIMAL(18,6)
    ) AS close_rate,

    f.source_as_of_at,
    f.loaded_at
FROM analytics.fact_advisor_daily AS f
INNER JOIN analytics.dim_date AS d
    ON d.date_key = f.date_key
INNER JOIN analytics.dim_advisor AS a
    ON a.advisor_key = f.advisor_key;
GO
