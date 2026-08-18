/*
Portfolio Control Center - ETAPA 6 / Avance 3
Diagnóstico de jerarquía Supervisor -> Asesor CLARO
SOLO LECTURA

Objetivo:
- medir cobertura actual de SUPERVISOR_NOMBRE;
- comprobar si el histórico cercano aporta supervisor para los 4 asesores sin dato;
- localizar tablas/vistas con columnas relacionadas a supervisor/jefe/coordinador/lider;
- encontrar candidatos con identificadores de asesor/usuario/DNI;
- NO materializar todavía dim_supervisor ni bridge_supervisor_advisor.

Ejecutar desde la base Analytics.
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_date DATE = CAST(GETDATE() AS DATE);
DECLARE @campaign_year INT = YEAR(@as_of_date);
DECLARE @campaign_month INT = MONTH(@as_of_date);
DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);

DECLARE @client_key INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

IF @client_key IS NULL
    THROW 52000, 'Cliente no encontrado en Analytics.', 1;


PRINT '============================================================';
PRINT '1. ASESORES CLARO ACTUALES';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#ClaroAdvisors') IS NOT NULL
    DROP TABLE #ClaroAdvisors;

SELECT
    a.advisor_key,
    CONVERT(INT, a.source_advisor_id) AS nId_Usuario,
    a.advisor_document AS dni,
    a.advisor_name,
    a.role_name
INTO #ClaroAdvisors
FROM analytics.dim_advisor AS a
WHERE a.client_key = @client_key
  AND a.is_active = 1;

SELECT *
FROM #ClaroAdvisors
ORDER BY advisor_name;


PRINT '============================================================';
PRINT '2. SUPERVISOR EN RPTC_253 - SCOPE ACTUAL';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#CurrentSupervisor') IS NOT NULL
    DROP TABLE #CurrentSupervisor;

SELECT
    r.NID_USUARIO,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') AS supervisor_name,
    COUNT_BIG(*) AS rows_count,
    MIN(r.FEC_CORTA) AS first_date,
    MAX(r.FEC_CORTA) AS last_date
INTO #CurrentSupervisor
FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
INNER JOIN #ClaroAdvisors AS a
    ON a.nId_Usuario = r.NID_USUARIO
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = r.IDCARTERA
WHERE r.FEC_CORTA >= @campaign_start
  AND r.FEC_CORTA <= @as_of_date
GROUP BY
    r.NID_USUARIO,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '');

SELECT
    a.nId_Usuario,
    a.dni,
    a.advisor_name,
    a.role_name,
    s.supervisor_name,
    ISNULL(s.rows_count, 0) AS rows_count,
    s.first_date,
    s.last_date
FROM #ClaroAdvisors AS a
LEFT JOIN #CurrentSupervisor AS s
    ON s.NID_USUARIO = a.nId_Usuario
ORDER BY a.advisor_name;


PRINT '============================================================';
PRINT '3. COBERTURA DE SUPERVISOR ACTUAL';
PRINT '============================================================';

;WITH AdvisorsWithSupervisor AS
(
    SELECT DISTINCT
        NID_USUARIO
    FROM #CurrentSupervisor
    WHERE supervisor_name IS NOT NULL
)
SELECT
    COUNT(*) AS advisor_count,

    SUM(
        CASE
            WHEN s.NID_USUARIO IS NOT NULL THEN 1
            ELSE 0
        END
    ) AS advisors_with_supervisor,

    SUM(
        CASE
            WHEN s.NID_USUARIO IS NULL THEN 1
            ELSE 0
        END
    ) AS advisors_without_supervisor

FROM #ClaroAdvisors AS a
LEFT JOIN AdvisorsWithSupervisor AS s
    ON s.NID_USUARIO = a.nId_Usuario;


PRINT '============================================================';
PRINT '4. HISTORICO 90 DIAS PARA ASESORES SIN SUPERVISOR ACTUAL';
PRINT '============================================================';

/*
Solo busca evidencia histórica. No se usará automáticamente para poblar
la jerarquía actual.
*/
IF OBJECT_ID('tempdb..#MissingSupervisor') IS NOT NULL
    DROP TABLE #MissingSupervisor;

SELECT a.*
INTO #MissingSupervisor
FROM #ClaroAdvisors AS a
WHERE NOT EXISTS
(
    SELECT 1
    FROM #CurrentSupervisor AS s
    WHERE s.NID_USUARIO = a.nId_Usuario
      AND s.supervisor_name IS NOT NULL
);

SELECT
    r.NID_USUARIO,
    a.advisor_name,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') AS supervisor_name,
    COUNT_BIG(*) AS rows_count,
    MIN(r.FEC_CORTA) AS first_date,
    MAX(r.FEC_CORTA) AS last_date
FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
INNER JOIN #MissingSupervisor AS a
    ON a.nId_Usuario = r.NID_USUARIO
WHERE r.FEC_CORTA >= DATEADD(DAY, -90, @as_of_date)
  AND r.FEC_CORTA <= @as_of_date
  AND NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') IS NOT NULL
GROUP BY
    r.NID_USUARIO,
    a.advisor_name,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '')
ORDER BY
    r.NID_USUARIO,
    rows_count DESC;


PRINT '============================================================';
PRINT '5. CANDIDATOS DE TABLAS/VISTAS CON JERARQUIA';
PRINT '============================================================';

SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    c.name AS hierarchy_column,
    ty.name AS data_type
FROM aval_reporteria.sys.objects AS o
INNER JOIN aval_reporteria.sys.schemas AS s
    ON s.schema_id = o.schema_id
INNER JOIN aval_reporteria.sys.columns AS c
    ON c.object_id = o.object_id
