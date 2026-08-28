/* Validacion rapida del refresco intradia del Portfolio Control Center. */

SET NOCOUNT ON;
GO

SELECT TOP (20)
    execution_id,
    process_code,
    crm_client_id,
    source_id,
    source_as_of_at,
    started_at,
    finished_at,
    duration_ms,
    status,
    detail
FROM etl.execution_log
WHERE process_code = 'CLARO_INTRADAY'
ORDER BY execution_id DESC;

SELECT
    source_code,
    last_success_at,
    DATEADD(HOUR, -5, last_success_at) AS last_success_peru,
    last_source_datetime,
    last_source_id,
    updated_at
FROM etl.watermark
WHERE source_code IN
(
    'CLARO_INTRADAY_UPSTREAM',
    'GESTION_COB2_LIVE',
    'CLARO_ADVISOR_DAILY',
    'CLARO_PORTFOLIO_SNAPSHOT'
)
ORDER BY source_code;
GO
