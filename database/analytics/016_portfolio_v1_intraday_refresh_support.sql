/*
Portfolio Control Center - soporte de refresco intradia
Motor objetivo: SQL Server / aval_analytics

Objetivos
- Registrar la ultima corrida CORTO de aval_reporteria consumida por Analytics.
- Mantener una bitacora persistente del refresco intradia.
- No ejecutar ETL pesado si aval_reporteria no publico una corrida CORTO/HECHO nueva.

IMPORTANTE
- La senal canonical upstream es aval_reporteria.dbo.pbi_ciclo_ejecucion.
- source_as_of_at sigue viniendo de los ETL LIVE/ADVISOR; id_corrida solo decide
  si existe una nueva version estable que vale la pena consumir.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM etl.watermark
    WHERE source_code = 'CLARO_INTRADAY_UPSTREAM'
)
BEGIN
    INSERT INTO etl.watermark
    (
        source_code,
        overlap_days
    )
    VALUES
    (
        'CLARO_INTRADAY_UPSTREAM',
        0
    );
END;
GO

IF OBJECT_ID('etl.execution_log', 'U') IS NULL
BEGIN
    CREATE TABLE etl.execution_log
    (
        execution_id       BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_etl_execution_log PRIMARY KEY,
        process_code       VARCHAR(100) NOT NULL,
        crm_client_id      INT NULL,
        source_id          BIGINT NULL,
        source_as_of_at    DATETIME2(3) NULL,
        started_at         DATETIME2(3) NOT NULL
            CONSTRAINT DF_etl_execution_log_started_at
            DEFAULT (SYSUTCDATETIME()),
        finished_at        DATETIME2(3) NULL,
        duration_ms        BIGINT NULL,
        status             VARCHAR(20) NOT NULL,
        detail             NVARCHAR(2000) NULL,

        CONSTRAINT CK_etl_execution_log_status
            CHECK
            (
                status IN
                (
                    'EN_CURSO',
                    'HECHO',
                    'SIN_CAMBIOS',
                    'SOLAPADO',
                    'ERROR'
                )
            )
    );

    CREATE INDEX IX_etl_execution_log_process_started
        ON etl.execution_log
        (
            process_code,
            crm_client_id,
            started_at DESC
        );
END;
GO
