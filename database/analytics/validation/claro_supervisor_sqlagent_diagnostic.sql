/*
Portfolio Control Center - ETAPA 6 / Avance 3
Diagnóstico ULTRALIVIANO: origen externo de RPTC_253
SOLO METADATA

Objetivo:
- buscar SQL Agent Jobs que carguen/actualicen RPTC_253;
- revisar pasos de jobs relacionados con 253 / gestor / producción;
- revisar triggers directos de las tablas RPTC_253;
- NO escanear tablas de negocio.

Puede requerir permisos de lectura sobre msdb.
*/

SET NOCOUNT ON;

PRINT '============================================================';
PRINT '1. SQL AGENT JOBS QUE MENCIONAN RPTC_253 / SUPERVISOR';
PRINT '============================================================';

IF DB_ID('msdb') IS NOT NULL
BEGIN
    SELECT
        j.name AS job_name,
        s.step_id,
        s.step_name,
        s.subsystem,
        s.database_name,
        s.command
    FROM msdb.dbo.sysjobs AS j
    INNER JOIN msdb.dbo.sysjobsteps AS s
        ON s.job_id = j.job_id
    WHERE
           UPPER(s.command) LIKE '%RPTC_253%'
        OR UPPER(s.command) LIKE '%PRODUCCIONGENERALPORGESTOR%'
        OR UPPER(s.command) LIKE '%SUPERVISOR_NOMBRE%'
    ORDER BY
        j.name,
        s.step_id;
END;


PRINT '============================================================';
PRINT '2. JOBS CON NOMBRE RELACIONADO A 253 / PRODUCCION / GESTOR';
PRINT '============================================================';

IF DB_ID('msdb') IS NOT NULL
BEGIN
    SELECT
        j.name AS job_name,
        j.enabled,
        s.step_id,
        s.step_name,
        s.subsystem,
        s.database_name,
        s.command
    FROM msdb.dbo.sysjobs AS j
    INNER JOIN msdb.dbo.sysjobsteps AS s
        ON s.job_id = j.job_id
    WHERE
           UPPER(j.name) LIKE '%253%'
        OR UPPER(j.name) LIKE '%PRODUCCION%'
        OR UPPER(j.name) LIKE '%GESTOR%'
        OR UPPER(j.name) LIKE '%REPORT%'
    ORDER BY
        j.name,
        s.step_id;
END;


PRINT '============================================================';
PRINT '3. ULTIMA EJECUCION DE JOBS CANDIDATOS';
PRINT '============================================================';

IF DB_ID('msdb') IS NOT NULL
BEGIN
    ;WITH CandidateJobs AS
    (
        SELECT DISTINCT j.job_id, j.name
        FROM msdb.dbo.sysjobs AS j
        INNER JOIN msdb.dbo.sysjobsteps AS s
            ON s.job_id = j.job_id
        WHERE
               UPPER(s.command) LIKE '%RPTC_253%'
            OR UPPER(s.command) LIKE '%PRODUCCIONGENERALPORGESTOR%'
            OR UPPER(s.command) LIKE '%SUPERVISOR_NOMBRE%'
            OR UPPER(j.name) LIKE '%253%'
            OR UPPER(j.name) LIKE '%PRODUCCION%'
            OR UPPER(j.name) LIKE '%GESTOR%'
    ),
    LastRun AS
    (
        SELECT
            h.job_id,
            h.run_date,
            h.run_time,
            h.run_status,
            h.message,
            ROW_NUMBER() OVER
            (
                PARTITION BY h.job_id
                ORDER BY h.instance_id DESC
            ) AS rn
        FROM msdb.dbo.sysjobhistory AS h
        WHERE h.step_id = 0
    )
    SELECT
        c.name AS job_name,
        l.run_date,
        l.run_time,
        l.run_status,
        l.message
    FROM CandidateJobs AS c
    LEFT JOIN LastRun AS l
        ON l.job_id = c.job_id
       AND l.rn = 1
    ORDER BY c.name;
END;


PRINT '============================================================';
PRINT '4. TRIGGERS DIRECTOS SOBRE RPTC_253';
PRINT '============================================================';

SELECT
    OBJECT_SCHEMA_NAME(t.object_id, DB_ID('aval_reporteria'))
        AS trigger_schema,
    t.name AS trigger_name,
    OBJECT_NAME(t.parent_id, DB_ID('aval_reporteria'))
        AS parent_table,
    t.is_disabled,
    m.definition
FROM aval_reporteria.sys.triggers AS t
LEFT JOIN aval_reporteria.sys.sql_modules AS m
    ON m.object_id = t.object_id
WHERE t.parent_id IN
(
    OBJECT_ID('aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO'),
    OBJECT_ID('aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA')
)
ORDER BY parent_table, trigger_name;


PRINT '============================================================';
PRINT '5. SYNONYMS RELACIONADOS';
PRINT '============================================================';

SELECT
    s.name AS schema_name,
    sy.name AS synonym_name,
    sy.base_object_name
FROM aval_reporteria.sys.synonyms AS sy
INNER JOIN aval_reporteria.sys.schemas AS s
    ON s.schema_id = sy.schema_id
WHERE
       UPPER(sy.name) LIKE '%253%'
    OR UPPER(sy.name) LIKE '%PRODUCCIONGENERALPORGESTOR%'
    OR UPPER(sy.base_object_name) LIKE '%RPTC_253%'
    OR UPPER(sy.base_object_name) LIKE '%PRODUCCIONGENERALPORGESTOR%'
ORDER BY sy.name;


PRINT '============================================================';
PRINT '6. RESUMEN';
PRINT '============================================================';

SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM aval_reporteria.sys.triggers AS t
            WHERE t.parent_id IN
            (
                OBJECT_ID('aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO'),
                OBJECT_ID('aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA')
            )
        )
            THEN 1
        ELSE 0
    END AS has_direct_trigger,

    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM aval_reporteria.sys.synonyms AS sy
            WHERE UPPER(sy.base_object_name) LIKE '%RPTC_253%'
        )
            THEN 1
        ELSE 0
    END AS has_related_synonym;