INNER JOIN aval_reporteria.sys.types AS ty
    ON ty.user_type_id = c.user_type_id
WHERE o.type IN ('U', 'V')
  AND
  (
      LOWER(c.name) LIKE '%supervisor%'
      OR LOWER(c.name) LIKE '%coordinador%'
      OR LOWER(c.name) LIKE '%jefe%'
      OR LOWER(c.name) LIKE '%lider%'
      OR LOWER(c.name) LIKE '%líder%'
  )
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '6. CANDIDATOS QUE TAMBIEN TIENEN ID/DNI DE ASESOR';
PRINT '============================================================';

;WITH HierarchyObjects AS
(
    SELECT DISTINCT c.object_id
    FROM aval_reporteria.sys.columns AS c
    WHERE
        LOWER(c.name) LIKE '%supervisor%'
        OR LOWER(c.name) LIKE '%coordinador%'
        OR LOWER(c.name) LIKE '%jefe%'
        OR LOWER(c.name) LIKE '%lider%'
        OR LOWER(c.name) LIKE '%líder%'
)
SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    c.name AS identity_column,
    ty.name AS data_type
FROM HierarchyObjects AS h
INNER JOIN aval_reporteria.sys.objects AS o
    ON o.object_id = h.object_id
INNER JOIN aval_reporteria.sys.schemas AS s
    ON s.schema_id = o.schema_id
INNER JOIN aval_reporteria.sys.columns AS c
    ON c.object_id = h.object_id
INNER JOIN aval_reporteria.sys.types AS ty
    ON ty.user_type_id = c.user_type_id
WHERE
       LOWER(c.name) LIKE '%dni%'
    OR LOWER(c.name) LIKE '%usuario%'
    OR LOWER(c.name) LIKE '%asesor%'
    OR LOWER(c.name) LIKE '%gestor%'
    OR LOWER(c.name) IN ('nid_usuario', 'nid_usuope', 'idusuario', 'id_usuario')
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '7. COLUMNAS COMPLETAS DE OBJETOS CANDIDATOS PRIORITARIOS';
PRINT '============================================================';

/*
Muestra columnas de los objetos que parecen más cercanos al caso.
Si no existen, simplemente no devolverán filas.
*/
SELECT
    o.name AS object_name,
    c.column_id,
    c.name AS column_name,
    ty.name AS data_type,
    c.max_length,
    c.is_nullable
FROM aval_reporteria.sys.objects AS o
INNER JOIN aval_reporteria.sys.columns AS c
    ON c.object_id = o.object_id
INNER JOIN aval_reporteria.sys.types AS ty
    ON ty.user_type_id = c.user_type_id
WHERE o.name IN
(
    'RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO',
    'RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA',
    'PBI_UNIFICADO_GERENCIA_PROD',
    'PBI_PRODUCCION_CARTERA',
    'PBI_EFECTIVIDAD_ASESOR',
    'rpt_ref_usuario'
)
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '8. SUPERVISORES DISTINTOS DEL SCOPE ACTUAL';
PRINT '============================================================';

SELECT
    supervisor_name,
    COUNT(DISTINCT NID_USUARIO) AS advisors,
    SUM(rows_count) AS rows_count
FROM #CurrentSupervisor
WHERE supervisor_name IS NOT NULL
GROUP BY supervisor_name
ORDER BY advisors DESC, supervisor_name;


PRINT '============================================================';
PRINT '9. ESTABILIDAD ASESOR -> SUPERVISOR EN SCOPE ACTUAL';
PRINT '============================================================';

SELECT
    a.nId_Usuario,
    a.advisor_name,
    COUNT(DISTINCT s.supervisor_name) AS distinct_supervisors,
    MIN(s.supervisor_name) AS supervisor_min,
    MAX(s.supervisor_name) AS supervisor_max
FROM #ClaroAdvisors AS a
LEFT JOIN #CurrentSupervisor AS s
    ON s.NID_USUARIO = a.nId_Usuario
   AND s.supervisor_name IS NOT NULL
GROUP BY
    a.nId_Usuario,
    a.advisor_name
ORDER BY a.advisor_name;


PRINT '============================================================';
PRINT '10. DECISION ORIENTATIVA';
PRINT '============================================================';

DECLARE @advisor_count INT;
DECLARE @with_supervisor INT;
DECLARE @with_conflict INT;

SELECT @advisor_count = COUNT(*)
FROM #ClaroAdvisors;

SELECT @with_supervisor = COUNT(*)
FROM #ClaroAdvisors AS a
WHERE EXISTS
(
    SELECT 1
    FROM #CurrentSupervisor AS s
    WHERE s.NID_USUARIO = a.nId_Usuario
      AND s.supervisor_name IS NOT NULL
);

SELECT @with_conflict = COUNT(*)
FROM
(
    SELECT
        s.NID_USUARIO
    FROM #CurrentSupervisor AS s
    WHERE s.supervisor_name IS NOT NULL
    GROUP BY s.NID_USUARIO
    HAVING COUNT(DISTINCT s.supervisor_name) > 1
) AS x;

SELECT
    @advisor_count AS advisor_count,
    @with_supervisor AS advisors_with_supervisor,
    @advisor_count - @with_supervisor AS advisors_without_supervisor,
    @with_conflict AS advisors_with_supervisor_conflict,

    CASE
        WHEN @with_supervisor = @advisor_count
         AND @with_conflict = 0
            THEN 'JERARQUIA_LISTA_PARA_MATERIALIZAR'

        WHEN @with_conflict > 0
            THEN 'REVISAR_CONFLICTOS_DE_SUPERVISOR'

        ELSE 'BUSCAR_FUENTE_COMPLEMENTARIA_DE_JERARQUIA'
    END AS assessment;
