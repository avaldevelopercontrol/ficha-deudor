/*
Portfolio Control Center - ETAPA 6
Validación de preservación de fact_promise.advisor_key en el ETL live.

OBJETIVO:
- comprobar que las promesas válidas ya enriquecidas tienen advisor_key;
- ejecutar el live después del ETL de asesor;
- comprobar que el live no borra ni cambia advisor_key existente;
- comprobar que el total de promesas válidas coincide con la fuente live;
- comprobar que una operación no esté asociada a múltiples asesores;
- ejecutar el live una segunda vez y validar idempotencia funcional.

IMPORTANTE:
- este script EJECUTA etl.usp_load_claro_live_operations dos veces;
- ejecutar en aval_analytics;
- precondición: haber ejecutado previamente etl.usp_load_claro_advisor_daily
  para la campaña que se quiere validar.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @as_of_at DATETIME2(3) = SYSDATETIME();
DECLARE @source_client_name VARCHAR(150) = 'CLARO CORPORATIVO';

DECLARE @campaign_year SMALLINT = YEAR(@as_of_at);
DECLARE @campaign_month TINYINT = MONTH(@as_of_at);
DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);
DECLARE @as_of_date DATE = CONVERT(DATE, @as_of_at);
DECLARE @end_exclusive DATETIME2(3) =
    DATEADD(DAY, 1, CONVERT(DATETIME2(3), @as_of_date));
DECLARE @campaign_code VARCHAR(20) =
    CONCAT(
        @campaign_year,
        '-',
        RIGHT(CONCAT('0', @campaign_month), 2)
    );

DECLARE @client_key INT;
DECLARE @campaign_key INT;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id
  AND is_active = 1;

IF @client_key IS NULL
    THROW 52000, 'Cliente no encontrado en analytics.dim_client.', 1;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @campaign_key IS NULL
    THROW 52001, 'Campaña no encontrada en analytics.dim_campaign.', 1;


/* ============================================================
   1. Baseline antes de volver a ejecutar el live
   ============================================================ */

IF OBJECT_ID('tempdb..#Before') IS NOT NULL
    DROP TABLE #Before;

SELECT
    p.source_operation_id,
    p.advisor_key,
    p.portfolio_key,
    p.source_debtor_id,
    p.management_at,
    p.promise_due_date,
    p.promise_amount,
    p.paid_amount,
    p.last_payment_date,
    p.source_status,
    p.status_code,
    p.is_valid_promise,
    p.source_updated_at
INTO #Before
FROM analytics.fact_promise AS p
WHERE p.client_key = @client_key
  AND p.campaign_key = @campaign_key;

DECLARE @before_rows INT;
DECLARE @before_valid_promises INT;
DECLARE @before_valid_with_advisor INT;
DECLARE @before_valid_without_advisor INT;
DECLARE @before_assigned_rows INT;

SELECT
    @before_rows = COUNT(*),
    @before_valid_promises =
        SUM(CASE WHEN is_valid_promise = 1 THEN 1 ELSE 0 END),
    @before_valid_with_advisor =
        SUM(
            CASE
                WHEN is_valid_promise = 1
                 AND advisor_key IS NOT NULL
                    THEN 1
                ELSE 0
            END
        ),
    @before_valid_without_advisor =
        SUM(
            CASE
                WHEN is_valid_promise = 1
                 AND advisor_key IS NULL
                    THEN 1
                ELSE 0
            END
        ),
    @before_assigned_rows =
        SUM(CASE WHEN advisor_key IS NOT NULL THEN 1 ELSE 0 END)
FROM #Before;

SELECT
    @before_rows AS before_promise_rows,
    @before_valid_promises AS before_valid_promises,
    @before_valid_with_advisor AS before_valid_with_advisor,
    @before_valid_without_advisor AS before_valid_without_advisor,
    @before_assigned_rows AS before_rows_with_advisor;

IF ISNULL(@before_valid_promises, 0) = 0
    THROW 52002, 'No hay promesas válidas para ejecutar esta validación.', 1;

IF ISNULL(@before_valid_without_advisor, 0) > 0
    THROW 52003, 'Precondición incumplida: existen promesas válidas sin advisor_key. Ejecutar primero el ETL de asesor.', 1;


/* ============================================================
   2. Validación source operation -> advisor

   Misma fuente de identidad que usa el ETL de asesor.
   ============================================================ */

IF OBJECT_ID('tempdb..#OperationAdvisorConflicts') IS NOT NULL
    DROP TABLE #OperationAdvisorConflicts;

