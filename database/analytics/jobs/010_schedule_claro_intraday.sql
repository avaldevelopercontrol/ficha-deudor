/*
Portfolio Control Center - SQL Agent del refresco intradia

Ejecutar conectado a aval_analytics con una cuenta autorizada a administrar
SQL Server Agent. El job revisa cada 5 minutos si aval_reporteria publico una
corrida CORTO/HECHO nueva; LIVE/ADVISOR solo corren cuando cambia id_corrida.
Se inicia en el minuto 02 para no competir con PBI_CICLO_CORTO, que dispara
en los minutos 00, 15, 30 y 45.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

DECLARE
    @job_name SYSNAME = N'ANALYTICS_CLARO_INTRADAY',
    @schedule_name SYSNAME = N'ANALYTICS_CLARO_INTRADAY_CADA_5_MIN',
    @database_name SYSNAME = DB_NAME(),
    @job_id UNIQUEIDENTIFIER;

IF @database_name IS NULL
    THROW 51020, 'No se pudo resolver la base Analytics actual.', 1;

SELECT @job_id = job_id
FROM msdb.dbo.sysjobs
WHERE name = @job_name;

IF @job_id IS NULL
BEGIN
    EXEC msdb.dbo.sp_add_job
        @job_name = @job_name,
        @enabled = 1,
        @description = N'Refresco condicionado del Portfolio Control Center CLARO.',
        @job_id = @job_id OUTPUT;

    EXEC msdb.dbo.sp_add_jobserver
        @job_id = @job_id;
END
ELSE
BEGIN
    EXEC msdb.dbo.sp_update_job
        @job_id = @job_id,
        @enabled = 1,
        @description = N'Refresco condicionado del Portfolio Control Center CLARO.';
END;

IF EXISTS
(
    SELECT 1
    FROM msdb.dbo.sysjobsteps
    WHERE job_id = @job_id
      AND step_id = 1
)
BEGIN
    EXEC msdb.dbo.sp_update_jobstep
        @job_id = @job_id,
        @step_id = 1,
        @step_name = N'Refrescar Analytics si hay nueva corrida CORTO',
        @subsystem = N'TSQL',
        @database_name = @database_name,
        @command = N'EXEC etl.usp_refresh_claro_intraday @crm_client_id = 95;',
        @on_success_action = 1,
        @on_fail_action = 2;
END
ELSE
BEGIN
    EXEC msdb.dbo.sp_add_jobstep
        @job_id = @job_id,
        @step_name = N'Refrescar Analytics si hay nueva corrida CORTO',
        @subsystem = N'TSQL',
        @database_name = @database_name,
        @command = N'EXEC etl.usp_refresh_claro_intraday @crm_client_id = 95;',
        @on_success_action = 1,
        @on_fail_action = 2;
END;

IF EXISTS
(
    SELECT 1
    FROM msdb.dbo.sysschedules
    WHERE name = @schedule_name
)
BEGIN
    EXEC msdb.dbo.sp_update_schedule
        @name = @schedule_name,
        @enabled = 1,
        @freq_type = 4,
        @freq_interval = 1,
        @freq_subday_type = 4,
        @freq_subday_interval = 5,
        @active_start_time = 060200,
        @active_end_time = 220000;
END
ELSE
BEGIN
    EXEC msdb.dbo.sp_add_schedule
        @schedule_name = @schedule_name,
        @enabled = 1,
        @freq_type = 4,
        @freq_interval = 1,
        @freq_subday_type = 4,
        @freq_subday_interval = 5,
        @active_start_time = 060200,
        @active_end_time = 220000;
END;

IF NOT EXISTS
(
    SELECT 1
    FROM msdb.dbo.sysjobschedules AS js
    INNER JOIN msdb.dbo.sysschedules AS s
        ON s.schedule_id = js.schedule_id
    WHERE js.job_id = @job_id
      AND s.name = @schedule_name
)
BEGIN
    EXEC msdb.dbo.sp_attach_schedule
        @job_id = @job_id,
        @schedule_name = @schedule_name;
END;
GO
