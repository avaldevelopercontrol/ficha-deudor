/*
Analytics Access - scope de grupos SISGES para Power BI / Reporteria
Motor objetivo: SQL Server / aval_analytics

Objetivos
- Mantener option_client_scope sin cambios para Portfolio Control Center.
- Permitir que los tableros Power BI autoricen por nId_Grupo exacto de SISGES.
- Evitar que dos grupos distintos con el mismo nid_cliente otorguen el mismo acceso.
- Mantener default deny: un BI sin grupos activos no queda habilitado por group scope.

IMPORTANTE
- sisges_group_id referencia dbo.av_Grupo.nId_Grupo en SISGES, pero no se crea FK
  porque pertenece a otra base/conexion.
- Este script no migra automaticamente option_client_scope a grupos: un crm_client_id
  puede corresponder a varios grupos y la conversion seria ambigua.
- Es aditivo e idempotente y no modifica option_client_scope.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.schemas
    WHERE name = 'analytics_access'
)
BEGIN
    EXEC('CREATE SCHEMA analytics_access AUTHORIZATION dbo;');
END;
GO

IF OBJECT_ID('analytics_access.option_group_scope', 'U') IS NULL
BEGIN
    CREATE TABLE analytics_access.option_group_scope
    (
        option_id       INT NOT NULL,
        sisges_group_id INT NOT NULL,
        is_active       BIT NOT NULL
            CONSTRAINT DF_option_group_scope_is_active
            DEFAULT (1),
        created_by      INT NULL,
        created_at      DATETIME2(3) NOT NULL
            CONSTRAINT DF_option_group_scope_created_at
            DEFAULT (SYSUTCDATETIME()),
        updated_by      INT NULL,
        updated_at      DATETIME2(3) NOT NULL
            CONSTRAINT DF_option_group_scope_updated_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_option_group_scope
            PRIMARY KEY (option_id, sisges_group_id),

        CONSTRAINT CK_option_group_scope_option_id
            CHECK (option_id > 0),

        CONSTRAINT CK_option_group_scope_sisges_group_id
            CHECK (sisges_group_id > 0)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics_access.option_group_scope')
      AND name = 'IX_option_group_scope_active_group'
)
BEGIN
    CREATE INDEX IX_option_group_scope_active_group
        ON analytics_access.option_group_scope
        (
            sisges_group_id,
            option_id
        )
        WHERE is_active = 1;
END;
GO

IF OBJECT_ID('analytics_access.option_group_scope_audit', 'U') IS NULL
BEGIN
    CREATE TABLE analytics_access.option_group_scope_audit
    (
        audit_id            BIGINT IDENTITY(1, 1) NOT NULL,
        option_id           INT NOT NULL,
        previous_group_ids  NVARCHAR(MAX) NOT NULL,
        new_group_ids       NVARCHAR(MAX) NOT NULL,
        created_by          INT NULL,
        created_at          DATETIME2(3) NOT NULL
            CONSTRAINT DF_option_group_scope_audit_created_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_option_group_scope_audit
            PRIMARY KEY (audit_id),

        CONSTRAINT CK_option_group_scope_audit_option_id
            CHECK (option_id > 0),

        CONSTRAINT CK_option_group_scope_audit_previous_json
            CHECK (ISJSON(previous_group_ids) = 1),

        CONSTRAINT CK_option_group_scope_audit_new_json
            CHECK (ISJSON(new_group_ids) = 1)
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics_access.option_group_scope_audit')
      AND name = 'IX_option_group_scope_audit_option_created'
)
BEGIN
    CREATE INDEX IX_option_group_scope_audit_option_created
        ON analytics_access.option_group_scope_audit
        (
            option_id,
            created_at DESC
        );
END;
GO
