/*
Portfolio Control Center - ETAPA 6 / Avance 3
Validación Supervisor -> Asesor CLARO
Versión multi-instancia.

EJECUTAR EN:
172.23.1.180\MSSQLSERVER,51601
Base: aval_analytics

La validación compara Analytics contra la staging proveniente de
192.168.100.45, no contra aval_cob local de la 180.
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @source_code VARCHAR(50) = 'AVAL_COB_45';
DECLARE @client_key INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

IF @client_key IS NULL
    THROW 51950, 'Cliente no encontrado en Analytics.', 1;


PRINT '============================================================';
PRINT '1. STAGING FUENTE';
PRINT '============================================================';

SELECT
    source_code,
    COUNT(*) AS staged_users,
    MAX(source_as_of_at) AS source_as_of_at,
    MAX(loaded_at) AS staging_loaded_at
FROM staging.aval_usuario_current
WHERE source_code = @source_code
GROUP BY source_code;


PRINT '============================================================';
PRINT '2. DIM SUPERVISOR';
PRINT '============================================================';

SELECT
    supervisor_key,
    source_supervisor_id,
    supervisor_document,
    supervisor_name,
    is_active,
    created_at,
    updated_at
FROM analytics.dim_supervisor
WHERE client_key = @client_key
ORDER BY supervisor_name;


PRINT '============================================================';
PRINT '3. TODOS LOS ASESORES Y SU SUPERVISOR CURRENT';
PRINT '============================================================';

SELECT
    advisor_key,
    source_advisor_id,
    advisor_document,
    advisor_name,
    role_name,

    supervisor_key,
    source_supervisor_id,
    supervisor_document,
    supervisor_name,

    valid_from,
    valid_to,
    is_current

FROM analytics.v_advisor_supervisor_current
WHERE client_key = @client_key
  AND advisor_is_active = 1
ORDER BY advisor_name;


PRINT '============================================================';
PRINT '4. COBERTURA STAGING vs ANALYTICS';
PRINT '============================================================';

;WITH SourceCurrent AS
(
    SELECT
        a.advisor_key,
        u.nid_UsuSuper AS source_supervisor_id
    FROM analytics.dim_advisor AS a
    INNER JOIN staging.aval_usuario_current AS u
        ON u.source_code = @source_code
       AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)
    WHERE a.client_key = @client_key
      AND a.is_active = 1
),
AnalyticsCurrent AS
(
    SELECT
        advisor_key,
        TRY_CONVERT(INT, source_supervisor_id)
            AS analytics_supervisor_id
    FROM analytics.v_advisor_supervisor_current
    WHERE client_key = @client_key
      AND advisor_is_active = 1
)
SELECT
    COUNT(*) AS active_advisors,

    SUM(
        CASE WHEN s.source_supervisor_id IS NOT NULL
            THEN 1 ELSE 0 END
    ) AS source_with_supervisor,

    SUM(
        CASE WHEN s.source_supervisor_id IS NULL
            THEN 1 ELSE 0 END
    ) AS source_without_supervisor,

    SUM(
        CASE WHEN a.analytics_supervisor_id IS NOT NULL
            THEN 1 ELSE 0 END
    ) AS analytics_with_supervisor,

    SUM(
        CASE WHEN a.analytics_supervisor_id IS NULL
            THEN 1 ELSE 0 END
    ) AS analytics_without_supervisor,

    SUM(
        CASE
            WHEN ISNULL(s.source_supervisor_id, -1)
               <> ISNULL(a.analytics_supervisor_id, -1)
                THEN 1
            ELSE 0
        END
    ) AS source_analytics_differences

FROM SourceCurrent AS s
INNER JOIN AnalyticsCurrent AS a
    ON a.advisor_key = s.advisor_key;


PRINT '============================================================';
PRINT '5. DIFERENCIAS DE MAPPING';
PRINT '============================================================';

SELECT
    a.source_advisor_id,
    a.advisor_document,
    a.advisor_name,

    u.nid_UsuSuper AS source_supervisor_id,
    v.source_supervisor_id AS analytics_supervisor_id,
    v.supervisor_name AS analytics_supervisor_name

FROM analytics.dim_advisor AS a

INNER JOIN staging.aval_usuario_current AS u
    ON u.source_code = @source_code
   AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)

LEFT JOIN analytics.v_advisor_supervisor_current AS v
    ON v.advisor_key = a.advisor_key

WHERE a.client_key = @client_key
  AND a.is_active = 1
  AND ISNULL(u.nid_UsuSuper, -1)
      <> ISNULL(TRY_CONVERT(INT, v.source_supervisor_id), -1)

ORDER BY a.advisor_name;


PRINT '============================================================';
PRINT '6. INVARIANTES DEL BRIDGE';
PRINT '============================================================';

SELECT
    SUM(
        CASE WHEN x.current_count > 1
            THEN 1 ELSE 0 END
    ) AS advisors_with_multiple_current,

    SUM(
        CASE WHEN x.invalid_period_count > 0
            THEN 1 ELSE 0 END
    ) AS advisors_with_invalid_period

FROM
(
    SELECT
        a.advisor_key,

        SUM(
            CASE WHEN b.is_current = 1
                THEN 1 ELSE 0 END
        ) AS current_count,

        SUM(
            CASE
                WHEN b.valid_to IS NOT NULL
                 AND b.valid_to < b.valid_from
                    THEN 1
                ELSE 0
            END
        ) AS invalid_period_count

    FROM analytics.dim_advisor AS a
    LEFT JOIN analytics.bridge_supervisor_advisor AS b
        ON b.advisor_key = a.advisor_key

    WHERE a.client_key = @client_key
      AND a.is_active = 1

    GROUP BY a.advisor_key
) AS x;


PRINT '============================================================';
PRINT '7. ASESORES SIN SUPERVISOR';
PRINT '============================================================';

SELECT
    source_advisor_id,
    advisor_document,
    advisor_name,
    role_name
FROM analytics.v_advisor_supervisor_current
WHERE client_key = @client_key
  AND advisor_is_active = 1
  AND supervisor_key IS NULL
ORDER BY advisor_name;


PRINT '============================================================';
PRINT '8. WATERMARK';
PRINT '============================================================';

SELECT *
FROM etl.watermark
WHERE source_code = 'CLARO_SUPERVISOR_HIERARCHY';


PRINT '============================================================';
PRINT '9. ASSESSMENT';
PRINT '============================================================';

;WITH CurrentState AS
(
    SELECT
        COUNT(*) AS advisor_count,
        SUM(CASE WHEN supervisor_key IS NOT NULL THEN 1 ELSE 0 END)
            AS with_supervisor,
        SUM(CASE WHEN supervisor_key IS NULL THEN 1 ELSE 0 END)
            AS without_supervisor
    FROM analytics.v_advisor_supervisor_current
    WHERE client_key = @client_key
      AND advisor_is_active = 1
),
Diffs AS
(
    SELECT COUNT(*) AS diff_count
    FROM analytics.dim_advisor AS a
    INNER JOIN staging.aval_usuario_current AS u
        ON u.source_code = @source_code
       AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)
    LEFT JOIN analytics.v_advisor_supervisor_current AS v
        ON v.advisor_key = a.advisor_key
    WHERE a.client_key = @client_key
      AND a.is_active = 1
      AND ISNULL(u.nid_UsuSuper, -1)
          <> ISNULL(TRY_CONVERT(INT, v.source_supervisor_id), -1)
)
SELECT
    c.advisor_count,
    c.with_supervisor,
    c.without_supervisor,
    d.diff_count,

    CASE
        WHEN d.diff_count > 0
            THEN 'REVISAR_DIFERENCIAS_SOURCE_ANALYTICS'

        WHEN c.without_supervisor = 0
            THEN 'JERARQUIA_COMPLETA_Y_SINCRONIZADA'

        ELSE 'JERARQUIA_PARCIAL_VERIFICADA_Y_SINCRONIZADA'
    END AS assessment

FROM CurrentState AS c
CROSS JOIN Diffs AS d;
