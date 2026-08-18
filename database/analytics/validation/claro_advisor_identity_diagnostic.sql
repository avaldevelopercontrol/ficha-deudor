/*
Portfolio Control Center - ETAPA 6 / Avance 3
Diagnóstico de identidad estable del asesor CLARO
SOLO LECTURA.

Objetivo:
- decidir si nId_Usuario o nId_UsuOpe puede ser source_advisor_id;
- detectar IDs nulos/cero;
- detectar un ID asociado a múltiples nombres;
- detectar un nombre asociado a múltiples IDs;
- excluir filas sintéticas "Pago Sin Promesa" del universo de gestión;
- localizar posibles tablas maestras de usuario dentro de aval_reporteria.

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
    THROW 51600, 'No existe el cliente en analytics.dim_client.', 1;


PRINT '============================================================';
PRINT '1. STAGING OPERACIONAL CLARO';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#AdvisorSource') IS NOT NULL
    DROP TABLE #AdvisorSource;

SELECT
    p.portfolio_key,
    t.nId_Cartera,
    t.nId_Usuario,
    t.nId_UsuOpe,
    NULLIF(LTRIM(RTRIM(t.nombre_asesor)), '') AS nombre_asesor,
    NULLIF(LTRIM(RTRIM(t.cNombre_Cargo)), '') AS cargo,
    t.nId_PersDeudor,
    t.nId_DocxCobrarOpe,
    t.dDocCobOpe_FecIni,
    t.indicador_equiv,
    t.estado_pdp,
    t.marca_promesa_valida,
    t.total_pagado
INTO #AdvisorSource
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

CREATE INDEX IX_AdvisorSource_User
    ON #AdvisorSource(nId_Usuario, nId_UsuOpe, nombre_asesor);


SELECT
    COUNT_BIG(*) AS management_rows,
    COUNT(DISTINCT nombre_asesor) AS distinct_advisor_names,

    SUM(CASE WHEN ISNULL(nId_Usuario, 0) = 0 THEN 1 ELSE 0 END)
        AS rows_without_nId_Usuario,

    SUM(CASE WHEN ISNULL(nId_UsuOpe, 0) = 0 THEN 1 ELSE 0 END)
        AS rows_without_nId_UsuOpe,

    SUM(CASE WHEN nombre_asesor IS NULL THEN 1 ELSE 0 END)
        AS rows_without_advisor_name
FROM #AdvisorSource;


PRINT '============================================================';
PRINT '2. COBERTURA DE IDs';
PRINT '============================================================';

SELECT
    COUNT(DISTINCT NULLIF(nId_Usuario, 0)) AS distinct_nId_Usuario,
    COUNT(DISTINCT NULLIF(nId_UsuOpe, 0)) AS distinct_nId_UsuOpe,
    COUNT(DISTINCT nombre_asesor) AS distinct_names
FROM #AdvisorSource;


PRINT '============================================================';
PRINT '3. nId_Usuario -> MULTIPLES NOMBRES';
PRINT '============================================================';

SELECT
    nId_Usuario,
    COUNT(DISTINCT nombre_asesor) AS distinct_names,
    MIN(nombre_asesor) AS sample_name_min,
    MAX(nombre_asesor) AS sample_name_max,
    COUNT_BIG(*) AS rows_count
FROM #AdvisorSource
WHERE ISNULL(nId_Usuario, 0) <> 0
  AND nombre_asesor IS NOT NULL
GROUP BY nId_Usuario
HAVING COUNT(DISTINCT nombre_asesor) > 1
ORDER BY distinct_names DESC, rows_count DESC;


PRINT '============================================================';
PRINT '4. nId_UsuOpe -> MULTIPLES NOMBRES';
PRINT '============================================================';

SELECT
    nId_UsuOpe,
    COUNT(DISTINCT nombre_asesor) AS distinct_names,
    MIN(nombre_asesor) AS sample_name_min,
    MAX(nombre_asesor) AS sample_name_max,
    COUNT_BIG(*) AS rows_count
FROM #AdvisorSource
WHERE ISNULL(nId_UsuOpe, 0) <> 0
  AND nombre_asesor IS NOT NULL
GROUP BY nId_UsuOpe
HAVING COUNT(DISTINCT nombre_asesor) > 1
ORDER BY distinct_names DESC, rows_count DESC;


PRINT '============================================================';
PRINT '5. NOMBRE -> MULTIPLES nId_Usuario';
PRINT '============================================================';

SELECT
    nombre_asesor,
    COUNT(DISTINCT NULLIF(nId_Usuario, 0)) AS distinct_ids,
    MIN(NULLIF(nId_Usuario, 0)) AS min_id,
    MAX(NULLIF(nId_Usuario, 0)) AS max_id,
    COUNT_BIG(*) AS rows_count
FROM #AdvisorSource
WHERE nombre_asesor IS NOT NULL
GROUP BY nombre_asesor
HAVING COUNT(DISTINCT NULLIF(nId_Usuario, 0)) > 1
ORDER BY distinct_ids DESC, rows_count DESC;


PRINT '============================================================';
PRINT '6. NOMBRE -> MULTIPLES nId_UsuOpe';
PRINT '============================================================';

SELECT
    nombre_asesor,
    COUNT(DISTINCT NULLIF(nId_UsuOpe, 0)) AS distinct_ids,
    MIN(NULLIF(nId_UsuOpe, 0)) AS min_id,
    MAX(NULLIF(nId_UsuOpe, 0)) AS max_id,
    COUNT_BIG(*) AS rows_count
FROM #AdvisorSource
WHERE nombre_asesor IS NOT NULL
GROUP BY nombre_asesor
HAVING COUNT(DISTINCT NULLIF(nId_UsuOpe, 0)) > 1
ORDER BY distinct_ids DESC, rows_count DESC;


PRINT '============================================================';
PRINT '7. RELACION nId_Usuario vs nId_UsuOpe';
PRINT '============================================================';

SELECT
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo,
    COUNT_BIG(*) AS rows_count,
    MIN(dDocCobOpe_FecIni) AS first_management_at,
    MAX(dDocCobOpe_FecIni) AS last_management_at
FROM #AdvisorSource
WHERE
    ISNULL(nId_Usuario, 0) <> 0
    OR ISNULL(nId_UsuOpe, 0) <> 0
GROUP BY
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo
ORDER BY
    nombre_asesor,
    nId_Usuario,
    nId_UsuOpe;


PRINT '============================================================';
PRINT '8. FILAS SIN IDENTIDAD TECNICA';
PRINT '============================================================';

SELECT TOP (200)
    nId_Cartera,
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo,
    nId_PersDeudor,
    nId_DocxCobrarOpe,
    dDocCobOpe_FecIni,
    indicador_equiv,
    estado_pdp,
    total_pagado
FROM #AdvisorSource
WHERE ISNULL(nId_Usuario, 0) = 0
  AND ISNULL(nId_UsuOpe, 0) = 0
ORDER BY dDocCobOpe_FecIni DESC;


PRINT '============================================================';
PRINT '9. RESUMEN POR ASESOR';
PRINT '============================================================';

SELECT
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo,
    COUNT_BIG(*) AS management_rows,
    COUNT(DISTINCT nId_PersDeudor) AS distinct_debtors,
    SUM(
        CASE
            WHEN UPPER(LTRIM(RTRIM(ISNULL(indicador_equiv, '')))) = 'CD'
                THEN 1
            ELSE 0
        END
    ) AS cd_rows,
    SUM(
        CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
                THEN 1
            ELSE 0
        END
    ) AS valid_promise_rows,
    SUM(CONVERT(DECIMAL(19,4), ISNULL(total_pagado, 0)))
        AS recovered_amount
FROM #AdvisorSource
GROUP BY
    nId_Usuario,
    nId_UsuOpe,
    nombre_asesor,
    cargo
ORDER BY management_rows DESC;


PRINT '============================================================';
PRINT '10. TABLAS CON POSIBLES MAESTROS DE USUARIO';
PRINT '============================================================';

/*
Busca objetos de aval_reporteria que expongan columnas útiles para
resolver el ID operativo contra un maestro.
*/
SELECT
    s.name AS schema_name,
    o.name AS object_name,
    o.type_desc,
    c.name AS column_name,
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
      LOWER(c.name) IN
      (
          'nid_usuario',
          'nid_usuope',
          'dni',
          'documento',
          'nrodocumento',
          'nombre_asesor',
          'usuario',
          'username'
      )
      OR LOWER(c.name) LIKE '%dni%'
      OR LOWER(c.name) LIKE '%document%'
      OR LOWER(c.name) LIKE '%usuario%'
      OR LOWER(c.name) LIKE '%asesor%'
  )
