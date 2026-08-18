/*
Portfolio Control Center - ETAPA 6
Validación concisa post-run del transporte Supervisor -> Asesor.

EJECUTAR EN:
172.23.1.180\MSSQLSERVER,51601 / aval_analytics
*/

SET NOCOUNT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @source_code VARCHAR(50) = 'AVAL_COB_45';
DECLARE @client_key INT;
DECLARE @staging_rows INT;
DECLARE @staging_min DATETIME2(3);
DECLARE @staging_max DATETIME2(3);
DECLARE @watermark_source DATETIME2(3);
DECLARE @mapping_differences INT;
DECLARE @multiple_current INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id
  AND is_active = 1;

IF @client_key IS NULL
    THROW 51980, 'Cliente activo no encontrado en Analytics.', 1;

SELECT
    @staging_rows = COUNT(*),
    @staging_min = MIN(source_as_of_at),
    @staging_max = MAX(source_as_of_at)
FROM staging.aval_usuario_current
WHERE source_code = @source_code;

SELECT
    @watermark_source = last_source_datetime
FROM etl.watermark
WHERE source_code = 'CLARO_SUPERVISOR_HIERARCHY';

SELECT
    @mapping_differences = COUNT(*)
FROM analytics.dim_advisor AS a
INNER JOIN staging.aval_usuario_current AS u
    ON u.source_code = @source_code
   AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)
LEFT JOIN analytics.v_advisor_supervisor_current AS v
    ON v.advisor_key = a.advisor_key
WHERE a.client_key = @client_key
  AND a.is_active = 1
  AND ISNULL(u.nid_UsuSuper, -1)
      <> ISNULL(TRY_CONVERT(INT, v.source_supervisor_id), -1);

SELECT
    @multiple_current = COUNT(*)
FROM
(
    SELECT b.advisor_key
    FROM analytics.bridge_supervisor_advisor AS b
    INNER JOIN analytics.dim_advisor AS a
        ON a.advisor_key = b.advisor_key
    WHERE a.client_key = @client_key
      AND a.is_active = 1
      AND b.is_current = 1
    GROUP BY b.advisor_key
    HAVING COUNT(*) > 1
) AS x;

SELECT
    @staging_rows AS staging_rows,
    @staging_min AS staging_min_source_as_of_at,
    @staging_max AS staging_max_source_as_of_at,
    @watermark_source AS hierarchy_watermark_source_as_of_at,
    ISNULL(@mapping_differences, 0) AS mapping_differences,
    ISNULL(@multiple_current, 0) AS advisors_with_multiple_current,
    CASE
        WHEN ISNULL(@staging_rows, 0) = 0
            THEN 'ERROR_STAGING_VACIO'
        WHEN @staging_min <> @staging_max
            THEN 'ERROR_STAGING_MEZCLA_SNAPSHOTS'
        WHEN @watermark_source IS NULL
            THEN 'ERROR_WATERMARK_AUSENTE'
        WHEN @staging_max <> @watermark_source
            THEN 'ERROR_STAGING_WATERMARK_DESALINEADO'
        WHEN ISNULL(@mapping_differences, 0) <> 0
            THEN 'ERROR_MAPPING_DIFERENTE'
        WHEN ISNULL(@multiple_current, 0) <> 0
            THEN 'ERROR_MULTIPLE_CURRENT'
        ELSE 'OK'
    END AS assessment;
