/*
Portfolio Control Center - ETAPA 6 / Avance 3
Soporte de jerarquía Supervisor -> Asesor
Motor: SQL Server

Ejecutar en la base Analytics.

Principios:
- source_supervisor_id = aval_cob.dbo.av_Usuario.nId_Usuario
- supervisor_document = DNI/cUsr_NroDoc
- una sola relación current por advisor
- asesores sin nid_UsuSuper permanecen sin bridge current
- no se inventa historia previa a la primera observación Analytics
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


/* ============================================================
   1. Documento estable del supervisor
   ============================================================ */

IF COL_LENGTH('analytics.dim_supervisor', 'supervisor_document') IS NULL
BEGIN
    ALTER TABLE analytics.dim_supervisor
        ADD supervisor_document VARCHAR(30) NULL;
END;
GO


IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.dim_supervisor')
      AND name = 'IX_dim_supervisor_client_document'
)
BEGIN
    CREATE INDEX IX_dim_supervisor_client_document
        ON analytics.dim_supervisor(client_key, supervisor_document)
        WHERE supervisor_document IS NOT NULL;
END;
GO


/* ============================================================
   2. Invariante: un asesor solo puede tener un supervisor current
   ============================================================ */

IF EXISTS
(
    SELECT advisor_key
    FROM analytics.bridge_supervisor_advisor
    WHERE is_current = 1
    GROUP BY advisor_key
    HAVING COUNT(*) > 1
)
BEGIN
    THROW 51900,
        'Existen asesores con mas de un supervisor current. Corregir antes de crear el indice.',
        1;
END;
GO


IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.bridge_supervisor_advisor')
      AND name = 'UX_bridge_supervisor_advisor_current_advisor'
)
BEGIN
    CREATE UNIQUE INDEX UX_bridge_supervisor_advisor_current_advisor
        ON analytics.bridge_supervisor_advisor(advisor_key)
        WHERE is_current = 1;
END;
GO


/* ============================================================
   3. Contrato de lectura current
   Incluye asesores sin supervisor.
   ============================================================ */

CREATE OR ALTER VIEW analytics.v_advisor_supervisor_current
AS
SELECT
    a.client_key,

    a.advisor_key,
    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,
    a.role_name,
    a.is_active AS advisor_is_active,

    b.supervisor_advisor_key,
    b.valid_from,
    b.valid_to,
    b.is_current,

    s.supervisor_key,
    s.source_supervisor_id,
    s.supervisor_document,
    s.supervisor_name,
    s.is_active AS supervisor_is_active

FROM analytics.dim_advisor AS a

LEFT JOIN analytics.bridge_supervisor_advisor AS b
    ON b.advisor_key = a.advisor_key
   AND b.is_current = 1

LEFT JOIN analytics.dim_supervisor AS s
    ON s.supervisor_key = b.supervisor_key;
GO
