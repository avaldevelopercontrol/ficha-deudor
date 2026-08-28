/*
Portfolio Control Center - orquestador intradia CLARO

- Consume solo corridas CORTO/CICLO/HECHO de aval_reporteria.
- Si id_corrida no cambio, termina sin ejecutar LIVE/ADVISOR.
- Solo avanza CLARO_INTRADAY_UPSTREAM cuando ambos ETL terminan bien.
- Un applock propio evita dos refrescos Analytics simultaneos.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

CREATE OR ALTER PROCEDURE etl.usp_refresh_claro_intraday
    @crm_client_id INT = 95,
    @force BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @lock_result INT,
        @upstream_lock_result INT = NULL,
        @lock_resource NVARCHAR(255) = CONCAT(
            N'analytics_claro_intraday_',
            @crm_client_id
        ),
        @execution_id BIGINT = NULL,
        @started_at DATETIME2(3) = SYSUTCDATETIME(),
        @upstream_source_id BIGINT = NULL,
        @last_processed_source_id BIGINT = NULL,
        @live_source_as_of DATETIME2(3) = NULL,
        @advisor_source_as_of DATETIME2(3) = NULL,
        @operation_source_as_of DATETIME2(3) = NULL,
        @finished_at DATETIME2(3) = NULL;

    EXEC @lock_result = sys.sp_getapplock
        @Resource = @lock_resource,
        @LockMode = 'Exclusive',
        @LockOwner = 'Session',
        @LockTimeout = 0;

    IF @lock_result < 0
        RETURN 0;

    /*
       Mantener un lock Shared sobre el mismo recurso que usa
       aval_reporteria impide leer rpt_gestiones_pagos_final mientras un
       CORTO/FULL lo esta reconstruyendo. Si el lock Exclusive esta ocupado,
       este watcher se retira y vuelve a intentar en la siguiente ventana.
    */
    EXEC @upstream_lock_result = aval_reporteria.sys.sp_getapplock
        @Resource = N'pbi_ciclo',
        @LockMode = 'Shared',
        @LockOwner = 'Session',
        @LockTimeout = 0;

    IF @upstream_lock_result < 0
    BEGIN
        EXEC sys.sp_releaseapplock
            @Resource = @lock_resource,
            @LockOwner = 'Session';

        RETURN 0;
    END;

    BEGIN TRY
        SELECT TOP (1)
            @upstream_source_id = e.id_corrida
        FROM aval_reporteria.dbo.pbi_ciclo_ejecucion AS e
        WHERE e.ciclo = 'CORTO'
          AND e.fase = 'CICLO'
          AND e.estado = 'HECHO'
          AND e.id_corrida IS NOT NULL
          AND e.fin IS NOT NULL
        ORDER BY e.id_corrida DESC;

        SELECT
            @last_processed_source_id = w.last_source_id
        FROM etl.watermark AS w
        WHERE w.source_code = 'CLARO_INTRADAY_UPSTREAM';

        IF @upstream_source_id IS NULL
           OR
           (
               @force = 0
               AND @last_processed_source_id IS NOT NULL
               AND @upstream_source_id <= @last_processed_source_id
           )
        BEGIN
            EXEC aval_reporteria.sys.sp_releaseapplock
                @Resource = N'pbi_ciclo',
                @LockOwner = 'Session';

            EXEC sys.sp_releaseapplock
                @Resource = @lock_resource,
                @LockOwner = 'Session';

            RETURN 0;
        END;

        INSERT INTO etl.execution_log
        (
            process_code,
            crm_client_id,
            source_id,
            started_at,
            status
        )
        VALUES
        (
            'CLARO_INTRADAY',
            @crm_client_id,
            @upstream_source_id,
            @started_at,
            'EN_CURSO'
        );

        SET @execution_id = SCOPE_IDENTITY();

        EXEC etl.usp_load_claro_live_operations
            @crm_client_id = @crm_client_id;

        EXEC etl.usp_load_claro_advisor_daily
            @crm_client_id = @crm_client_id;

        SELECT
            @live_source_as_of = MAX(
                CASE
                    WHEN w.source_code = 'GESTION_COB2_LIVE'
                        THEN w.last_source_datetime
                END
            ),
            @advisor_source_as_of = MAX(
                CASE
                    WHEN w.source_code = 'CLARO_ADVISOR_DAILY'
                        THEN w.last_source_datetime
                END
            )
        FROM etl.watermark AS w
        WHERE w.source_code IN
        (
            'GESTION_COB2_LIVE',
            'CLARO_ADVISOR_DAILY'
        );

        IF @live_source_as_of IS NULL
           OR @advisor_source_as_of IS NULL
        BEGIN
            THROW 51010,
                'LIVE/ADVISOR finalizaron sin source_as_of_at valido.',
                1;
        END;

        SET @operation_source_as_of =
            CASE
                WHEN @live_source_as_of <= @advisor_source_as_of
                    THEN @live_source_as_of
                ELSE @advisor_source_as_of
            END;

        SET @finished_at = SYSUTCDATETIME();

        BEGIN TRANSACTION;

        UPDATE etl.watermark
        SET
            last_success_at = @finished_at,
            last_source_datetime = @operation_source_as_of,
            last_source_id = @upstream_source_id,
            overlap_days = 0,
            updated_at = @finished_at
        WHERE source_code = 'CLARO_INTRADAY_UPSTREAM';

        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO etl.watermark
            (
                source_code,
                last_success_at,
                last_source_datetime,
                last_source_id,
                overlap_days
            )
            VALUES
            (
                'CLARO_INTRADAY_UPSTREAM',
                @finished_at,
                @operation_source_as_of,
                @upstream_source_id,
                0
            );
        END;

        UPDATE etl.execution_log
        SET
            source_as_of_at = @operation_source_as_of,
            finished_at = @finished_at,
            duration_ms = DATEDIFF_BIG(
                MILLISECOND,
                @started_at,
                @finished_at
            ),
            status = 'HECHO'
        WHERE execution_id = @execution_id;

        COMMIT TRANSACTION;

        EXEC aval_reporteria.sys.sp_releaseapplock
            @Resource = N'pbi_ciclo',
            @LockOwner = 'Session';

        EXEC sys.sp_releaseapplock
            @Resource = @lock_resource,
            @LockOwner = 'Session';

        SELECT
            @upstream_source_id AS upstream_source_id,
            @operation_source_as_of AS operation_source_as_of_at,
            @finished_at AS refreshed_at_utc,
            CAST('HECHO' AS VARCHAR(20)) AS status;

        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @finished_at = SYSUTCDATETIME();

        IF @execution_id IS NOT NULL
        BEGIN
            UPDATE etl.execution_log
            SET
                finished_at = @finished_at,
                duration_ms = DATEDIFF_BIG(
                    MILLISECOND,
                    @started_at,
                    @finished_at
                ),
                status = 'ERROR',
                detail = LEFT(
                    CONCAT(
                        N'Error ',
                        ERROR_NUMBER(),
                        N': ',
                        ERROR_MESSAGE()
                    ),
                    2000
                )
            WHERE execution_id = @execution_id;
        END
        ELSE
        BEGIN
            INSERT INTO etl.execution_log
            (
                process_code,
                crm_client_id,
                source_id,
                started_at,
                finished_at,
                duration_ms,
                status,
                detail
            )
            VALUES
            (
                'CLARO_INTRADAY',
                @crm_client_id,
                @upstream_source_id,
                @started_at,
                @finished_at,
                DATEDIFF_BIG(MILLISECOND, @started_at, @finished_at),
                'ERROR',
                LEFT(CONCAT(N'Error ', ERROR_NUMBER(), N': ', ERROR_MESSAGE()), 2000)
            );
        END;

        IF @upstream_lock_result >= 0
        BEGIN
            EXEC aval_reporteria.sys.sp_releaseapplock
                @Resource = N'pbi_ciclo',
                @LockOwner = 'Session';
        END;

        EXEC sys.sp_releaseapplock
            @Resource = @lock_resource,
            @LockOwner = 'Session';

        THROW;
    END CATCH;
END;
GO
