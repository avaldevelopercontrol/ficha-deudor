/*
Analytics Access - ETAPA 1
Scope de clientes por opcion Analytics
Motor objetivo: SQL Server / aval_analytics

Objetivos
- Crear un unico esquema de acceso para funcionalidades Analytics.
- Relacionar nId_Opcion de SISGES con uno o varios crm_client_id.
- Reutilizar la misma relacion para Portfolio Control Center y Reporteria.
- Mantener default deny: una opcion sin relaciones activas no tiene clientes habilitados.
- Preservar el comportamiento actual de Portfolio Control Center habilitando
  inicialmente la opcion 23 para CLARO (crm_client_id = 95).

IMPORTANTE
- Este script NO modifica la base transaccional de SISGES.
- No se crean FK hacia SISGES porque option_id y crm_client_id son identificadores
  externos respecto de aval_analytics.
- Tampoco se crea FK hacia analytics.dim_client: Reporteria puede configurar un BI
  para un cliente aunque ese cliente aun no tenga modelo analitico provisionado.
- Es aditivo e idempotente: no elimina ni recrea objetos existentes.
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

IF OBJECT_ID('analytics_access.option_client_scope', 'U') IS NULL
BEGIN
    CREATE TABLE analytics_access.option_client_scope
    (
        option_id       INT NOT NULL,
        crm_client_id   INT NOT NULL,
        is_active       BIT NOT NULL
            CONSTRAINT DF_option_client_scope_is_active
            DEFAULT (1),
        created_by      INT NULL,
        created_at      DATETIME2(3) NOT NULL
            CONSTRAINT DF_option_client_scope_created_at
            DEFAULT (SYSUTCDATETIME()),
        updated_by      INT NULL,
        updated_at      DATETIME2(3) NOT NULL
            CONSTRAINT DF_option_client_scope_updated_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_option_client_scope
            PRIMARY KEY (option_id, crm_client_id),

        CONSTRAINT CK_option_client_scope_option_id
            CHECK (option_id > 0),

        CONSTRAINT CK_option_client_scope_crm_client_id
            CHECK (crm_client_id > 0)
    );
END;
GO

/*
Acceso principal por opcion:
- La PK (option_id, crm_client_id) cubre las consultas administrativas y PCC.

Acceso inverso por cliente:
- Reporteria necesitara resolver rapidamente que opciones estan habilitadas para
  los clientes efectivos del usuario.
*/
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics_access.option_client_scope')
      AND name = 'IX_option_client_scope_active_client'
)
BEGIN
    CREATE INDEX IX_option_client_scope_active_client
        ON analytics_access.option_client_scope
        (
            crm_client_id,
            option_id
        )
        WHERE is_active = 1;
END;
GO

/*
Bootstrap de compatibilidad.
Portfolio Control Center tiene nId_Opcion = 23 en el registro React actual y hoy
opera con CLARO crm_client_id = 95. Se registra solo si la relacion nunca existio.
Si en el futuro un administrador la desactiva, volver a ejecutar este script NO
la reactiva automaticamente.
*/
IF NOT EXISTS
(
    SELECT 1
    FROM analytics_access.option_client_scope
    WHERE option_id = 23
      AND crm_client_id = 95
)
BEGIN
    INSERT INTO analytics_access.option_client_scope
    (
        option_id,
        crm_client_id,
        is_active,
        created_by,
        updated_by
    )
    VALUES
    (
        23,
        95,
        1,
        NULL,
        NULL
    );
END;
GO
