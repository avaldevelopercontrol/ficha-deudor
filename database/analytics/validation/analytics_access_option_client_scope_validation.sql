/*
Validacion - Analytics Access / ETAPA 1
Motor objetivo: SQL Server / aval_analytics

Comprueba:
- existencia del esquema y tabla;
- columnas principales;
- PK e indice de acceso inverso;
- bootstrap Portfolio Control Center (23) -> CLARO (95);
- diagnostico de clientes configurados que aun no existen en analytics.dim_client.
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.schemas
    WHERE name = 'analytics_access'
)
BEGIN
    THROW 53000, 'No existe el esquema analytics_access.', 1;
END;

IF OBJECT_ID('analytics_access.option_client_scope', 'U') IS NULL
BEGIN
    THROW 53001, 'No existe analytics_access.option_client_scope.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.key_constraints
    WHERE parent_object_id = OBJECT_ID('analytics_access.option_client_scope')
      AND type = 'PK'
      AND name = 'PK_option_client_scope'
)
BEGIN
    THROW 53002, 'No existe PK_option_client_scope.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics_access.option_client_scope')
      AND name = 'IX_option_client_scope_active_client'
)
BEGIN
    THROW 53003, 'No existe IX_option_client_scope_active_client.', 1;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM analytics_access.option_client_scope
    WHERE option_id = 23
      AND crm_client_id = 95
      AND is_active = 1
)
BEGIN
    THROW 53004, 'No existe el bootstrap activo Portfolio Control Center (23) -> CLARO (95).', 1;
END;

SELECT
    DB_NAME() AS database_name,
    s.name AS schema_name,
    t.name AS table_name,
    SUM(p.rows) AS row_count
FROM sys.tables AS t
INNER JOIN sys.schemas AS s
    ON s.schema_id = t.schema_id
INNER JOIN sys.partitions AS p
    ON p.object_id = t.object_id
   AND p.index_id IN (0, 1)
WHERE s.name = 'analytics_access'
  AND t.name = 'option_client_scope'
GROUP BY
    s.name,
    t.name;

SELECT
    c.column_id,
    c.name AS column_name,
    TYPE_NAME(c.user_type_id) AS data_type,
    c.max_length,
    c.precision,
    c.scale,
    c.is_nullable
FROM sys.columns AS c
WHERE c.object_id = OBJECT_ID('analytics_access.option_client_scope')
ORDER BY c.column_id;

SELECT
    option_id,
    crm_client_id,
    is_active,
    created_by,
    created_at,
    updated_by,
    updated_at
FROM analytics_access.option_client_scope
ORDER BY
    option_id,
    crm_client_id;

/*
Diagnostico, no error:
Una relacion puede existir antes que el cliente tenga datos cargados en Analytics.
Para Portfolio Control Center, sin embargo, el cliente tambien debera existir en
analytics.dim_client antes de poder ofrecerse como cartera operativa.
*/
IF OBJECT_ID('analytics.dim_client', 'U') IS NOT NULL
BEGIN
    SELECT
        s.option_id,
        s.crm_client_id,
        s.is_active,
        CASE WHEN c.crm_client_id IS NULL THEN 0 ELSE 1 END AS exists_in_dim_client,
        c.client_name,
        c.is_active AS analytics_client_is_active
    FROM analytics_access.option_client_scope AS s
    LEFT JOIN analytics.dim_client AS c
        ON c.crm_client_id = s.crm_client_id
    ORDER BY
        s.option_id,
        s.crm_client_id;
END;
ELSE
BEGIN
    PRINT 'ADVERTENCIA: analytics.dim_client no existe; se omite el diagnostico de clientes Analytics.';
END;
GO
