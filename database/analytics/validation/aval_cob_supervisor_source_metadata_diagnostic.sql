/*
Portfolio Control Center - ETAPA 6 / Avance 3
Diagnóstico liviano de jerarquía en CRM SISGES
Base objetivo: aval_cob
SOLO METADATA - NO ESCANEA DATOS DE NEGOCIO

Objetivo:
- localizar tablas/vistas candidatas de usuario/gestor/asesor/supervisor;
- detectar posibles relaciones supervisor -> asesor;
- identificar columnas ID/DNI/nombre/cargo/estado/vigencia;
- NO consultar tablas masivas todavía.

Ejecutar conectado al motor del CRM y sobre la BD aval_cob.
*/

USE aval_cob;
GO

SET NOCOUNT ON;

PRINT '============================================================';
PRINT '1. OBJETOS CANDIDATOS POR NOMBRE';
PRINT '============================================================';

SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    o.create_date,
    o.modify_date
FROM sys.objects AS o
INNER JOIN sys.schemas AS s
    ON s.schema_id = o.schema_id
WHERE o.type IN ('U', 'V')
  AND
  (
       LOWER(o.name) LIKE '%usuario%'
    OR LOWER(o.name) LIKE '%user%'
    OR LOWER(o.name) LIKE '%gestor%'
    OR LOWER(o.name) LIKE '%asesor%'
    OR LOWER(o.name) LIKE '%supervisor%'
    OR LOWER(o.name) LIKE '%coordinador%'
    OR LOWER(o.name) LIKE '%jefe%'
    OR LOWER(o.name) LIKE '%equipo%'
    OR LOWER(o.name) LIKE '%grupo%'
    OR LOWER(o.name) LIKE '%perfil%'
    OR LOWER(o.name) LIKE '%personal%'
    OR LOWER(o.name) LIKE '%empleado%'
  )
ORDER BY
    o.type_desc,
    o.name;


PRINT '============================================================';
PRINT '2. COLUMNAS CANDIDATAS DE JERARQUIA';
PRINT '============================================================';

SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    c.column_id,
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable
FROM sys.objects AS o
INNER JOIN sys.schemas AS s
    ON s.schema_id = o.schema_id
INNER JOIN sys.columns AS c
    ON c.object_id = o.object_id
INNER JOIN sys.types AS t
    ON t.user_type_id = c.user_type_id
WHERE o.type IN ('U', 'V')
  AND
  (
       LOWER(c.name) LIKE '%supervisor%'
    OR LOWER(c.name) LIKE '%coordinador%'
    OR LOWER(c.name) LIKE '%jefe%'
    OR LOWER(c.name) LIKE '%lider%'
    OR LOWER(c.name) LIKE '%responsable%'
    OR LOWER(c.name) LIKE '%manager%'
    OR LOWER(c.name) LIKE '%parent%'
    OR LOWER(c.name) LIKE '%padre%'
  )
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '3. OBJETOS CON JERARQUIA + IDENTIDAD DE USUARIO';
PRINT '============================================================';

;WITH HierarchyObjects AS
(
    SELECT DISTINCT c.object_id
    FROM sys.columns AS c
    WHERE
           LOWER(c.name) LIKE '%supervisor%'
        OR LOWER(c.name) LIKE '%coordinador%'
        OR LOWER(c.name) LIKE '%jefe%'
        OR LOWER(c.name) LIKE '%lider%'
        OR LOWER(c.name) LIKE '%responsable%'
        OR LOWER(c.name) LIKE '%manager%'
        OR LOWER(c.name) LIKE '%parent%'
        OR LOWER(c.name) LIKE '%padre%'
)
SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    c.column_id,
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.is_nullable
FROM HierarchyObjects AS h
INNER JOIN sys.objects AS o
    ON o.object_id = h.object_id
INNER JOIN sys.schemas AS s
    ON s.schema_id = o.schema_id
INNER JOIN sys.columns AS c
    ON c.object_id = h.object_id
INNER JOIN sys.types AS t
    ON t.user_type_id = c.user_type_id
WHERE
       LOWER(c.name) LIKE '%usuario%'
    OR LOWER(c.name) LIKE '%user%'
    OR LOWER(c.name) LIKE '%gestor%'
    OR LOWER(c.name) LIKE '%asesor%'
    OR LOWER(c.name) LIKE '%dni%'
    OR LOWER(c.name) LIKE '%document%'
    OR LOWER(c.name) LIKE '%codigo%'
    OR LOWER(c.name) LIKE '%id%'
    OR LOWER(c.name) LIKE '%nombre%'
    OR LOWER(c.name) LIKE '%cargo%'
    OR LOWER(c.name) LIKE '%perfil%'
    OR LOWER(c.name) LIKE '%estado%'
    OR LOWER(c.name) LIKE '%fecha%'
    OR LOWER(c.name) LIKE '%vigencia%'
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '4. FOREIGN KEYS POTENCIALMENTE UTILES';
PRINT '============================================================';

