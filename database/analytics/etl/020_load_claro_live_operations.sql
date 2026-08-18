/*
Portfolio Control Center - ETAPA 6 / Avance 2
ETL intradía CLARO desde GESTION-COB2

FUENTE:
    aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos

DESTINO:
    Analytics DB actual

ALCANCE DE ESTE AVANCE:
- flows diarios de Portfolio;
- contactos CD / CI / NC a grain deudor/día;
- pagadores Portfolio a grain deudor/día para distinct exacto multi-día;
- promesas/PDP;
- pagos/recaudo según semántica actual de GESTION-COB2;
- watermark.

NO CARGA TODAVÍA:
- advisor_key / fact_advisor_daily;
- supervisor.

Motivo:
GESTION-COB2 expone nombre_asesor, pero no un ID estable del asesor.
No se usará el nombre como clave técnica.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


CREATE OR ALTER PROCEDURE etl.usp_load_claro_live_operations
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
        THROW 51300, '@crm_client_id es obligatorio.', 1;

    IF @campaign_month NOT BETWEEN 1 AND 12
        THROW 51301, '@campaign_month debe estar entre 1 y 12.', 1;

    IF NULLIF(LTRIM(RTRIM(@source_client_name)), '') IS NULL
        THROW 51302, '@source_client_name es obligatorio.', 1;

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

    DECLARE @campaign_end DATE =
        EOMONTH(@campaign_start);

    DECLARE @as_of_date DATE = CAST(@as_of_at AS DATE);

    DECLARE @end_exclusive DATETIME2(3) =
        DATEADD(DAY, 1, CONVERT(DATETIME2(3), @as_of_date));

    SELECT @client_key = client_key
    FROM analytics.dim_client
    WHERE crm_client_id = @crm_client_id
      AND is_active = 1;

    IF @client_key IS NULL
        THROW 51303, 'No existe el cliente activo en analytics.dim_client.', 1;

    SELECT @campaign_key = campaign_key
    FROM analytics.dim_campaign
    WHERE client_key = @client_key
      AND campaign_code = @campaign_code;

    IF @campaign_key IS NULL
        THROW 51304, 'No existe la campaña en analytics.dim_campaign.', 1;

    EXEC etl.usp_ensure_date_range
        @date_from = @campaign_start,
        @date_to = @campaign_end;


    /* ============================================================
       1. STAGING: solo carteras pertenecientes al scope Analytics
       ============================================================ */

    IF OBJECT_ID('tempdb..#Live') IS NOT NULL
        DROP TABLE #Live;

    SELECT
        p.portfolio_key,
        p.source_portfolio_id,
        p.portfolio_name,

        g.ultima_fecha_pago,
        g.ultima_fecha_registro,
        g.cCli_Nombre,
        g.cCar_Nombre,
        g.nCampCar,
        g.nombre_asesor,
        g.anio,
        g.estado_pdp,
        CONVERT(BIGINT, g.nId_PersDeudor) AS source_debtor_id,
        UPPER(LTRIM(RTRIM(ISNULL(g.indicador_equiv, ''))))
            AS contact_code,
        CONVERT(DECIMAL(19,4), ISNULL(g.montoPromesa, 0))
            AS promise_amount,
        CONVERT(DECIMAL(19,4), ISNULL(g.total_pagado, 0))
            AS paid_amount,
        CONVERT(BIT, ISNULL(g.marca_promesa_valida, 0))
            AS source_valid_promise,

        CONVERT(
            BIT,
            CASE
                WHEN UPPER(LTRIM(RTRIM(ISNULL(g.estado_pdp, ''))))
                     LIKE '%PAGO SIN PROMESA%'
                    THEN 1
                ELSE 0
            END
        ) AS is_payment_only_row,

        g.cNombre_Cargo,
        CONVERT(DATE, g.dFechCompromisoPago)
            AS promise_due_date,
        CONVERT(DATETIME2(3), g.dDocCobOpe_FecIni)
            AS management_at,
        CONVERT(DATE, g.dDocCobOpe_FecIni)
            AS management_date,
        CONVERT(
            INT,
            CONVERT(
                CHAR(8),
                CONVERT(DATE, g.dDocCobOpe_FecIni),
                112
            )
        ) AS date_key,
        CONVERT(BIGINT, g.nId_DocxCobrarOpe)
            AS source_operation_id,
        g.detalle_gestion
    INTO #Live
    FROM aval_reporteria.dbo.vw_bi_gerencia_gestiones_pagos AS g
    INNER JOIN analytics.dim_portfolio AS p
        ON p.client_key = @client_key
       AND p.portfolio_name COLLATE DATABASE_DEFAULT
           = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
    WHERE g.cCli_Nombre COLLATE DATABASE_DEFAULT
          = @source_client_name COLLATE DATABASE_DEFAULT
      AND g.anio = @campaign_year
      AND g.nCampCar = @campaign_month
      AND g.dDocCobOpe_FecIni >= @campaign_start
      AND g.dDocCobOpe_FecIni < @end_exclusive;

    CREATE INDEX IX_Live_DatePortfolio
        ON #Live(date_key, portfolio_key);

    CREATE INDEX IX_Live_Debtor
        ON #Live(portfolio_key, source_debtor_id, management_date);

    CREATE INDEX IX_Live_Operation
        ON #Live(source_operation_id);


    DECLARE @source_rows BIGINT;
    DECLARE @source_as_of_at DATETIME2(3);
    DECLARE @last_source_id BIGINT;

    SELECT
        @source_rows = COUNT_BIG(*),
        @source_as_of_at = MAX(CONVERT(DATETIME2(3), ultima_fecha_registro)),
        @last_source_id = MAX(source_operation_id)
    FROM #Live;

    IF ISNULL(@source_rows, 0) = 0
        THROW 51305, 'GESTION-COB2 no devolvió filas para el scope CLARO solicitado.', 1;

    /*
      nId_DocxCobrarOpe se usa como identificador idempotente de promesa.
      Si una fila promise-like no lo tiene, preferimos detener la carga antes
      que inventar una clave con nombre/fecha/texto.
    */
    DECLARE @promise_rows_without_id BIGINT;
    DECLARE @ignored_non_promise_without_id BIGINT;

    /*
      Dos estados NO pertenecen al dominio de promesas:

      - "9. No PdP y No Pagos"
      - "6. Pago Sin Promesa"

      "Pago Sin Promesa" es una fila sintética de pago:
      puede no tener nId_DocxCobrarOpe y debe aportar a recaudo/pagadores,
      pero NO a gestión, contacto ni fact_promise.
    */
    SELECT @ignored_non_promise_without_id = COUNT_BIG(*)
    FROM #Live
    WHERE source_operation_id IS NULL
      AND source_valid_promise = 0
      AND promise_due_date IS NULL
      AND
      (
          UPPER(ISNULL(estado_pdp, '')) LIKE '%NO PDP%'
          OR is_payment_only_row = 1
      );

    SELECT @promise_rows_without_id = COUNT_BIG(*)
    FROM #Live
    WHERE source_operation_id IS NULL
      AND UPPER(ISNULL(estado_pdp, '')) NOT LIKE '%NO PDP%'
      AND is_payment_only_row = 0
      AND
      (
          source_valid_promise = 1
          OR promise_due_date IS NOT NULL
          OR promise_amount > 0
          OR NULLIF(LTRIM(RTRIM(estado_pdp)), '') IS NOT NULL
      );

    IF @promise_rows_without_id > 0
        THROW 51306, 'Existen filas PDP/promesa reales sin nId_DocxCobrarOpe; revisar la fuente antes de cargar.', 1;

    DECLARE @payer_rows_without_debtor_id BIGINT;

    SELECT @payer_rows_without_debtor_id = COUNT_BIG(*)
    FROM #Live
    WHERE paid_amount > 0
      AND source_debtor_id IS NULL;

    IF @payer_rows_without_debtor_id > 0
        THROW 51307, 'Existen filas con pago sin nId_PersDeudor; no se puede materializar el pagador Portfolio de forma estable.', 1;


    /* ============================================================
       2. CONTACTO A GRAIN DEUDOR/DÍA
       ============================================================ */

    IF OBJECT_ID('tempdb..#ContactDaily') IS NOT NULL
        DROP TABLE #ContactDaily;

    SELECT
        l.date_key,
        l.portfolio_key,
        l.source_debtor_id,

        CONVERT(
            BIT,
            MAX(CASE WHEN l.contact_code = 'CD' THEN 1 ELSE 0 END)
        ) AS had_direct_contact,

        CONVERT(
            BIT,
            MAX(CASE WHEN l.contact_code = 'CI' THEN 1 ELSE 0 END)
        ) AS had_indirect_contact,

        CONVERT(
            BIT,
            MAX(CASE WHEN l.contact_code = 'NC' THEN 1 ELSE 0 END)
        ) AS had_no_contact
    INTO #ContactDaily
    FROM #Live AS l
    WHERE l.is_payment_only_row = 0
    GROUP BY
        l.date_key,
        l.portfolio_key,
        l.source_debtor_id;


    /* ============================================================
       3. PAGADOR PORTFOLIO A GRAIN DEUDOR/DÍA

       Incluye también "Pago Sin Promesa": esas filas no son gestión,
       contacto ni promesa, pero sí representan pago/pagador Portfolio.
       ============================================================ */

    IF OBJECT_ID('tempdb..#DebtorPayerDaily') IS NOT NULL
        DROP TABLE #DebtorPayerDaily;

    SELECT
        l.date_key,
        l.portfolio_key,
        l.source_debtor_id
    INTO #DebtorPayerDaily
    FROM #Live AS l
    WHERE l.paid_amount > 0
    GROUP BY
        l.date_key,
        l.portfolio_key,
        l.source_debtor_id;


    /* ============================================================
       4. PRIMERA GESTIÓN / PRIMER CD EN LA CAMPAÑA
       ============================================================ */

    IF OBJECT_ID('tempdb..#FirstManaged') IS NOT NULL
        DROP TABLE #FirstManaged;

    SELECT
        portfolio_key,
        source_debtor_id,
        MIN(management_date) AS first_management_date
    INTO #FirstManaged
    FROM #Live
    WHERE is_payment_only_row = 0
    GROUP BY
        portfolio_key,
        source_debtor_id;


    IF OBJECT_ID('tempdb..#FirstDirect') IS NOT NULL
        DROP TABLE #FirstDirect;

    SELECT
        portfolio_key,
        source_debtor_id,
        MIN(management_date) AS first_direct_date
    INTO #FirstDirect
    FROM #Live
    WHERE is_payment_only_row = 0
      AND contact_code = 'CD'
    GROUP BY
        portfolio_key,
        source_debtor_id;


    /* ============================================================
       5. FLOW DIARIO POR CARTERA

       Recaudo:
       se conserva la semántica oficial de GESTION-COB2:
           SUM(total_pagado)
       bajo el filtro de FECHA DE GESTIÓN.

       Como total_pagado puede cambiar posteriormente, se reprocesa
       TODO el mes en curso en cada corrida. Esto permite corregir
       días anteriores sin hacer INSERT incremental ciego.
       ============================================================ */

    IF OBJECT_ID('tempdb..#DailyFlow') IS NOT NULL
        DROP TABLE #DailyFlow;

    ;WITH Base AS
    (
        SELECT
            l.date_key,
            l.management_date,
            l.portfolio_key,

            SUM(
                CASE WHEN l.is_payment_only_row = 0 THEN 1 ELSE 0 END
            ) AS management_events_day,

            SUM(
                CASE
                    WHEN l.source_valid_promise = 1
                     AND l.promise_amount > 0
                     AND UPPER(ISNULL(l.estado_pdp, '')) NOT LIKE '%NO PDP%'
                        THEN 1
                    ELSE 0
                END
            ) AS promises_count_day,

            SUM(
                CASE
                    WHEN l.source_valid_promise = 1
                     AND l.promise_amount > 0
                     AND UPPER(ISNULL(l.estado_pdp, '')) NOT LIKE '%NO PDP%'
                        THEN l.promise_amount
                    ELSE CONVERT(DECIMAL(19,4), 0)
                END
            ) AS promises_amount_day,

            SUM(l.paid_amount) AS recovered_amount_day
        FROM #Live AS l
        GROUP BY
            l.date_key,
            l.management_date,
            l.portfolio_key
    ),
    Payers AS
    (
        SELECT
            date_key,
            portfolio_key,
            COUNT_BIG(*) AS payers_count_day
        FROM #DebtorPayerDaily
        GROUP BY
            date_key,
            portfolio_key
    ),
    NewManaged AS
    (
        SELECT
            CONVERT(
                INT,
                CONVERT(CHAR(8), first_management_date, 112)
            ) AS date_key,
            portfolio_key,
            COUNT_BIG(*) AS new_managed_clients_day
        FROM #FirstManaged
        GROUP BY
            first_management_date,
            portfolio_key
    ),
    NewDirect AS
    (
        SELECT
            CONVERT(
                INT,
                CONVERT(CHAR(8), first_direct_date, 112)
            ) AS date_key,
            portfolio_key,
            COUNT_BIG(*) AS new_direct_contacts_day
        FROM #FirstDirect
        GROUP BY
            first_direct_date,
            portfolio_key
    )
    SELECT
        b.date_key,
        b.portfolio_key,
        CONVERT(INT, b.management_events_day) AS management_events_day,
        CONVERT(INT, ISNULL(nm.new_managed_clients_day, 0))
            AS new_managed_clients_day,
        CONVERT(INT, ISNULL(nd.new_direct_contacts_day, 0))
            AS new_direct_contacts_day,
        CONVERT(INT, b.promises_count_day) AS promises_count_day,
        CONVERT(DECIMAL(19,4), b.promises_amount_day)
            AS promises_amount_day,
        CONVERT(INT, ISNULL(py.payers_count_day, 0)) AS payers_count_day,
        CONVERT(DECIMAL(19,4), b.recovered_amount_day)
            AS recovered_amount_day
    INTO #DailyFlow
    FROM Base AS b
    LEFT JOIN Payers AS py
        ON py.date_key = b.date_key
       AND py.portfolio_key = b.portfolio_key
    LEFT JOIN NewManaged AS nm
        ON nm.date_key = b.date_key
       AND nm.portfolio_key = b.portfolio_key
    LEFT JOIN NewDirect AS nd
        ON nd.date_key = b.date_key
       AND nd.portfolio_key = b.portfolio_key;


    /* ============================================================
       6. STAGE DE PROMESAS

       Se incluyen filas "promise-like", no solamente válidas, para poder
       actualizar una promesa que cambie a caída/no válida posteriormente.
       ============================================================ */

    IF OBJECT_ID('tempdb..#PromiseStage') IS NOT NULL
        DROP TABLE #PromiseStage;

    ;WITH PromiseLike AS
    (
        SELECT
            l.*,

            CASE
                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%VENCE HOY%'
                    THEN 'DUE_TODAY'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%CUMPLIO FUERA RANGO%'
                    THEN 'FULFILLED_OUT_OF_RANGE'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%CUMPLIO PARCIAL%'
                    THEN 'PARTIAL'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%CUMPLIO%'
                    THEN 'FULFILLED'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%POR CONFIRMAR%'
                    THEN 'PENDING_CONFIRMATION'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%CAIDO%'
                    THEN 'BROKEN'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%NO PDP%'
                    THEN 'NO_PROMISE_NO_PAYMENT'

                WHEN UPPER(ISNULL(l.estado_pdp, '')) LIKE '%VIGENTE%'
                    THEN 'ACTIVE'

                ELSE 'UNKNOWN'
            END AS status_code,

            CONVERT(
                BIT,
                CASE
                    WHEN l.source_valid_promise = 1
                     AND l.promise_amount > 0
                     AND UPPER(ISNULL(l.estado_pdp, '')) NOT LIKE '%NO PDP%'
                        THEN 1
                    ELSE 0
                END
            ) AS is_valid_promise,

            ROW_NUMBER() OVER
            (
                PARTITION BY l.source_operation_id
                ORDER BY
                    l.ultima_fecha_registro DESC,
                    l.management_at DESC
            ) AS rn
        FROM #Live AS l
        WHERE l.source_operation_id IS NOT NULL
          AND UPPER(ISNULL(l.estado_pdp, '')) NOT LIKE '%NO PDP%'
          AND l.is_payment_only_row = 0
          AND
          (
              l.source_valid_promise = 1
              OR l.promise_due_date IS NOT NULL
              OR l.promise_amount > 0
              OR NULLIF(LTRIM(RTRIM(l.estado_pdp)), '') IS NOT NULL
          )
    )
    SELECT
        source_operation_id,
        source_debtor_id,
        portfolio_key,
        management_at,
        promise_due_date,
        promise_amount,
        paid_amount,
        CONVERT(DATETIME2(3), ultima_fecha_pago) AS last_payment_date,
        estado_pdp AS source_status,
        status_code,
        is_valid_promise,
        CONVERT(DATETIME2(3), ultima_fecha_registro) AS source_updated_at
    INTO #PromiseStage
    FROM PromiseLike
    WHERE rn = 1;


    /* ============================================================
       7. ESCRITURA ANALYTICS
       ============================================================ */

    BEGIN TRY
        BEGIN TRANSACTION;

        /* --------------------------------------------------------
           7.1 Contacto debtor/day
           -------------------------------------------------------- */

        UPDATE f
        SET
            f.had_direct_contact = s.had_direct_contact,
            f.had_indirect_contact = s.had_indirect_contact,
            f.had_no_contact = s.had_no_contact,
            f.source_as_of_at = @source_as_of_at,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_debtor_contact_daily AS f
        INNER JOIN #ContactDaily AS s
            ON s.date_key = f.date_key
           AND s.portfolio_key = f.portfolio_key
           AND s.source_debtor_id = f.source_debtor_id
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key;

        INSERT INTO analytics.fact_debtor_contact_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            source_debtor_id,
            had_direct_contact,
            had_indirect_contact,
            had_no_contact,
            source_as_of_at
        )
        SELECT
            s.date_key,
            @client_key,
            @campaign_key,
            s.portfolio_key,
            s.source_debtor_id,
            s.had_direct_contact,
            s.had_indirect_contact,
            s.had_no_contact,
            @source_as_of_at
        FROM #ContactDaily AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_debtor_contact_daily AS f
            WHERE f.date_key = s.date_key
              AND f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = s.portfolio_key
              AND f.source_debtor_id = s.source_debtor_id
        );

        /*
          Full month-to-date reprocess:
          si un contacto desaparece/cambia en la fuente, se elimina únicamente
          dentro del mismo cliente/campaña/mes que controla este adaptador.
        */
        DELETE f
        FROM analytics.fact_debtor_contact_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date
          AND NOT EXISTS
          (
              SELECT 1
              FROM #ContactDaily AS s
              WHERE s.date_key = f.date_key
                AND s.portfolio_key = f.portfolio_key
                AND s.source_debtor_id = f.source_debtor_id
          );


        /* --------------------------------------------------------
           7.2 Pagador Portfolio debtor/day
           -------------------------------------------------------- */

        UPDATE f
        SET
            f.source_as_of_at = @source_as_of_at,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_debtor_payment_daily AS f
        INNER JOIN #DebtorPayerDaily AS s
            ON s.date_key = f.date_key
           AND s.portfolio_key = f.portfolio_key
           AND s.source_debtor_id = f.source_debtor_id
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key;

        INSERT INTO analytics.fact_debtor_payment_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,
            source_debtor_id,
            source_as_of_at
        )
        SELECT
            s.date_key,
            @client_key,
            @campaign_key,
            s.portfolio_key,
            s.source_debtor_id,
            @source_as_of_at
        FROM #DebtorPayerDaily AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_debtor_payment_daily AS f
            WHERE f.date_key = s.date_key
              AND f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = s.portfolio_key
              AND f.source_debtor_id = s.source_debtor_id
        );

        DELETE f
        FROM analytics.fact_debtor_payment_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date
          AND NOT EXISTS
          (
              SELECT 1
              FROM #DebtorPayerDaily AS s
              WHERE s.date_key = f.date_key
                AND s.portfolio_key = f.portfolio_key
                AND s.source_debtor_id = f.source_debtor_id
          );


        /* --------------------------------------------------------
           7.3 Crear filas fact_portfolio_daily faltantes.

           Para el día actual se hereda el último snapshot conocido.
           Así el 13/08 puede mostrar la cartera T-1 del 12/08 + flows live.

           IMPORTANTE:
           has_source_snapshot = 0 porque estos valores no fueron observados
           por el snapshot de esa fecha; son carry-forward o cero si aún no
           existe un snapshot anterior.
           -------------------------------------------------------- */

        IF OBJECT_ID('tempdb..#RequiredFactRows') IS NOT NULL
            DROP TABLE #RequiredFactRows;

        SELECT DISTINCT
            date_key,
            portfolio_key
        INTO #RequiredFactRows
        FROM #DailyFlow

        UNION

        SELECT
            CONVERT(INT, CONVERT(CHAR(8), @as_of_date, 112)),
            p.portfolio_key
        FROM analytics.dim_portfolio AS p
        WHERE p.client_key = @client_key
          AND p.is_active = 1;

        INSERT INTO analytics.fact_portfolio_daily
        (
            date_key,
            client_key,
            campaign_key,
            portfolio_key,

            assigned_clients_snapshot,
            managed_clients_snapshot,
            pending_clients_snapshot,
            contacted_clients_snapshot,
            direct_contact_snapshot,

            assigned_amount_snapshot,
            managed_amount_snapshot,

            has_source_snapshot,
            source_as_of_at
        )
        SELECT
            r.date_key,
            @client_key,
            @campaign_key,
            r.portfolio_key,

            ISNULL(prev.assigned_clients_snapshot, 0),
            ISNULL(prev.managed_clients_snapshot, 0),
            ISNULL(prev.pending_clients_snapshot, 0),
            ISNULL(prev.contacted_clients_snapshot, 0),
            ISNULL(prev.direct_contact_snapshot, 0),

            ISNULL(prev.assigned_amount_snapshot, 0),
            ISNULL(prev.managed_amount_snapshot, 0),

            0,
            prev.source_as_of_at
        FROM #RequiredFactRows AS r
        OUTER APPLY
        (
            SELECT TOP (1)
                f.assigned_clients_snapshot,
                f.managed_clients_snapshot,
                f.pending_clients_snapshot,
                f.contacted_clients_snapshot,
                f.direct_contact_snapshot,
                f.assigned_amount_snapshot,
                f.managed_amount_snapshot,
                f.source_as_of_at
            FROM analytics.fact_portfolio_daily AS f
            WHERE f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = r.portfolio_key
              AND f.date_key < r.date_key
            ORDER BY f.date_key DESC
        ) AS prev
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_portfolio_daily AS f
            WHERE f.date_key = r.date_key
              AND f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND f.portfolio_key = r.portfolio_key
        );


        /*
          Reset controlado de flows del mes actual.
          GESTION-COB2 es la fuente autoritativa de estos campos para CLARO V1.
        */
        UPDATE f
        SET
            f.management_events_day = 0,
            f.new_managed_clients_day = 0,
            f.new_direct_contacts_day = 0,
            f.promises_count_day = 0,
            f.promises_amount_day = 0,
            f.payers_count_day = 0,
            f.recovered_amount_day = 0,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_portfolio_daily AS f
        INNER JOIN analytics.dim_date AS d
            ON d.date_key = f.date_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key
          AND d.calendar_date >= @campaign_start
          AND d.calendar_date <= @as_of_date;

        UPDATE f
        SET
            f.management_events_day = s.management_events_day,
            f.new_managed_clients_day = s.new_managed_clients_day,
            f.new_direct_contacts_day = s.new_direct_contacts_day,
            f.promises_count_day = s.promises_count_day,
            f.promises_amount_day = s.promises_amount_day,
            f.payers_count_day = s.payers_count_day,
            f.recovered_amount_day = s.recovered_amount_day,
            f.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_portfolio_daily AS f
        INNER JOIN #DailyFlow AS s
            ON s.date_key = f.date_key
           AND s.portfolio_key = f.portfolio_key
        WHERE f.client_key = @client_key
          AND f.campaign_key = @campaign_key;


        /* --------------------------------------------------------
           7.4 Promise/PDP UPSERT
           -------------------------------------------------------- */

        /*
          El live no dispone de un identificador técnico estable de asesor.
          Si la promesa ya fue enriquecida por el ETL de asesor, preservar
          advisor_key evita perder ese mapping en un reproceso posterior.
        */
        UPDATE p
        SET
            p.portfolio_key = s.portfolio_key,
            p.source_debtor_id = s.source_debtor_id,
            p.management_at = s.management_at,
            p.promise_due_date = s.promise_due_date,
            p.promise_amount = s.promise_amount,
            p.paid_amount = s.paid_amount,
            p.last_payment_date = s.last_payment_date,
            p.source_status = s.source_status,
            p.status_code = s.status_code,
            p.is_valid_promise = s.is_valid_promise,
            p.source_updated_at = s.source_updated_at,
            p.loaded_at = SYSUTCDATETIME()
        FROM analytics.fact_promise AS p
        INNER JOIN #PromiseStage AS s
            ON s.source_operation_id = p.source_operation_id
        WHERE p.client_key = @client_key;

        INSERT INTO analytics.fact_promise
        (
            client_key,
            campaign_key,
            portfolio_key,
            advisor_key,

            source_operation_id,
            source_debtor_id,
            management_at,
            promise_due_date,
            promise_amount,
            paid_amount,
            last_payment_date,

            source_status,
            status_code,
            is_valid_promise,

            source_updated_at
        )
        SELECT
            @client_key,
            @campaign_key,
            s.portfolio_key,
            NULL,

            s.source_operation_id,
            s.source_debtor_id,
            s.management_at,
            s.promise_due_date,
            s.promise_amount,
            s.paid_amount,
            s.last_payment_date,

            s.source_status,
            s.status_code,
            s.is_valid_promise,

            s.source_updated_at
        FROM #PromiseStage AS s
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.fact_promise AS p
            WHERE p.client_key = @client_key
              AND p.source_operation_id = s.source_operation_id
        );


        /* --------------------------------------------------------
           7.5 Watermark
           -------------------------------------------------------- */

        UPDATE etl.watermark
        SET
            last_success_at = SYSUTCDATETIME(),
            last_source_datetime = @source_as_of_at,
            last_source_id = @last_source_id,
            overlap_days = 0,
            updated_at = SYSUTCDATETIME()
        WHERE source_code = 'GESTION_COB2_LIVE';

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
                'GESTION_COB2_LIVE',
                SYSUTCDATETIME(),
                @source_as_of_at,
                @last_source_id,
                0
            );
        END;

        COMMIT TRANSACTION;


        /* ============================================================
           8. RESUMEN VERIFICABLE
           ============================================================ */

        ;WITH ContactPairs AS
        (
            SELECT DISTINCT
                f.portfolio_key,
                f.source_debtor_id,
                MAX(CONVERT(INT, f.had_direct_contact))
                    OVER
                    (
                        PARTITION BY f.portfolio_key, f.source_debtor_id
                    ) AS has_cd,
                MAX(CONVERT(INT, f.had_indirect_contact))
                    OVER
                    (
                        PARTITION BY f.portfolio_key, f.source_debtor_id
                    ) AS has_ci,
                MAX(CONVERT(INT, f.had_no_contact))
                    OVER
                    (
                        PARTITION BY f.portfolio_key, f.source_debtor_id
                    ) AS has_nc
            FROM analytics.fact_debtor_contact_daily AS f
            INNER JOIN analytics.dim_date AS d
                ON d.date_key = f.date_key
            WHERE f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND d.calendar_date >= @campaign_start
              AND d.calendar_date <= @as_of_date
        ),
        ContactSummary AS
        (
            SELECT
                SUM(
                    CASE
                        WHEN has_cd = 1 OR has_ci = 1 OR has_nc = 1
                            THEN 1
                        ELSE 0
                    END
                ) AS classifiable_pairs,

                SUM(
                    CASE WHEN has_cd = 1 THEN 1 ELSE 0 END
                ) AS direct_contact_pairs
            FROM ContactPairs
        ),
        FlowSummary AS
        (
            SELECT
                SUM(f.management_events_day) AS management_events,
                SUM(f.promises_count_day) AS promises_count,
                SUM(f.promises_amount_day) AS promises_amount,
                SUM(f.payers_count_day) AS payer_pairs_day_sum,
                SUM(f.recovered_amount_day) AS recovered_amount
            FROM analytics.fact_portfolio_daily AS f
            INNER JOIN analytics.dim_date AS d
                ON d.date_key = f.date_key
            WHERE f.client_key = @client_key
              AND f.campaign_key = @campaign_key
              AND d.calendar_date >= @campaign_start
              AND d.calendar_date <= @as_of_date
        ),
        PromiseSummary AS
        (
            SELECT
                SUM(
                    CASE
                        WHEN p.is_valid_promise = 1
                         AND p.status_code = 'DUE_TODAY'
                            THEN 1
                        ELSE 0
                    END
                ) AS due_today_count,

                SUM(
                    CASE
                        WHEN p.is_valid_promise = 1
                         AND p.status_code = 'DUE_TODAY'
                            THEN p.promise_amount
                        ELSE 0
                    END
                ) AS due_today_amount,

                SUM(
                    CASE
                        WHEN p.is_valid_promise = 1
                         AND p.status_code = 'BROKEN'
                            THEN 1
                        ELSE 0
                    END
                ) AS broken_count,

                SUM(
                    CASE
                        WHEN p.is_valid_promise = 1
                         AND p.status_code = 'BROKEN'
                            THEN p.promise_amount
                        ELSE 0
                    END
                ) AS broken_amount
            FROM analytics.fact_promise AS p
            WHERE p.client_key = @client_key
              AND p.campaign_key = @campaign_key
        )
        SELECT
            @campaign_code AS campaign_code,
            @as_of_at AS requested_as_of_at,
            @source_as_of_at AS source_as_of_at,
            @source_rows AS source_rows,
            @ignored_non_promise_without_id AS ignored_non_promise_without_operation_id,

            fs.management_events,
            cs.classifiable_pairs,
            cs.direct_contact_pairs,

            CAST(
                1.0 * cs.direct_contact_pairs
                / NULLIF(cs.classifiable_pairs, 0)
                AS DECIMAL(18,6)
            ) AS rpc_rate,

            fs.promises_count,
            fs.promises_amount,
            fs.recovered_amount,

            ps.due_today_count,
            ps.due_today_amount,
            ps.broken_count,
            ps.broken_amount
        FROM FlowSummary AS fs
        CROSS JOIN ContactSummary AS cs
        CROSS JOIN PromiseSummary AS ps;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
