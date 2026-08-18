/*
Portfolio Control Center - ETAPA 6 / Avance 3
Diagnóstico MINIMO supervisor / gestor zonal CLARO
SOLO LECTURA

Objetivo:
- revisar si RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA completa el 13/08;
- revisar si GESTOR_ZONAL explica los 4 asesores con SUPERVISOR_NOMBRE NULL;
- no escanear otras tablas ni histórico amplio.

Ejecutar desde la base Analytics.
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_date DATE = CAST(GETDATE() AS DATE);

DECLARE @client_key INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

IF @client_key IS NULL
    THROW 52200, 'Cliente no encontrado en Analytics.', 1;


IF OBJECT_ID('tempdb..#Advisors') IS NOT NULL
    DROP TABLE #Advisors;

SELECT
    CONVERT(INT, source_advisor_id) AS nId_Usuario,
    advisor_document AS dni,
    advisor_name,
    role_name
INTO #Advisors
FROM analytics.dim_advisor
WHERE client_key = @client_key
  AND is_active = 1;


PRINT '============================================================';
PRINT '1. RPTC_253 DIA - HOY';
PRINT '============================================================';

SELECT
    a.nId_Usuario,
    a.advisor_name,

    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') AS supervisor_name,
    NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), '') AS gestor_zonal,

    COUNT_BIG(*) AS rows_count,
    MIN(r.FEC_CORTA) AS first_date,
    MAX(r.FEC_CORTA) AS last_date

FROM #Advisors AS a
LEFT JOIN aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA AS r
    ON r.NID_USUARIO = a.nId_Usuario
   AND r.FEC_CORTA = @as_of_date
GROUP BY
    a.nId_Usuario,
    a.advisor_name,
    NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), ''),
    NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), '')
ORDER BY a.advisor_name;


PRINT '============================================================';
PRINT '2. ACUMULADO - SUPERVISOR VS GESTOR_ZONAL';
PRINT '============================================================';

SELECT
    a.nId_Usuario,
    a.advisor_name,

    COUNT(DISTINCT NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), ''))
        AS distinct_supervisors,

    MIN(NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), ''))
        AS supervisor_min,

    MAX(NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), ''))
        AS supervisor_max,

    COUNT(DISTINCT NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), ''))
        AS distinct_gestor_zonal,

    MIN(NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), ''))
        AS gestor_zonal_min,

    MAX(NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), ''))
        AS gestor_zonal_max

FROM #Advisors AS a
LEFT JOIN aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
    ON r.NID_USUARIO = a.nId_Usuario
   AND r.FEC_CORTA >= DATEFROMPARTS(YEAR(@as_of_date), MONTH(@as_of_date), 1)
   AND r.FEC_CORTA <= @as_of_date
GROUP BY
    a.nId_Usuario,
    a.advisor_name
ORDER BY a.advisor_name;


PRINT '============================================================';
PRINT '3. SOLO LOS 4 ASESORES SIN SUPERVISOR EN ACUMULADO';
PRINT '============================================================';

;WITH CurrentSupervisor AS
(
    SELECT DISTINCT
        r.NID_USUARIO
    FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
    WHERE r.FEC_CORTA >= DATEFROMPARTS(YEAR(@as_of_date), MONTH(@as_of_date), 1)
      AND r.FEC_CORTA <= @as_of_date
      AND NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '') IS NOT NULL
)
SELECT
    a.nId_Usuario,
    a.dni,
    a.advisor_name,

    d.supervisor_name_today,
    d.gestor_zonal_today,

    x.gestor_zonal_accum

FROM #Advisors AS a

OUTER APPLY
(
    SELECT TOP (1)
        NULLIF(LTRIM(RTRIM(r.SUPERVISOR_NOMBRE)), '')
            AS supervisor_name_today,
        NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), '')
            AS gestor_zonal_today
    FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA AS r
    WHERE r.NID_USUARIO = a.nId_Usuario
      AND r.FEC_CORTA = @as_of_date
    ORDER BY r.FECHA_PROC DESC
) AS d

OUTER APPLY
(
    SELECT
        MIN(NULLIF(LTRIM(RTRIM(r.GESTOR_ZONAL)), ''))
            AS gestor_zonal_accum
    FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
    WHERE r.NID_USUARIO = a.nId_Usuario
      AND r.FEC_CORTA >= DATEFROMPARTS(YEAR(@as_of_date), MONTH(@as_of_date), 1)
      AND r.FEC_CORTA <= @as_of_date
) AS x

WHERE NOT EXISTS
(
    SELECT 1
    FROM CurrentSupervisor AS s
    WHERE s.NID_USUARIO = a.nId_Usuario
)
ORDER BY a.advisor_name;
