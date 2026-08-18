/*
Portfolio Control Center - ETAPA 6 / Avance 3
Validación final nId_Usuario -> DNI estable
SOLO LECTURA - V3

CORRECCIÓN V3
--------------
El diagnóstico V2 consultaba RPTC_253...ACUMULADO sin scope temporal/cartera.
Eso mezcló historial y produjo falsos conflictos de DNI.

Esta versión restringe el análisis al MISMO universo CLARO validado:
- mes/campaña actual;
- hasta hoy;
- solo las carteras presentes en analytics.dim_portfolio;
- solo los 9 nId_Usuario operativos actuales.

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
    THROW 51700, 'Cliente no encontrado en Analytics.', 1;


PRINT '============================================================';
PRINT '1. ASESORES CLARO OPERATIVOS';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#ClaroAdvisors') IS NOT NULL
    DROP TABLE #ClaroAdvisors;

SELECT DISTINCT
    t.nId_Usuario,
    t.nId_UsuOpe,
    NULLIF(LTRIM(RTRIM(t.nombre_asesor)), '') AS nombre_asesor,
    NULLIF(LTRIM(RTRIM(t.cNombre_Cargo)), '') AS cargo
INTO #ClaroAdvisors
FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = t.nId_Cartera
WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
      = 'CLARO CORPORATIVO' COLLATE DATABASE_DEFAULT
  AND t.anio = @campaign_year
  AND t.nCampCar = @campaign_month
  AND t.dDocCobOpe_FecIni >= @campaign_start
  AND t.dDocCobOpe_FecIni < DATEADD(DAY, 1, CONVERT(DATETIME, @as_of_date))
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%';

SELECT *
FROM #ClaroAdvisors
ORDER BY nombre_asesor;


PRINT '============================================================';
PRINT '2. NOMBRES DESDE rpt_ref_usuario';
PRINT '============================================================';

SELECT
    a.nId_Usuario,
    a.nombre_asesor AS nombre_operacion,
    LTRIM(RTRIM(CONCAT(
        ISNULL(r.cUsr_ApePat, ''),
        CASE
            WHEN NULLIF(LTRIM(RTRIM(r.cUsr_ApePat)), '') IS NOT NULL
             AND NULLIF(LTRIM(RTRIM(r.cUsr_Nombres)), '') IS NOT NULL
                THEN ' '
            ELSE ''
        END,
        ISNULL(r.cUsr_Nombres, '')
    ))) AS nombre_ref_usuario,
    r.nId_Perfil,
    r.nId_PerfilGest
FROM #ClaroAdvisors AS a
LEFT JOIN aval_reporteria.dbo.rpt_ref_usuario AS r
    ON r.nId_Usuario = a.nId_Usuario
ORDER BY a.nombre_asesor;


PRINT '============================================================';
PRINT '3. STAGING RPTC_253 ACOTADO A CLARO/CARTERAS/MES';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#RPTCScoped') IS NOT NULL
    DROP TABLE #RPTCScoped;

SELECT
    r.NID_USUARIO,
    NULLIF(LTRIM(RTRIM(r.USU_NOMBRE)), '') AS usu_nombre,
    NULLIF(LTRIM(RTRIM(r.USU_DNI)), '') AS usu_dni,
    NULLIF(LTRIM(RTRIM(r.USU_PERFIL)), '') AS usu_perfil,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') AS supervisor_nombre,
    r.IDCLIENTE,
    r.IDCARTERA,
    r.FEC_CORTA,
    r.FECHA_REGISTRO_GES,
    r.IDGESTION
INTO #RPTCScoped
FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
INNER JOIN #ClaroAdvisors AS a
    ON a.nId_Usuario = r.NID_USUARIO
INNER JOIN analytics.dim_portfolio AS p
    ON p.client_key = @client_key
   AND p.source_portfolio_id = r.IDCARTERA
WHERE r.FEC_CORTA >= @campaign_start
  AND r.FEC_CORTA <= @as_of_date;

SELECT
    COUNT_BIG(*) AS scoped_rows,
    COUNT(DISTINCT NID_USUARIO) AS scoped_users,
    COUNT(DISTINCT IDCARTERA) AS scoped_portfolios,
    MIN(FEC_CORTA) AS first_date,
    MAX(FEC_CORTA) AS last_date
FROM #RPTCScoped;


PRINT '============================================================';
PRINT '4. DNI POR nId_Usuario - SCOPE CORRECTO';
PRINT '============================================================';

SELECT
    NID_USUARIO,
    COUNT(DISTINCT usu_dni) AS distinct_dni,
    MIN(usu_dni) AS dni_min,
    MAX(usu_dni) AS dni_max,
    COUNT_BIG(*) AS rows_count,
    MIN(FEC_CORTA) AS first_date,
    MAX(FEC_CORTA) AS last_date
FROM #RPTCScoped
GROUP BY NID_USUARIO
ORDER BY NID_USUARIO;


PRINT '============================================================';
PRINT '5. NOMBRE RPTC POR nId_Usuario';
PRINT '============================================================';

SELECT
    NID_USUARIO,
    COUNT(DISTINCT usu_nombre) AS distinct_names,
    MIN(usu_nombre) AS name_min,
    MAX(usu_nombre) AS name_max,
    COUNT_BIG(*) AS rows_count
FROM #RPTCScoped
GROUP BY NID_USUARIO
ORDER BY NID_USUARIO;


PRINT '============================================================';
PRINT '6. CRUCE FINAL OPERACION -> RPTC DNI';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#AdvisorIdentity') IS NOT NULL
    DROP TABLE #AdvisorIdentity;

SELECT
    a.nId_Usuario,
    a.nId_UsuOpe,
    a.nombre_asesor,
    a.cargo,

    COUNT(DISTINCT s.usu_dni) AS distinct_dni,
    MIN(s.usu_dni) AS dni,

    COUNT(DISTINCT s.usu_nombre) AS distinct_rptc_names,
    MIN(s.usu_nombre) AS rptc_name,

    COUNT(DISTINCT s.supervisor_nombre) AS distinct_supervisor_names,
    MIN(s.supervisor_nombre) AS sample_supervisor_name,

    COUNT_BIG(s.NID_USUARIO) AS rptc_rows
INTO #AdvisorIdentity
FROM #ClaroAdvisors AS a
LEFT JOIN #RPTCScoped AS s
    ON s.NID_USUARIO = a.nId_Usuario
GROUP BY
    a.nId_Usuario,
    a.nId_UsuOpe,
    a.nombre_asesor,
    a.cargo;

SELECT
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo,
    dni,
    distinct_dni,
    rptc_name,
    distinct_rptc_names,
    rptc_rows,
    CASE
        WHEN distinct_dni = 1
         AND distinct_rptc_names <= 1
            THEN 'MATCH_UNICO'
        WHEN distinct_dni = 0
            THEN 'SIN_DNI_EN_SCOPE'
        ELSE 'CONFLICTO_EN_SCOPE'
    END AS mapping_status
FROM #AdvisorIdentity
ORDER BY nombre_asesor;


PRINT '============================================================';
PRINT '7. CONFLICTOS REALES DENTRO DEL SCOPE';
PRINT '============================================================';

SELECT
    NID_USUARIO,
    usu_dni,
    usu_nombre,
    COUNT_BIG(*) AS rows_count,
    MIN(FEC_CORTA) AS first_date,
    MAX(FEC_CORTA) AS last_date
FROM #RPTCScoped
WHERE NID_USUARIO IN
(
    SELECT nId_Usuario
    FROM #AdvisorIdentity
    WHERE distinct_dni > 1
       OR distinct_rptc_names > 1
)
GROUP BY
    NID_USUARIO,
    usu_dni,
    usu_nombre
ORDER BY
    NID_USUARIO,
    rows_count DESC;


PRINT '============================================================';
PRINT '8. COMPARACION CON DNI DISPONIBLES EN PROD CLARO';
PRINT '============================================================';

SELECT
    i.nId_Usuario,
    i.nombre_asesor,
    i.dni AS rptc_dni,
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_PROD AS p
            WHERE NULLIF(LTRIM(RTRIM(p.DNI_ASESOR)), '') = i.dni
        )
            THEN 1
        ELSE 0
    END AS dni_exists_in_prod
FROM #AdvisorIdentity AS i
ORDER BY i.nombre_asesor;


PRINT '============================================================';
PRINT '9. SUPERVISOR OBSERVADO - SOLO DIAGNOSTICO';
PRINT '============================================================';

/*
NO se carga supervisor todavía.
Solo se mide si RPTC ofrece una relación estable para el siguiente paso.
*/
SELECT
    NID_USUARIO,
    COUNT(DISTINCT supervisor_nombre) AS distinct_supervisors,
    MIN(supervisor_nombre) AS supervisor_min,
    MAX(supervisor_nombre) AS supervisor_max,
    COUNT_BIG(*) AS rows_count