SELECT
    CONVERT(BIGINT, t.nId_DocxCobrarOpe) AS source_operation_id,
    COUNT(DISTINCT CONVERT(INT, t.nId_Usuario)) AS distinct_advisors
INTO #OperationAdvisorConflicts
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
  AND t.nId_DocxCobrarOpe IS NOT NULL
  AND UPPER(LTRIM(RTRIM(ISNULL(t.estado_pdp, ''))))
      NOT LIKE '%PAGO SIN PROMESA%'
GROUP BY CONVERT(BIGINT, t.nId_DocxCobrarOpe)
HAVING COUNT(DISTINCT CONVERT(INT, t.nId_Usuario)) > 1;

SELECT
    source_operation_id,
    distinct_advisors
FROM #OperationAdvisorConflicts
ORDER BY source_operation_id;

IF EXISTS (SELECT 1 FROM #OperationAdvisorConflicts)
    THROW 52004, 'La fuente contiene operaciones asociadas a múltiples asesores.', 1;


/* ============================================================
   3. Total esperado de promesas válidas según la fuente live
   ============================================================ */

DECLARE @expected_valid_promises INT;

;WITH SourcePromise AS
(
    SELECT
        CONVERT(BIGINT, g.nId_DocxCobrarOpe) AS source_operation_id,
        CONVERT(BIT, ISNULL(g.marca_promesa_valida, 0))
            AS source_valid_promise,
        CONVERT(DECIMAL(19,4), ISNULL(g.montoPromesa, 0))
            AS promise_amount,
        g.estado_pdp,
        ROW_NUMBER() OVER
        (
            PARTITION BY CONVERT(BIGINT, g.nId_DocxCobrarOpe)
            ORDER BY
                g.ultima_fecha_registro DESC,
                g.dDocCobOpe_FecIni DESC
        ) AS rn
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
      AND g.dDocCobOpe_FecIni < @end_exclusive
      AND g.nId_DocxCobrarOpe IS NOT NULL
      AND UPPER(ISNULL(g.estado_pdp, '')) NOT LIKE '%NO PDP%'
      AND UPPER(ISNULL(g.estado_pdp, '')) NOT LIKE '%PAGO SIN PROMESA%'
      AND
      (
          ISNULL(g.marca_promesa_valida, 0) = 1
          OR g.dFechCompromisoPago IS NOT NULL
          OR ISNULL(g.montoPromesa, 0) > 0
          OR NULLIF(LTRIM(RTRIM(g.estado_pdp)), '') IS NOT NULL
      )
)
SELECT @expected_valid_promises = COUNT(*)
FROM SourcePromise
WHERE rn = 1
  AND source_valid_promise = 1
  AND promise_amount > 0
  AND UPPER(ISNULL(estado_pdp, '')) NOT LIKE '%NO PDP%';

SELECT
    @expected_valid_promises AS expected_valid_promises_from_live_source;

IF @before_valid_promises <> @expected_valid_promises
    THROW 52009, 'Baseline desactualizada frente a la fuente live. Ejecutar LIVE -> ADVISOR y repetir la validación.', 1;


/* ============================================================
   4. Primera reejecución del live
   ============================================================ */

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month,
    @source_client_name = @source_client_name;

IF OBJECT_ID('tempdb..#AfterFirst') IS NOT NULL
    DROP TABLE #AfterFirst;

SELECT
    p.source_operation_id,
    p.advisor_key,
    p.portfolio_key,
    p.source_debtor_id,
    p.management_at,
    p.promise_due_date,
    p.promise_amount,
    p.paid_amount,
    p.last_payment_date,
    p.source_status,
    p.status_code,
    p.is_valid_promise,
    p.source_updated_at
INTO #AfterFirst
FROM analytics.fact_promise AS p
WHERE p.client_key = @client_key
  AND p.campaign_key = @campaign_key;

DECLARE @after_first_rows INT;
DECLARE @after_first_valid_promises INT;
DECLARE @after_first_valid_with_advisor INT;
DECLARE @after_first_valid_without_advisor INT;
DECLARE @lost_or_changed_advisors_after_first INT;

SELECT
    @after_first_rows = COUNT(*),
    @after_first_valid_promises =
        SUM(CASE WHEN is_valid_promise = 1 THEN 1 ELSE 0 END),
    @after_first_valid_with_advisor =
        SUM(
            CASE
                WHEN is_valid_promise = 1
                 AND advisor_key IS NOT NULL
                    THEN 1
                ELSE 0
            END
        ),
    @after_first_valid_without_advisor =
        SUM(
            CASE
                WHEN is_valid_promise = 1
                 AND advisor_key IS NULL
                    THEN 1
                ELSE 0
            END
        )
FROM #AfterFirst;

SELECT @lost_or_changed_advisors_after_first = COUNT(*)
FROM #Before AS b
LEFT JOIN #AfterFirst AS a
    ON a.source_operation_id = b.source_operation_id
WHERE b.advisor_key IS NOT NULL
  AND
  (
      a.source_operation_id IS NULL
      OR a.advisor_key IS NULL
      OR a.advisor_key <> b.advisor_key
  );

SELECT
    @after_first_rows AS after_first_promise_rows,
    @after_first_valid_promises AS after_first_valid_promises,
    @after_first_valid_with_advisor AS after_first_valid_with_advisor,
    @after_first_valid_without_advisor AS after_first_valid_without_advisor,
    @lost_or_changed_advisors_after_first
        AS lost_or_changed_advisors_after_first_live;

IF @lost_or_changed_advisors_after_first > 0
    THROW 52005, 'El live borró o cambió advisor_key de una promesa ya enriquecida.', 1;

IF @after_first_valid_promises <> @before_valid_promises
    THROW 52006, 'La reejecución live cambió inesperadamente el total de promesas válidas.', 1;

IF @after_first_valid_promises <> @expected_valid_promises
    THROW 52010, 'El total de promesas válidas no coincide con la fuente live.', 1;


/* ============================================================
   5. Segunda reejecución: idempotencia funcional
   ============================================================ */

EXEC etl.usp_load_claro_live_operations
    @crm_client_id = @crm_client_id,
    @as_of_at = @as_of_at,
    @campaign_year = @campaign_year,
    @campaign_month = @campaign_month,
    @source_client_name = @source_client_name;

IF OBJECT_ID('tempdb..#AfterSecond') IS NOT NULL
    DROP TABLE #AfterSecond;

SELECT
    p.source_operation_id,
    p.advisor_key,
    p.portfolio_key,
    p.source_debtor_id,
    p.management_at,
    p.promise_due_date,
    p.promise_amount,
    p.paid_amount,
    p.last_payment_date,
    p.source_status,
    p.status_code,
    p.is_valid_promise,
    p.source_updated_at
INTO #AfterSecond
FROM analytics.fact_promise AS p
WHERE p.client_key = @client_key
  AND p.campaign_key = @campaign_key;

DECLARE @after_second_valid_promises INT;
DECLARE @idempotence_differences INT;

SELECT @after_second_valid_promises =
    SUM(CASE WHEN is_valid_promise = 1 THEN 1 ELSE 0 END)
FROM #AfterSecond;

;WITH FirstMinusSecond AS
(
    SELECT
        source_operation_id,
        advisor_key,
        portfolio_key,
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
    FROM #AfterFirst

    EXCEPT

    SELECT
        source_operation_id,
        advisor_key,
        portfolio_key,
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
    FROM #AfterSecond
),
SecondMinusFirst AS
(
    SELECT
        source_operation_id,
        advisor_key,
        portfolio_key,
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
    FROM #AfterSecond

    EXCEPT

    SELECT
        source_operation_id,
        advisor_key,
        portfolio_key,
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
    FROM #AfterFirst
),
Differences AS
(
    SELECT * FROM FirstMinusSecond
    UNION ALL
    SELECT * FROM SecondMinusFirst
)
SELECT @idempotence_differences = COUNT(*)
FROM Differences;

SELECT
    @before_valid_promises AS before_valid_promises,
    @after_first_valid_promises AS after_first_valid_promises,
    @after_second_valid_promises AS after_second_valid_promises,
    @expected_valid_promises AS expected_valid_promises_from_live_source,
    @lost_or_changed_advisors_after_first
        AS lost_or_changed_advisors_after_first_live,
    @idempotence_differences AS idempotence_differences,
    CASE
        WHEN @lost_or_changed_advisors_after_first = 0
         AND @after_first_valid_promises = @expected_valid_promises
         AND @after_second_valid_promises = @after_first_valid_promises
         AND @idempotence_differences = 0
            THEN 'OK'
        ELSE 'REVISAR'
    END AS assessment;

IF @after_second_valid_promises <> @after_first_valid_promises
    THROW 52007, 'La segunda ejecución cambió el total de promesas válidas.', 1;

IF @idempotence_differences > 0
    THROW 52008, 'La segunda ejecución no fue idempotente para fact_promise.', 1;