SELECT
    fk.name AS foreign_key_name,

    OBJECT_SCHEMA_NAME(fk.parent_object_id) AS child_schema,
    OBJECT_NAME(fk.parent_object_id) AS child_table,
    pc.name AS child_column,

    OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS parent_schema,
    OBJECT_NAME(fk.referenced_object_id) AS parent_table,
    rc.name AS parent_column

FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fkc
    ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.columns AS pc
    ON pc.object_id = fk.parent_object_id
   AND pc.column_id = fkc.parent_column_id
INNER JOIN sys.columns AS rc
    ON rc.object_id = fk.referenced_object_id
   AND rc.column_id = fkc.referenced_column_id
WHERE
       LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%usuario%'
    OR LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%gestor%'
    OR LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%asesor%'
    OR LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%supervisor%'
    OR LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%equipo%'
    OR LOWER(OBJECT_NAME(fk.parent_object_id)) LIKE '%grupo%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%usuario%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%gestor%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%asesor%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%supervisor%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%equipo%'
    OR LOWER(OBJECT_NAME(fk.referenced_object_id)) LIKE '%grupo%'
ORDER BY
    child_table,
    foreign_key_name;


PRINT '============================================================';
PRINT '5. TABLAS CON COLUMNAS QUE PARECEN ID DE USUARIO + DNI';
PRINT '============================================================';

;WITH Candidate AS
(
    SELECT
        c.object_id,
        MAX(
            CASE
                WHEN LOWER(c.name) LIKE '%usuario%'
                  OR LOWER(c.name) LIKE '%user%'
                  OR LOWER(c.name) LIKE '%gestor%'
                  OR LOWER(c.name) LIKE '%asesor%'
                    THEN 1 ELSE 0
            END
        ) AS has_user_col,

        MAX(
            CASE
                WHEN LOWER(c.name) LIKE '%dni%'
                  OR LOWER(c.name) LIKE '%document%'
                    THEN 1 ELSE 0
            END
        ) AS has_document_col,

        MAX(
            CASE
                WHEN LOWER(c.name) LIKE '%nombre%'
                  OR LOWER(c.name) LIKE '%apellido%'
                    THEN 1 ELSE 0
            END
        ) AS has_name_col
    FROM sys.columns AS c
    GROUP BY c.object_id
)
SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    x.has_user_col,
    x.has_document_col,
    x.has_name_col
FROM Candidate AS x
INNER JOIN sys.objects AS o
    ON o.object_id = x.object_id
INNER JOIN sys.schemas AS s
    ON s.schema_id = o.schema_id
WHERE o.type IN ('U', 'V')
  AND x.has_user_col = 1
  AND (x.has_document_col = 1 OR x.has_name_col = 1)
ORDER BY
    o.name;


PRINT '============================================================';
PRINT '6. OBJETOS SQL QUE MENCIONAN SUPERVISOR / GESTOR / USUARIO';
PRINT '============================================================';

SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,

    CASE
        WHEN UPPER(m.definition) LIKE '%SUPERVISOR%'
            THEN 1 ELSE 0
    END AS mentions_supervisor,

    CASE
        WHEN UPPER(m.definition) LIKE '%GESTOR%'
            THEN 1 ELSE 0
    END AS mentions_gestor,

    CASE
        WHEN UPPER(m.definition) LIKE '%ASESOR%'
            THEN 1 ELSE 0
    END AS mentions_asesor,

    CASE
        WHEN UPPER(m.definition) LIKE '%USUARIO%'
            THEN 1 ELSE 0
    END AS mentions_usuario

FROM sys.sql_modules AS m
INNER JOIN sys.objects AS o
    ON o.object_id = m.object_id
INNER JOIN sys.schemas AS s
    ON s.schema_id = o.schema_id
WHERE
       UPPER(m.definition) LIKE '%SUPERVISOR%'
    OR UPPER(m.definition) LIKE '%GESTOR%'
    OR UPPER(m.definition) LIKE '%ASESOR%'
ORDER BY
    mentions_supervisor DESC,
    o.name;


PRINT '============================================================';
PRINT '7. RESUMEN';
PRINT '============================================================';

SELECT
    DB_NAME() AS database_name,

    (
        SELECT COUNT(*)
        FROM sys.objects
        WHERE type = 'U'
    ) AS user_tables,

    (
        SELECT COUNT(*)
        FROM sys.objects
        WHERE type = 'V'
    ) AS views,

    (
        SELECT COUNT(DISTINCT object_id)
        FROM sys.columns
        WHERE
               LOWER(name) LIKE '%supervisor%'
            OR LOWER(name) LIKE '%coordinador%'
            OR LOWER(name) LIKE '%jefe%'
            OR LOWER(name) LIKE '%lider%'
            OR LOWER(name) LIKE '%manager%'
            OR LOWER(name) LIKE '%parent%'
    ) AS objects_with_hierarchy_columns;
