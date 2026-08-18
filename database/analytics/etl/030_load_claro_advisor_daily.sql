/*
Portfolio Control Center - ETAPA 6 / Avance 3
ETL CLARO - dimensión y producción diaria por asesor

FUENTES:
- aval_reporteria.dbo.rpt_gestiones_pagos_final
- aval_reporteria.dbo.rpt_ref_usuario
- aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO

DESTINO:
- analytics.dim_advisor
- analytics.fact_advisor_daily
- analytics.fact_advisor_debtor_contact_daily
- analytics.fact_advisor_debtor_payment_daily
- analytics.fact_promise.advisor_key
- etl.watermark

REGLAS:
- source_advisor_id = nId_Usuario
- advisor_document = DNI único dentro del scope CLARO/cartera/mes
- Pago Sin Promesa NO se atribuye a asesor
- contacto por asesor se deduplica y persiste a debtor/day/portfolio/advisor
  con precedencia CD > CI > NC
- el detalle persistido permite RPC exacto en rangos sin sumar distinct diarios
- pagadores por asesor se persisten a debtor/day/portfolio/advisor para distinct exacto multi-día
- reproceso month-to-date completo e idempotente
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


CREATE OR ALTER PROCEDURE etl.usp_load_claro_advisor_daily
    @crm_client_id       INT,
    @as_of_at            DATETIME2(3) = NULL,
    @campaign_year       SMALLINT = NULL,
    @campaign_month      TINYINT = NULL,
    @source_client_name  VARCHAR(150) = 'CLARO CORPORATIVO'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @as_of_at = ISNULL(@as_of_at, SYSDATETIME());
    SET @campaign_year = ISNULL(@campaign_year, YEAR(@as_of_at));
    SET @campaign_month = ISNULL(@campaign_month, MONTH(@as_of_at));

    IF @crm_client_id IS NULL OR @crm_client_id <= 0
        THROW 51800, '@crm_client_id es obligatorio.', 1;

    IF @campaign_month NOT BETWEEN 1 AND 12
        THROW 51801, '@campaign_month debe estar entre 1 y 12.', 1;

    DECLARE @client_key INT;
    DECLARE @campaign_key INT;

    DECLARE @campaign_code VARCHAR(20) =
        CONCAT(
            @campaign_year,
            '-',
            RIGHT(CONCAT('0', @campaign_month), 2)
        );

    DECLARE @campaign_start DATE =
        DATEFROMPARTS(@campaign_year, @campaign_month, 1);

    DECLARE @as_of_date DATE =
        CONVERT(DATE, @as_of_at);

    DECLARE @end_exclusive DATETIME2(3) =
        DATEADD(DAY, 1, CONVERT(DATETIME2(3), @as_of_date));

    SELECT @client_key = client_key
    FROM analytics.dim_client
    WHERE crm_client_id = @crm_client_id
      AND is_active = 1;

    IF @client_key IS NULL
        THROW 51802, 'Cliente no encontrado en analytics.dim_client.', 1;

    SELECT @campaign_key = campaign_key
    FROM analytics.dim_campaign
    WHERE client_key = @client_key
      AND campaign_code = @campaign_code;

    IF @campaign_key IS NULL
        THROW 51803, 'Campaña no encontrada en analytics.dim_campaign.', 1;


    /* ============================================================
       1. Gestión real del mes

       Excluye las filas sintéticas de pago.
       ============================================================ */

    IF OBJECT_ID('tempdb..#Source') IS NOT NULL
        DROP TABLE #Source;

    SELECT
        p.portfolio_key,
        t.nId_Cartera,
        CONVERT(INT, t.nId_Usuario) AS source_advisor_id,
        CONVERT(INT, t.nId_UsuOpe) AS source_operator_id,
        NULLIF(LTRIM(RTRIM(t.nombre_asesor)), '') AS advisor_name,
        NULLIF(LTRIM(RTRIM(t.cNombre_Cargo)), '') AS role_name,

        CONVERT(BIGINT, t.nId_PersDeudor) AS source_debtor_id,
        CONVERT(BIGINT, t.nId_DocxCobrarOpe) AS source_operation_id,

        CONVERT(DATETIME2(3), t.dDocCobOpe_FecIni) AS management_at,
        CONVERT(DATE, t.dDocCobOpe_FecIni) AS management_date,
        CONVERT(
            INT,
            CONVERT(
                CHAR(8),
                CONVERT(DATE, t.dDocCobOpe_FecIni),
                112
            )
        ) AS date_key,

        UPPER(LTRIM(RTRIM(ISNULL(t.indicador_equiv, ''))))
            AS contact_code,

        CONVERT(BIT, ISNULL(t.marca_promesa_valida, 0))
            AS is_valid_promise_source,

        NULLIF(LTRIM(RTRIM(t.estado_pdp)), '')
            AS source_status,

        CONVERT(DECIMAL(19,4), ISNULL(t.montoPromesa, 0))
            AS promise_amount,

        CONVERT(DECIMAL(19,4), ISNULL(t.total_pagado, 0))
            AS paid_amount,

        CONVERT(DATETIME2(3), t.fecha_proceso)
            AS source_updated_at

    INTO #Source
    FROM aval_reporteria.dbo.rpt_gestiones_pagos_final AS t
    INNER JOIN analytics.dim_portfolio AS p
        ON p.client_key = @client_key
       AND p.source_portfolio_id = t.nId_Cartera
    WHERE t.cCli_Nombre COLLATE DATABASE_DEFAULT
          = @source_client_name COLLATE DATABASE_DEFAULT
      AND t.anio = @campaign_year
      AND t.nCampCar = @campaign_month
      AND t.dDocCobOpe_FecIni >= @campaign_start
      AND t.dDocCobOpe_FecIni < @end_exclusive
      AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
          NOT LIKE '%PAGO SIN PROMESA%';

    CREATE INDEX IX_Source_AdvisorDate
        ON #Source(source_advisor_id, date_key, portfolio_key);

    CREATE INDEX IX_Source_Operation
        ON #Source(source_operation_id);

    DECLARE @source_rows BIGINT;
    DECLARE @source_as_of_at DATETIME2(3);
    DECLARE @last_source_id BIGINT;

    SELECT
        @source_rows = COUNT_BIG(*),
        @source_as_of_at = MAX(source_updated_at),
        @last_source_id = MAX(source_operation_id)
    FROM #Source;

    IF ISNULL(@source_rows, 0) = 0
        THROW 51804, 'No hay gestiones CLARO en el scope solicitado.', 1;


    /* ============================================================
       2. Guardas de identidad
       ============================================================ */

    IF EXISTS
    (
        SELECT 1
        FROM #Source
        WHERE ISNULL(source_advisor_id, 0) = 0
    )
        THROW 51805, 'Existen gestiones reales sin nId_Usuario.', 1;

    IF EXISTS
    (
        SELECT source_advisor_id
        FROM #Source
        GROUP BY source_advisor_id
        HAVING COUNT(DISTINCT advisor_name) > 1
    )
        THROW 51806, 'Un nId_Usuario está asociado a múltiples nombres en el scope.', 1;


    /* ============================================================
       3. Identidad descriptiva más reciente
       ============================================================ */

    IF OBJECT_ID('tempdb..#LatestAdvisor') IS NOT NULL
        DROP TABLE #LatestAdvisor;

    ;WITH Ranked AS
    (
        SELECT
            source_advisor_id,
            advisor_name,
            role_name,
            management_at,
            source_updated_at,
            ROW_NUMBER() OVER
            (
                PARTITION BY source_advisor_id
                ORDER BY
                    management_at DESC,
                    source_updated_at DESC
            ) AS rn
        FROM #Source
    )
    SELECT
        source_advisor_id,
        advisor_name,
        role_name
    INTO #LatestAdvisor
    FROM Ranked
    WHERE rn = 1;


    /* ============================================================
       4. DNI dentro del MISMO scope CLARO

       RPTC puede contener historia/otros scopes. Por eso se restringe
       a los mismos usuarios, carteras y fechas.
       ============================================================ */

    IF OBJECT_ID('tempdb..#AdvisorDni') IS NOT NULL
        DROP TABLE #AdvisorDni;

    ;WITH DniScope AS
    (
        SELECT
            r.NID_USUARIO,
            NULLIF(LTRIM(RTRIM(r.USU_DNI)), '') AS usu_dni
        FROM aval_reporteria.dbo.RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO AS r
        INNER JOIN
        (
            SELECT DISTINCT source_advisor_id
            FROM #Source
        ) AS a
            ON a.source_advisor_id = r.NID_USUARIO
        INNER JOIN analytics.dim_portfolio AS p
            ON p.client_key = @client_key
           AND p.source_portfolio_id = r.IDCARTERA
        WHERE r.FEC_CORTA >= @campaign_start
          AND r.FEC_CORTA <= @as_of_date
    )
    SELECT
        NID_USUARIO AS source_advisor_id,
        COUNT(DISTINCT usu_dni) AS distinct_dni,
        MIN(usu_dni) AS advisor_document
    INTO #AdvisorDni
    FROM DniScope
    GROUP BY NID_USUARIO;

    IF EXISTS
    (
        SELECT 1
        FROM #AdvisorDni
        WHERE distinct_dni > 1
    )
        THROW 51807, 'Conflicto de DNI por nId_Usuario dentro del scope CLARO.', 1;


    /* ============================================================
       5. Upsert dim_advisor
       ============================================================ */

    UPDATE a
    SET
        a.advisor_document = d.advisor_document,
        a.advisor_name = l.advisor_name,
        a.role_name = l.role_name,
        a.is_active = 1,
        a.updated_at = SYSUTCDATETIME()
    FROM analytics.dim_advisor AS a
    INNER JOIN #LatestAdvisor AS l
        ON a.client_key = @client_key
       AND a.source_advisor_id = CONVERT(VARCHAR(50), l.source_advisor_id)
    LEFT JOIN #AdvisorDni AS d
        ON d.source_advisor_id = l.source_advisor_id;

    INSERT INTO analytics.dim_advisor
    (
        client_key,
        source_advisor_id,
        advisor_document,
        advisor_name,
        role_name,
        is_active
    )
    SELECT
        @client_key,
        CONVERT(VARCHAR(50), l.source_advisor_id),
        d.advisor_document,
        l.advisor_name,
        l.role_name,
        1
    FROM #LatestAdvisor AS l
    LEFT JOIN #AdvisorDni AS d
        ON d.source_advisor_id = l.source_advisor_id
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM analytics.dim_advisor AS a
        WHERE a.client_key = @client_key
          AND a.source_advisor_id =
              CONVERT(VARCHAR(50), l.source_advisor_id)
    );


    /* ============================================================
       6. Mapa source -> surrogate
       ============================================================ */

    IF OBJECT_ID('tempdb..#AdvisorMap') IS NOT NULL
        DROP TABLE #AdvisorMap;

    SELECT
        CONVERT(INT, a.source_advisor_id) AS source_advisor_id,
        a.advisor_key
    INTO #AdvisorMap
    FROM analytics.dim_advisor AS a
    WHERE a.client_key = @client_key
      AND a.source_advisor_id IN
      (
          SELECT CONVERT(VARCHAR(50), source_advisor_id)
          FROM #LatestAdvisor
      );


    /* ============================================================
       7. Clasificación de contacto por debtor/day/advisor

       Precedencia:
       CD > CI > NC

       El grain detallado se conserva porque sumar los distinct diarios
       de fact_advisor_daily NO produce un distinct exacto multi-día.
       ============================================================ */

    IF OBJECT_ID('tempdb..#AdvisorDebtorContactDaily') IS NOT NULL
        DROP TABLE #AdvisorDebtorContactDaily;

    SELECT
        s.date_key,
        s.portfolio_key,
        m.advisor_key,
        s.source_debtor_id,

        CONVERT(
            BIT,
            MAX(CASE WHEN s.contact_code = 'CD' THEN 1 ELSE 0 END)
        ) AS had_direct_contact,

        CONVERT(
            BIT,
            MAX(CASE WHEN s.contact_code = 'CI' THEN 1 ELSE 0 END)
        ) AS had_indirect_contact,

        CONVERT(
            BIT,
            MAX(CASE WHEN s.contact_code = 'NC' THEN 1 ELSE 0 END)
        ) AS had_no_contact

    INTO #AdvisorDebtorContactDaily
    FROM #Source AS s
    INNER JOIN #AdvisorMap AS m
        ON m.source_advisor_id = s.source_advisor_id
    GROUP BY
        s.date_key,
        s.portfolio_key,
        m.advisor_key,
        s.source_debtor_id;

    CREATE UNIQUE INDEX UX_AdvisorDebtorContactDaily_Grain
        ON #AdvisorDebtorContactDaily
        (
            date_key,
            portfolio_key,
            advisor_key,
            source_debtor_id
        );


    IF OBJECT_ID('tempdb..#ContactDaily') IS NOT NULL
        DROP TABLE #ContactDaily;

    SELECT
        date_key,
        portfolio_key,
        advisor_key,

        SUM(CASE WHEN had_direct_contact = 1 THEN 1 ELSE 0 END)
            AS direct_contact_clients,

        SUM(
            CASE
                WHEN had_direct_contact = 0
                 AND had_indirect_contact = 1
                    THEN 1
                ELSE 0
            END
        ) AS indirect_contact_clients,

        SUM(
            CASE
                WHEN had_direct_contact = 0
                 AND had_indirect_contact = 0
                 AND had_no_contact = 1
                    THEN 1
                ELSE 0
            END
        ) AS no_contact_clients

    INTO #ContactDaily
    FROM #AdvisorDebtorContactDaily
    GROUP BY
        date_key,
        portfolio_key,
        advisor_key;


    /* ============================================================
       8. Pagadores por debtor/day/advisor

       El grain se persiste separado del contacto porque pago y contacto
       son hechos distintos. Solo se incluyen pagos atribuibles a gestiones
       reales; Pago Sin Promesa ya fue excluido de #Source.
       ============================================================ */

    IF OBJECT_ID('tempdb..#AdvisorDebtorPayerDaily') IS NOT NULL
        DROP TABLE #AdvisorDebtorPayerDaily;

    SELECT
        s.date_key,
        s.portfolio_key,
        m.advisor_key,
        s.source_debtor_id
    INTO #AdvisorDebtorPayerDaily
    FROM #Source AS s
    INNER JOIN #AdvisorMap AS m
        ON m.source_advisor_id = s.source_advisor_id
    WHERE s.paid_amount > 0
    GROUP BY
        s.date_key,
        s.portfolio_key,
        m.advisor_key,
        s.source_debtor_id;

    CREATE UNIQUE INDEX UX_AdvisorDebtorPayerDaily_Grain
        ON #AdvisorDebtorPayerDaily
        (
            date_key,
            portfolio_key,
            advisor_key,
            source_debtor_id
        );


    IF OBJECT_ID('tempdb..#PayerDaily') IS NOT NULL
        DROP TABLE #PayerDaily;

    SELECT
        date_key,
        portfolio_key,
        advisor_key,
        COUNT_BIG(*) AS payers_count
    INTO #PayerDaily
    FROM #AdvisorDebtorPayerDaily
    GROUP BY
        date_key,
        portfolio_key,
        advisor_key;


    /* ============================================================
       9. Producción diaria base
       ============================================================ */

    IF OBJECT_ID('tempdb..#AdvisorDaily') IS NOT NULL
        DROP TABLE #AdvisorDaily;

    ;WITH Base AS
    (
        SELECT
            s.date_key,
            s.portfolio_key,
            m.advisor_key,

            COUNT_BIG(*) AS management_events,

            SUM(
                CASE
                    WHEN s.is_valid_promise_source = 1
                     AND s.promise_amount > 0
                     AND UPPER(ISNULL(s.source_status, ''))
                         NOT LIKE '%NO PDP%'
                        THEN 1
                    ELSE 0
                END
            ) AS promises_count,

            SUM(
                CASE
                    WHEN s.is_valid_promise_source = 1
                     AND s.promise_amount > 0
                     AND UPPER(ISNULL(s.source_status, ''))
                         NOT LIKE '%NO PDP%'
                        THEN s.promise_amount
                    ELSE CONVERT(DECIMAL(19,4), 0)
                END
            ) AS promises_amount,

            SUM(s.paid_amount) AS recovered_amount

        FROM #Source AS s
        INNER JOIN #AdvisorMap AS m
            ON m.source_advisor_id = s.source_advisor_id
        GROUP BY
            s.date_key,
            s.portfolio_key,
            m.advisor_key
    )
    SELECT
        b.date_key,
        b.portfolio_key,
        b.advisor_key,

        CONVERT(INT, b.management_events)
            AS management_events,

        CONVERT(INT, ISNULL(c.direct_contact_clients, 0))
            AS direct_contact_clients,

        CONVERT(INT, ISNULL(c.indirect_contact_clients, 0))
            AS indirect_contact_clients,

        CONVERT(INT, ISNULL(c.no_contact_clients, 0))
            AS no_contact_clients,

        CONVERT(INT, b.promises_count)
            AS promises_count,

        CONVERT(DECIMAL(19,4), b.promises_amount)
            AS promises_amount,

        CONVERT(INT, ISNULL(py.payers_count, 0))
            AS payers_count,

        CONVERT(DECIMAL(19,4), b.recovered_amount)
            AS recovered_amount

    INTO #AdvisorDaily
    FROM Base AS b
    LEFT JOIN #ContactDaily AS c
        ON c.date_key = b.date_key
       AND c.portfolio_key = b.portfolio_key
       AND c.advisor_key = b.advisor_key
    LEFT JOIN #PayerDaily AS py
        ON py.date_key = b.date_key
       AND py.portfolio_key = b.portfolio_key
       AND py.advisor_key = b.advisor_key;


    /* ============================================================
       10. Mapeo de fact_promise -> advisor
       ============================================================ */

    IF OBJECT_ID('tempdb..#OperationAdvisor') IS NOT NULL
        DROP TABLE #OperationAdvisor;

    SELECT
        s.source_operation_id,
        MIN(m.advisor_key) AS advisor_key,
        COUNT(DISTINCT m.advisor_key) AS distinct_advisors
    INTO #OperationAdvisor
    FROM #Source AS s
    INNER JOIN #AdvisorMap AS m
        ON m.source_advisor_id = s.source_advisor_id
    WHERE s.source_operation_id IS NOT NULL
    GROUP BY s.source_operation_id;

    IF EXISTS
    (
        SELECT 1
        FROM #OperationAdvisor
        WHERE distinct_advisors > 1
    )
        THROW 51808, 'Una operación está asociada a múltiples asesores.', 1;


    /* ============================================================
       11. Escritura idempotente
       ============================================================ */

    BEGIN TRY
        BEGIN TRANSACTION;

        /*
          El detalle advisor/debtor/contact y la fact diaria pertenecen
          enteramente a este adaptador para CLARO V1. Reemplazar MTD evita
          mantener filas obsoletas y conserva idempotencia.
        */
        DELETE f
        FROM analytics.fact_advisor_debtor_contact_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date;

        INSERT INTO analytics.fact_advisor_debtor_contact_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key,
            source_debtor_id,
            had_direct_contact,
            had_indirect_contact,
            had_no_contact,
            source_as_of_at
        )
        SELECT
            d.date_key,
            @client_key,
            @campaign_key,
            d.portfolio_key,
            d.advisor_key,
            d.source_debtor_id,
            d.had_direct_contact,
            d.had_indirect_contact,
            d.had_no_contact,
            @source_as_of_at
        FROM #AdvisorDebtorContactDaily AS d;


        DELETE f
        FROM analytics.fact_advisor_debtor_payment_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date;

        INSERT INTO analytics.fact_advisor_debtor_payment_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key,
            source_debtor_id,
            source_as_of_at
        )
        SELECT
            d.date_key,
            @client_key,
            @campaign_key,
            d.portfolio_key,
            d.advisor_key,
            d.source_debtor_id,
            @source_as_of_at
        FROM #AdvisorDebtorPayerDaily AS d;


        DELETE f
        FROM analytics.fact_advisor_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date;

        INSERT INTO analytics.fact_advisor_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key,

            management_events,
            direct_contact_clients,
            indirect_contact_clients,
            no_contact_clients,
            promises_count,
            promises_amount,
            payers_count,
            recovered_amount,

            source_as_of_at
        )
        SELECT
            d.date_key,
            @client_key,
            @campaign_key,
            d.portfolio_key,
            d.advisor_key,

            d.management_events,
            d.direct_contact_clients,
            d.indirect_contact_clients,
            d.no_contact_clients,
            d.promises_count,
            d.promises_amount,
            d.payers_count,
            d.recovered_amount,

            @source_as_of_at
        FROM #AdvisorDaily AS d;

        /*
          Completa advisor_key de las promesas ya materializadas por el
          ETL live. Solo toca operaciones que tienen un mapping inequívoco.
        */
        UPDATE p
        SET
            p.advisor_key = o.advisor_key,
            p.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_promise AS p
        INNER JOIN #OperationAdvisor AS o
            ON o.source_operation_id = p.source_operation_id
        WHERE p.client_key = @client_key
          AND p.campaign_key = @campaign_key;


        /* Watermark independiente del ETL live */
        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime = @source_as_of_at,
            last_source_id = @last_source_id,
            overlap_days = 0,
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'CLARO_ADVISOR_DAILY';

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
                'CLARO_ADVISOR_DAILY',
                SYSUTCDATETIME(),
                @source_as_of_at,
                @last_source_id,
                0
            );
        END;

        COMMIT TRANSACTION;


        /* ============================================================
           12. Resumen
           ============================================================ */

        SELECT
            @campaign_code AS campaign_code,
            @as_of_at AS requested_as_of_at,
            @source_as_of_at AS source_as_of_at,
            @source_rows AS source_management_rows,

            (
                SELECT COUNT(*)
                FROM #LatestAdvisor
            ) AS advisors_in_source,

            (
                SELECT COUNT(*)
                FROM #AdvisorDni
                WHERE distinct_dni = 1
                  AND advisor_document IS NOT NULL
            ) AS advisors_with_dni,

            (
                SELECT COUNT(*)
                FROM #AdvisorDebtorContactDaily
            ) AS advisor_debtor_contact_rows,

            (
                SELECT COUNT(*)
                FROM #AdvisorDebtorPayerDaily
            ) AS advisor_debtor_payer_rows,

            SUM(d.management_events) AS management_events,
            SUM(d.direct_contact_clients) AS direct_contact_clients,
            SUM(d.indirect_contact_clients) AS indirect_contact_clients,
            SUM(d.no_contact_clients) AS no_contact_clients,
            SUM(d.promises_count) AS promises_count,
            SUM(d.promises_amount) AS promises_amount,
            SUM(d.payers_count) AS payers_count,
            SUM(d.recovered_amount) AS attributable_recovered_amount,

            (
                SELECT COUNT(*)
                FROM analytics.fact_promise AS p
                WHERE p.client_key = @client_key
                  AND p.campaign_key = @campaign_key
                  AND p.is_valid_promise = 1
                  AND p.advisor_key IS NOT NULL
            ) AS valid_promises_with_advisor

        FROM #AdvisorDaily AS d;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
