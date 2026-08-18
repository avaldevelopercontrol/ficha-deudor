/*
Portfolio Control Center - ETAPA 6 / Avance 3
ETL CLARO - jerarquía Supervisor -> Asesor

IMPORTANTE:
Este procedimiento SE EJECUTA en aval_analytics (172.23.1.180),
pero YA NO consulta aval_cob directamente.

FUENTE INTERMEDIA:
- staging.aval_usuario_current

La staging debe ser cargada previamente desde:
- 192.168.100.45\MSSQLSERVER,51601
- aval_cob.dbo.av_Usuario

REGLA CONFIRMADA:
- asesor = av_Usuario.nId_Usuario
- supervisor current = av_Usuario.nid_UsuSuper
- supervisor = self-join por nId_Usuario

DESTINO:
- analytics.dim_supervisor
- analytics.bridge_supervisor_advisor
- etl.watermark
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


CREATE OR ALTER PROCEDURE etl.usp_load_claro_supervisor_hierarchy
    @crm_client_id  INT,
    @source_code    VARCHAR(50) = 'AVAL_COB_45',
    @as_of_at       DATETIME2(3) = NULL,
    @effective_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @crm_client_id IS NULL OR @crm_client_id <= 0
        THROW 51910, '@crm_client_id es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@source_code)), '') IS NULL
        THROW 51911, '@source_code es obligatorio.', 1;

    DECLARE @client_key INT;
    DECLARE @source_as_of_at DATETIME2(3);

    SELECT @client_key = client_key
    FROM analytics.dim_client
    WHERE crm_client_id = @crm_client_id
      AND is_active = 1;

    IF @client_key IS NULL
        THROW 51912,
            'Cliente no encontrado en analytics.dim_client.',
            1;

    SELECT
        @source_as_of_at = MAX(source_as_of_at)
    FROM staging.aval_usuario_current
    WHERE source_code = @source_code;

    IF @source_as_of_at IS NULL
        THROW 51913,
            'No existe snapshot de av_Usuario en staging para el source_code indicado.',
            1;

    SET @as_of_at = ISNULL(@as_of_at, @source_as_of_at);
    SET @effective_date =
        ISNULL(@effective_date, CONVERT(DATE, @source_as_of_at));


    /* ============================================================
       1. Fuente current local en Analytics
       ============================================================ */

    IF OBJECT_ID('tempdb..#HierarchySource') IS NOT NULL
        DROP TABLE #HierarchySource;

    SELECT
        a.advisor_key,
        a.source_advisor_id,
        a.advisor_document,

        u.nId_Usuario AS source_advisor_user_id,
        NULLIF(LTRIM(RTRIM(u.cUsr_NroDoc)), '') AS source_advisor_document,

        u.nid_UsuSuper AS source_supervisor_id,

        su.nId_Usuario AS resolved_supervisor_id,
        NULLIF(LTRIM(RTRIM(su.cUsr_NroDoc)), '') AS supervisor_document,

        NULLIF(
            LTRIM(RTRIM(
                CONCAT(
                    ISNULL(su.cUsr_ApePat, ''),
                    CASE
                        WHEN NULLIF(LTRIM(RTRIM(su.cUsr_ApeMat)), '') IS NOT NULL
                            THEN ' '
                        ELSE ''
                    END,
                    ISNULL(su.cUsr_ApeMat, ''),
                    CASE
                        WHEN NULLIF(LTRIM(RTRIM(su.cUsr_Nombres)), '') IS NOT NULL
                         AND (
                                NULLIF(LTRIM(RTRIM(su.cUsr_ApePat)), '') IS NOT NULL
                             OR NULLIF(LTRIM(RTRIM(su.cUsr_ApeMat)), '') IS NOT NULL
                         )
                            THEN ' '
                        ELSE ''
                    END,
                    ISNULL(su.cUsr_Nombres, '')
                )
            )),
            ''
        ) AS supervisor_name,

        su.bEstado AS supervisor_is_active

    INTO #HierarchySource

    FROM analytics.dim_advisor AS a

    LEFT JOIN staging.aval_usuario_current AS u
        ON u.source_code = @source_code
       AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)

    LEFT JOIN staging.aval_usuario_current AS su
        ON su.source_code = @source_code
       AND su.nId_Usuario = u.nid_UsuSuper

    WHERE a.client_key = @client_key
      AND a.is_active = 1;


    IF NOT EXISTS (SELECT 1 FROM #HierarchySource)
        THROW 51914,
            'No existen asesores activos para el cliente en analytics.dim_advisor.',
            1;


    /* ============================================================
       2. Calidad
       ============================================================ */

    IF EXISTS
    (
        SELECT 1
        FROM #HierarchySource
        WHERE source_advisor_user_id IS NULL
    )
        THROW 51915,
            'Hay asesores Analytics que no existen en el snapshot staging de av_Usuario.',
            1;


    IF EXISTS
    (
        SELECT 1
        FROM #HierarchySource
        WHERE advisor_document IS NOT NULL
          AND source_advisor_document IS NOT NULL
          AND LTRIM(RTRIM(advisor_document))
              <> LTRIM(RTRIM(source_advisor_document))
    )
        THROW 51916,
            'DNI de asesor no coincide entre Analytics y staging av_Usuario.',
            1;


    IF EXISTS
    (
        SELECT 1
        FROM #HierarchySource
        WHERE source_supervisor_id IS NOT NULL
          AND resolved_supervisor_id IS NULL
    )
        THROW 51917,
            'Existe nid_UsuSuper cuyo usuario supervisor no esta en staging.',
            1;


    IF EXISTS
    (
        SELECT 1
        FROM #HierarchySource
        WHERE resolved_supervisor_id IS NOT NULL
          AND supervisor_name IS NULL
    )
        THROW 51918,
            'Existe supervisor resuelto sin nombre utilizable.',
            1;


    /* ============================================================
       3. Supervisores únicos
       ============================================================ */

    IF OBJECT_ID('tempdb..#Supervisors') IS NOT NULL
        DROP TABLE #Supervisors;

    SELECT DISTINCT
        resolved_supervisor_id AS source_supervisor_id,
        supervisor_document,
        supervisor_name,
        CONVERT(BIT, ISNULL(supervisor_is_active, 0)) AS is_active
    INTO #Supervisors
    FROM #HierarchySource
    WHERE resolved_supervisor_id IS NOT NULL;


    /* ============================================================
       4. Escritura idempotente
       ============================================================ */

    BEGIN TRY
        BEGIN TRANSACTION;


        UPDATE d
        SET
            d.supervisor_document = s.supervisor_document,
            d.supervisor_name = s.supervisor_name,
            d.is_active = s.is_active,
            d.updated_at = SYSUTCDATETIME()
        FROM analytics.dim_supervisor AS d
        INNER JOIN #Supervisors AS s
            ON d.client_key = @client_key
           AND d.source_supervisor_id =
               CONVERT(VARCHAR(50), s.source_supervisor_id);


        INSERT INTO analytics.dim_supervisor
        (
            client_key,
            source_supervisor_id,
            supervisor_document,
            supervisor_name,
            is_active
        )
        SELECT
            @client_key,
            CONVERT(VARCHAR(50), s.source_supervisor_id),
            s.supervisor_document,
            s.supervisor_name,
            s.is_active
        FROM #Supervisors AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.dim_supervisor AS d
            WHERE d.client_key = @client_key
              AND d.source_supervisor_id =
                  CONVERT(VARCHAR(50), s.source_supervisor_id)
        );


        IF OBJECT_ID('tempdb..#Desired') IS NOT NULL
            DROP TABLE #Desired;

        SELECT
            h.advisor_key,
            h.source_advisor_id,
            h.source_supervisor_id,
            d.supervisor_key
        INTO #Desired
        FROM #HierarchySource AS h
        LEFT JOIN analytics.dim_supervisor AS d
            ON d.client_key = @client_key
           AND d.source_supervisor_id =
               CONVERT(VARCHAR(50), h.source_supervisor_id);


        /*
          Si una relación creada en la misma fecha cambia durante un rerun,
          eliminamos esa observación y recreamos la correcta.
        */
        DELETE b
        FROM analytics.bridge_supervisor_advisor AS b
        INNER JOIN #Desired AS d
            ON d.advisor_key = b.advisor_key
        WHERE b.is_current = 1
          AND b.valid_from = @effective_date
          AND
          (
              d.supervisor_key IS NULL
              OR d.supervisor_key <> b.supervisor_key
          );


        /*
          Si la relación venía de un día anterior, cerramos historia.
        */
        UPDATE b
        SET
            b.valid_to = DATEADD(DAY, -1, @effective_date),
            b.is_current = 0
        FROM analytics.bridge_supervisor_advisor AS b
        INNER JOIN #Desired AS d
            ON d.advisor_key = b.advisor_key
        WHERE b.is_current = 1
          AND b.valid_from < @effective_date
          AND
          (
              d.supervisor_key IS NULL
              OR d.supervisor_key <> b.supervisor_key
          );


        INSERT INTO analytics.bridge_supervisor_advisor
        (
            supervisor_key,
            advisor_key,
            valid_from,
            valid_to,
            is_current
        )
        SELECT
            d.supervisor_key,
            d.advisor_key,
            @effective_date,
            NULL,
            1
        FROM #Desired AS d
        WHERE d.supervisor_key IS NOT NULL
          AND NOT EXISTS
          (
              SELECT 1
              FROM analytics.bridge_supervisor_advisor AS b
              WHERE b.advisor_key = d.advisor_key
                AND b.is_current = 1
          );


        /* ============================================================
           5. Watermark
           ============================================================ */

        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime = @source_as_of_at,
            last_source_id = NULL,
            overlap_days = 0,
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'CLARO_SUPERVISOR_HIERARCHY';

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
                'CLARO_SUPERVISOR_HIERARCHY',
                SYSUTCDATETIME(),
                @source_as_of_at,
                NULL,
                0
            );
        END;


        COMMIT TRANSACTION;


        /* ============================================================
           6. Resumen
           ============================================================ */

        SELECT
            @source_code AS source_code,
            @source_as_of_at AS source_as_of_at,
            @effective_date AS effective_date,

            COUNT(*) AS active_advisors,

            SUM(
                CASE WHEN source_supervisor_id IS NOT NULL
                    THEN 1 ELSE 0 END
            ) AS advisors_with_supervisor,

            SUM(
                CASE WHEN source_supervisor_id IS NULL
                    THEN 1 ELSE 0 END
            ) AS advisors_without_supervisor,

            COUNT(DISTINCT source_supervisor_id)
                AS distinct_supervisors,

            CASE
                WHEN SUM(
                    CASE WHEN source_supervisor_id IS NULL
                        THEN 1 ELSE 0 END
                ) = 0
                    THEN 'COMPLETE'
                ELSE 'PARTIAL_VERIFIED'
            END AS hierarchy_quality

        FROM #HierarchySource;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