ORDER BY
    o.name,
    c.column_id;


PRINT '============================================================';
PRINT '11. CONCLUSION AUTOMATICA ORIENTATIVA';
PRINT '============================================================';

DECLARE @user_null_rows BIGINT;
DECLARE @usuope_null_rows BIGINT;
DECLARE @user_conflicts BIGINT;
DECLARE @usuope_conflicts BIGINT;

SELECT
    @user_null_rows =
        SUM(CASE WHEN ISNULL(nId_Usuario, 0) = 0 THEN 1 ELSE 0 END),
    @usuope_null_rows =
        SUM(CASE WHEN ISNULL(nId_UsuOpe, 0) = 0 THEN 1 ELSE 0 END)
FROM #AdvisorSource;

SELECT @user_conflicts = COUNT_BIG(*)
FROM
(
    SELECT nId_Usuario
    FROM #AdvisorSource
    WHERE ISNULL(nId_Usuario, 0) <> 0
      AND nombre_asesor IS NOT NULL
    GROUP BY nId_Usuario
    HAVING COUNT(DISTINCT nombre_asesor) > 1
) AS x;

SELECT @usuope_conflicts = COUNT_BIG(*)
FROM
(
    SELECT nId_UsuOpe
    FROM #AdvisorSource
    WHERE ISNULL(nId_UsuOpe, 0) <> 0
      AND nombre_asesor IS NOT NULL
    GROUP BY nId_UsuOpe
    HAVING COUNT(DISTINCT nombre_asesor) > 1
) AS x;

SELECT
    @user_null_rows AS nId_Usuario_missing_rows,
    @user_conflicts AS nId_Usuario_multi_name_conflicts,
    @usuope_null_rows AS nId_UsuOpe_missing_rows,
    @usuope_conflicts AS nId_UsuOpe_multi_name_conflicts,

    CASE
        WHEN @user_null_rows = 0
         AND @user_conflicts = 0
            THEN 'CANDIDATO_FUERTE'
        WHEN @user_conflicts = 0
            THEN 'CANDIDATO_CON_NULOS'
        ELSE 'NO_USAR_SIN_MAPPING'
    END AS nId_Usuario_assessment,

    CASE
        WHEN @usuope_null_rows = 0
         AND @usuope_conflicts = 0
            THEN 'CANDIDATO_FUERTE'
        WHEN @usuope_conflicts = 0
            THEN 'CANDIDATO_CON_NULOS'
        ELSE 'NO_USAR_SIN_MAPPING'
    END AS nId_UsuOpe_assessment;