FROM #RPTCScoped
GROUP BY NID_USUARIO
ORDER BY NID_USUARIO;


PRINT '============================================================';
PRINT '10. RESUMEN DE COBERTURA';
PRINT '============================================================';

SELECT
    COUNT(*) AS advisor_count,

    SUM(CASE WHEN distinct_dni = 1 THEN 1 ELSE 0 END)
        AS advisors_with_one_dni,

    SUM(CASE WHEN distinct_dni = 0 THEN 1 ELSE 0 END)
        AS advisors_without_dni,

    SUM(CASE WHEN distinct_dni > 1 THEN 1 ELSE 0 END)
        AS advisors_with_dni_conflict,

    SUM(CASE WHEN distinct_rptc_names > 1 THEN 1 ELSE 0 END)
        AS advisors_with_name_conflict
FROM #AdvisorIdentity;


PRINT '============================================================';
PRINT '11. DECISION ORIENTATIVA';
PRINT '============================================================';

DECLARE @advisor_count INT;
DECLARE @with_one_dni INT;
DECLARE @without_dni INT;
DECLARE @with_dni_conflict INT;
DECLARE @with_name_conflict INT;

SELECT
    @advisor_count = COUNT(*),
    @with_one_dni =
        SUM(CASE WHEN distinct_dni = 1 THEN 1 ELSE 0 END),
    @without_dni =
        SUM(CASE WHEN distinct_dni = 0 THEN 1 ELSE 0 END),
    @with_dni_conflict =
        SUM(CASE WHEN distinct_dni > 1 THEN 1 ELSE 0 END),
    @with_name_conflict =
        SUM(CASE WHEN distinct_rptc_names > 1 THEN 1 ELSE 0 END)
FROM #AdvisorIdentity;

SELECT
    @advisor_count AS advisor_count,
    @with_one_dni AS advisors_with_one_dni,
    @without_dni AS advisors_without_dni,
    @with_dni_conflict AS advisors_with_dni_conflict,
    @with_name_conflict AS advisors_with_name_conflict,

    CASE
        WHEN @advisor_count > 0
         AND @with_one_dni = @advisor_count
         AND @without_dni = 0
         AND @with_dni_conflict = 0
         AND @with_name_conflict = 0
            THEN 'IDENTIDAD_LISTA_PARA_DIM_ADVISOR'

        WHEN @with_dni_conflict > 0
          OR @with_name_conflict > 0
            THEN 'REVISAR_CONFLICTOS_DENTRO_DEL_SCOPE'

        ELSE 'MAPEO_INCOMPLETO_DENTRO_DEL_SCOPE'
    END AS assessment;
