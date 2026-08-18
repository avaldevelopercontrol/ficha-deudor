/*
Portfolio Control Center - ETAPA 6 / revisión final
Diagnóstico de fuente CLARO EVOL antes de implementar su ETL
Motor: SQL Server 2017+

Ejecutar DENTRO de aval_analytics.

OBJETIVO
-------
Validar el grain físico y la conciliación de:

    aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL

antes de materializar la evolución histórica que consumirá:

    GET /portfolio/evolution

Este script es SOLO LECTURA. No crea ni modifica objetos persistentes.

IMPORTANTE SOBRE EL DIA
-----------------------
El modelo Power BI expone conceptualmente `DAY NUMBER`, pero la tabla física
SQL no necesariamente contiene una columna con ese nombre. Este diagnóstico:

1. inspecciona las columnas físicas;
2. identifica candidatos de día/fecha;
3. valida los candidatos contra la campaña solicitada;
4. elige una columna solo cuando existe una opción inequívoca;
5. construye el agregado diario mediante SQL dinámico para no compilar nombres
   de columna inexistentes.

No asumir todavía que EVOL puede escribirse en fact_portfolio_daily:
- fact_portfolio_daily distingue snapshots observados vs carry-forward live;
- EVOL contiene métricas históricas incrementales/acumulables;
- primero debemos confirmar su grain físico y la columna temporal real.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

DECLARE @campaign_year SMALLINT = 2026;
DECLARE @campaign_month TINYINT = 8;

DECLARE @source_campaign_code VARCHAR(15) =
    CONCAT('C-', RIGHT(CONCAT('0', @campaign_month), 2));

DECLARE @campaign_code VARCHAR(20) =
    CONCAT(@campaign_year, '-', RIGHT(CONCAT('0', @campaign_month), 2));

DECLARE @campaign_start DATE =
    DATEFROMPARTS(@campaign_year, @campaign_month, 1);

DECLARE @campaign_end DATE = EOMONTH(@campaign_start);

DECLARE @source_object SYSNAME =
    N'aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL';

DECLARE @source_object_id INT = OBJECT_ID(@source_object);

IF @source_object_id IS NULL
    THROW 51900, 'No existe la fuente CLARO EVOL esperada.', 1;


/* ============================================================
   1. METADATA FISICA
   ============================================================ */

PRINT '1. METADATA FISICA DE EVOL';

SELECT
    c.column_id,
    c.name AS column_name,
    t.name AS data_type,
    c.max_length,
    c.precision,
    c.scale,
    c.is_nullable
FROM aval_reporteria.sys.columns AS c
INNER JOIN aval_reporteria.sys.types AS t
    ON t.user_type_id = c.user_type_id
WHERE c.object_id = @source_object_id
ORDER BY c.column_id;


/* ============================================================
   2. CANDIDATOS DE GRAIN / FILTRO DE CARTERA

   Necesitamos saber si EVOL soporta subPortfolioId (portfolio_key / subcartera) en la futura API.
   ============================================================ */

PRINT '2. COLUMNAS CANDIDATAS DE CARTERA / GRAIN';

SELECT
    c.column_id,
    c.name AS candidate_column,
    t.name AS data_type
FROM aval_reporteria.sys.columns AS c
INNER JOIN aval_reporteria.sys.types AS t
    ON t.user_type_id = c.user_type_id
WHERE c.object_id = @source_object_id
  AND
  (
      UPPER(c.name) LIKE '%CARTERA%'
      OR UPPER(c.name) LIKE '%CAR%NOMBRE%'
      OR UPPER(c.name) IN
      (
          'NID_CARTERA',
          'ID_CARTERA',
          'CARTERA_ID',
          'ID_PBI'
      )
  )
ORDER BY c.column_id;


/* ============================================================
   3. DESCUBRIMIENTO DE COLUMNA TEMPORAL FISICA

   DAY NUMBER puede ser una columna derivada en Power Query/DAX. Para evitar
   otra suposición, evaluamos columnas físicas cuyo nombre o tipo sugiere día
   o fecha y medimos cuántas filas de la campaña producen un día válido.
   ============================================================ */

PRINT '3. CANDIDATOS DE DIA / FECHA';

IF OBJECT_ID('tempdb..#DayCandidates') IS NOT NULL
    DROP TABLE #DayCandidates;

CREATE TABLE #DayCandidates
(
    column_id INT NOT NULL,
    column_name SYSNAME NOT NULL,
    data_type SYSNAME NOT NULL,
    candidate_kind VARCHAR(10) NOT NULL,
    candidate_priority INT NOT NULL,
    valid_rows BIGINT NULL,
    source_rows BIGINT NULL,
    distinct_days INT NULL
);

;WITH PhysicalColumns AS
(
    SELECT
        c.column_id,
        c.name AS column_name,
        t.name AS data_type,
        UPPER(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(c.name, ' ', ''),
                        '_', ''
                    ),
                    '-', ''
                ),
                '.', ''
            )
        ) AS normalized_name
    FROM aval_reporteria.sys.columns AS c
    INNER JOIN aval_reporteria.sys.types AS t
        ON t.user_type_id = c.user_type_id
    WHERE c.object_id = @source_object_id
)
INSERT INTO #DayCandidates
(
    column_id,
    column_name,
    data_type,
    candidate_kind,
    candidate_priority
)
SELECT
    pc.column_id,
    pc.column_name,
    pc.data_type,
    CASE
        WHEN pc.data_type IN ('date', 'datetime', 'datetime2', 'smalldatetime')
            THEN 'DATE'
        ELSE 'DAY'
    END AS candidate_kind,
    CASE
        WHEN pc.normalized_name = 'DAYNUMBER' THEN 1
        WHEN pc.normalized_name IN
        (
            'DIA', 'DAY', 'NRODIA', 'NUMERODIA', 'DIANUMERO',
            'DIAAVAL', 'DIACAMPANA', 'DIACAMPANIA'
        ) THEN 2
        WHEN pc.normalized_name LIKE '%FECHA%'
          OR pc.normalized_name LIKE '%DATE%' THEN 3
        WHEN pc.data_type IN ('date', 'datetime', 'datetime2', 'smalldatetime')
            THEN 4
        ELSE 5
    END AS candidate_priority
FROM PhysicalColumns AS pc
WHERE
    pc.normalized_name = 'DAYNUMBER'
    OR pc.normalized_name IN
    (
        'DIA', 'DAY', 'NRODIA', 'NUMERODIA', 'DIANUMERO',
        'DIAAVAL', 'DIACAMPANA', 'DIACAMPANIA'
    )
    OR pc.normalized_name LIKE '%FECHA%'
    OR pc.normalized_name LIKE '%DATE%'
    OR pc.data_type IN ('date', 'datetime', 'datetime2', 'smalldatetime');

DECLARE
    @candidate_column SYSNAME,
    @candidate_kind VARCHAR(10),
    @candidate_sql NVARCHAR(MAX),
    @candidate_valid BIGINT,
    @candidate_source BIGINT,
    @candidate_distinct_days INT;

DECLARE day_candidate_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT
    column_name,
    candidate_kind
FROM #DayCandidates
ORDER BY candidate_priority, column_id;

OPEN day_candidate_cursor;

FETCH NEXT FROM day_candidate_cursor
INTO @candidate_column, @candidate_kind;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @candidate_valid = 0;
    SET @candidate_source = 0;
    SET @candidate_distinct_days = 0;

    IF @candidate_kind = 'DATE'
    BEGIN
        SET @candidate_sql = N'
            SELECT
                @source_rows_out = COUNT_BIG(*),
                @valid_rows_out = SUM
                (
                    CASE
                        WHEN TRY_CONVERT(DATE, s.' + QUOTENAME(@candidate_column) + N') >= @campaign_start
                         AND TRY_CONVERT(DATE, s.' + QUOTENAME(@candidate_column) + N') <= @campaign_end
                            THEN CONVERT(BIGINT, 1)
                        ELSE CONVERT(BIGINT, 0)
                    END
                ),
                @distinct_days_out = COUNT
                (
                    DISTINCT CASE
                        WHEN TRY_CONVERT(DATE, s.' + QUOTENAME(@candidate_column) + N') >= @campaign_start
                         AND TRY_CONVERT(DATE, s.' + QUOTENAME(@candidate_column) + N') <= @campaign_end
                            THEN DAY(TRY_CONVERT(DATE, s.' + QUOTENAME(@candidate_column) + N'))
                    END
                )
            FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
            WHERE s.AñoAval = @campaign_year
              AND s.CampAval = @source_campaign_code;';
    END
    ELSE
    BEGIN
        SET @candidate_sql = N'
            SELECT
                @source_rows_out = COUNT_BIG(*),
                @valid_rows_out = SUM
                (
                    CASE
                        WHEN TRY_CONVERT(INT, s.' + QUOTENAME(@candidate_column) + N')
                             BETWEEN 1 AND DAY(@campaign_end)
                            THEN CONVERT(BIGINT, 1)
                        ELSE CONVERT(BIGINT, 0)
                    END
                ),
                @distinct_days_out = COUNT
                (
                    DISTINCT CASE
                        WHEN TRY_CONVERT(INT, s.' + QUOTENAME(@candidate_column) + N')
                             BETWEEN 1 AND DAY(@campaign_end)
                            THEN TRY_CONVERT(INT, s.' + QUOTENAME(@candidate_column) + N')
                    END
                )
            FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
            WHERE s.AñoAval = @campaign_year
              AND s.CampAval = @source_campaign_code;';
    END;

    EXEC sys.sp_executesql
        @candidate_sql,
        N'@campaign_year SMALLINT,
          @source_campaign_code VARCHAR(15),
          @campaign_start DATE,
          @campaign_end DATE,
          @source_rows_out BIGINT OUTPUT,
          @valid_rows_out BIGINT OUTPUT,
          @distinct_days_out INT OUTPUT',
        @campaign_year = @campaign_year,
        @source_campaign_code = @source_campaign_code,
        @campaign_start = @campaign_start,
        @campaign_end = @campaign_end,
        @source_rows_out = @candidate_source OUTPUT,
        @valid_rows_out = @candidate_valid OUTPUT,
        @distinct_days_out = @candidate_distinct_days OUTPUT;

    UPDATE #DayCandidates
    SET
        source_rows = ISNULL(@candidate_source, 0),
        valid_rows = ISNULL(@candidate_valid, 0),
        distinct_days = ISNULL(@candidate_distinct_days, 0)
    WHERE column_name = @candidate_column;

    FETCH NEXT FROM day_candidate_cursor
    INTO @candidate_column, @candidate_kind;
END;

CLOSE day_candidate_cursor;
DEALLOCATE day_candidate_cursor;

SELECT
    column_id,
    column_name AS candidate_column,
    data_type,
    candidate_kind,
    candidate_priority,
    ISNULL(valid_rows, 0) AS valid_rows,
    ISNULL(source_rows, 0) AS source_rows,
    ISNULL(distinct_days, 0) AS distinct_days,
    CASE
        WHEN ISNULL(source_rows, 0) = 0 THEN NULL
        ELSE CONVERT(
            DECIMAL(19,6),
            CONVERT(DECIMAL(19,6), ISNULL(valid_rows, 0))
            / NULLIF(CONVERT(DECIMAL(19,6), source_rows), 0)
        )
    END AS valid_rate
FROM #DayCandidates
ORDER BY
    ISNULL(distinct_days, 0) DESC,
    ISNULL(valid_rows, 0) DESC,
    candidate_priority,
    column_id;

DECLARE @best_distinct_days INT =
(
    SELECT MAX(ISNULL(distinct_days, 0))
    FROM #DayCandidates
);

DECLARE @best_valid_rows BIGINT =
(
    SELECT MAX(ISNULL(valid_rows, 0))
    FROM #DayCandidates
    WHERE ISNULL(distinct_days, 0) = ISNULL(@best_distinct_days, 0)
);

DECLARE @best_priority INT =
(
    SELECT MIN(candidate_priority)
    FROM #DayCandidates
    WHERE ISNULL(distinct_days, 0) = ISNULL(@best_distinct_days, 0)
      AND ISNULL(valid_rows, 0) = ISNULL(@best_valid_rows, 0)
      AND ISNULL(distinct_days, 0) > 0
      AND ISNULL(valid_rows, 0) > 0
);

DECLARE @best_candidate_count INT =
(
    SELECT COUNT(*)
    FROM #DayCandidates
    WHERE ISNULL(distinct_days, 0) = ISNULL(@best_distinct_days, 0)
      AND ISNULL(valid_rows, 0) = ISNULL(@best_valid_rows, 0)
      AND candidate_priority = @best_priority
      AND ISNULL(distinct_days, 0) > 0
      AND ISNULL(valid_rows, 0) > 0
);

DECLARE @day_source_column SYSNAME = NULL;
DECLARE @day_source_kind VARCHAR(10) = NULL;

IF ISNULL(@best_candidate_count, 0) = 1
BEGIN
    SELECT
        @day_source_column = column_name,
        @day_source_kind = candidate_kind
    FROM #DayCandidates
    WHERE ISNULL(distinct_days, 0) = @best_distinct_days
      AND ISNULL(valid_rows, 0) = @best_valid_rows
      AND candidate_priority = @best_priority;
END;

SELECT
    @campaign_code AS campaign_code,
    @day_source_column AS selected_day_column,
    @day_source_kind AS selected_day_kind,
    ISNULL(@best_valid_rows, 0) AS selected_valid_rows,
    ISNULL(@best_distinct_days, 0) AS selected_distinct_days,
    ISNULL(@best_candidate_count, 0) AS equally_ranked_candidates,
    CASE
        WHEN NOT EXISTS (SELECT 1 FROM #DayCandidates)
            THEN 'NO_DAY_OR_DATE_CANDIDATES'
        WHEN ISNULL(@best_valid_rows, 0) = 0
            THEN 'NO_VALID_DAY_COLUMN'
        WHEN ISNULL(@best_candidate_count, 0) > 1
            THEN 'AMBIGUOUS_DAY_COLUMN'
        ELSE 'DAY_COLUMN_RESOLVED'
    END AS day_column_assessment;

IF @day_source_column IS NULL
BEGIN
    PRINT 'No se pudo resolver de forma inequívoca la columna temporal física.';
    PRINT 'Use los resultsets 1 y 3 para identificar el campo correcto antes de implementar EVOL.';
    RETURN;
END;


/* ============================================================
   4. COBERTURA DE CAMPAÑA USANDO LA COLUMNA TEMPORAL RESUELTA
   ============================================================ */

PRINT '4. COBERTURA DE CAMPAÑA';

DECLARE @day_expression NVARCHAR(500);

IF @day_source_kind = 'DATE'
    SET @day_expression =
        N'DAY(TRY_CONVERT(DATE, s.' + QUOTENAME(@day_source_column) + N'))';
ELSE
    SET @day_expression =
        N'TRY_CONVERT(INT, s.' + QUOTENAME(@day_source_column) + N')';

DECLARE @coverage_sql NVARCHAR(MAX) = N'
SELECT
    @campaign_code AS campaign_code,
    @source_campaign_code AS source_campaign_code,
    @day_source_column AS selected_day_column,
    @day_source_kind AS selected_day_kind,
    COUNT_BIG(*) AS source_rows,
    COUNT(DISTINCT ' + @day_expression + N') AS distinct_day_numbers,
    MIN(' + @day_expression + N') AS min_day_number,
    MAX(' + @day_expression + N') AS max_day_number,
    SUM
    (
        CASE
            WHEN ' + @day_expression + N' BETWEEN 1 AND DAY(@campaign_end)
                THEN 0
            ELSE 1
        END
    ) AS invalid_day_rows
FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
WHERE s.AñoAval = @campaign_year
  AND s.CampAval = @source_campaign_code;';

EXEC sys.sp_executesql
    @coverage_sql,
    N'@campaign_code VARCHAR(20),
      @source_campaign_code VARCHAR(15),
      @day_source_column SYSNAME,
      @day_source_kind VARCHAR(10),
      @campaign_year SMALLINT,
      @campaign_end DATE',
    @campaign_code = @campaign_code,
    @source_campaign_code = @source_campaign_code,
    @day_source_column = @day_source_column,
    @day_source_kind = @day_source_kind,
    @campaign_year = @campaign_year,
    @campaign_end = @campaign_end;


/* ============================================================
   5. AGREGADO DIARIO CAMPAÑA

   No presupone una fila física por día. Se agrega primero todo EVOL del día.
   ============================================================ */

PRINT '5. AGREGADO DIARIO EVOL';

IF OBJECT_ID('tempdb..#EvolutionDaily') IS NOT NULL
    DROP TABLE #EvolutionDaily;

CREATE TABLE #EvolutionDaily
(
    day_number INT NOT NULL,
    calendar_date DATE NOT NULL,
    source_rows_day BIGINT NOT NULL,
    assigned_clients_source BIGINT NOT NULL,
    new_managed_clients_day BIGINT NOT NULL,
    new_call_managed_clients_day BIGINT NOT NULL,
    payer_indicator_day BIGINT NOT NULL,
    recovered_amount_day DECIMAL(38,4) NOT NULL,
    new_promise_clients_day BIGINT NOT NULL,
    promise_amount_day DECIMAL(38,4) NOT NULL,
    new_direct_contact_clients_day BIGINT NOT NULL
);

DECLARE @daily_sql NVARCHAR(MAX) = N'
INSERT INTO #EvolutionDaily
(
    day_number,
    calendar_date,
    source_rows_day,
    assigned_clients_source,
    new_managed_clients_day,
    new_call_managed_clients_day,
    payer_indicator_day,
    recovered_amount_day,
    new_promise_clients_day,
    promise_amount_day,
    new_direct_contact_clients_day
)
SELECT
    ' + @day_expression + N' AS day_number,
    DATEADD(DAY, ' + @day_expression + N' - 1, @campaign_start) AS calendar_date,
    COUNT_BIG(*) AS source_rows_day,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.TOTAL_CLIENTES), 0)) AS assigned_clients_source,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.CLIENTE_GESTIONADO_NVO), 0)) AS new_managed_clients_day,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.CLIENTE_GESTIONADO_CALL_NVO), 0)) AS new_call_managed_clients_day,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.CLIENTES_CON_PAGOS), 0)) AS payer_indicator_day,
    SUM(ISNULL(TRY_CONVERT(DECIMAL(19,4), s.MONTO_DE_PAGOS), 0)) AS recovered_amount_day,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.CLIENTE_CON_PROMESA_NVO), 0)) AS new_promise_clients_day,
    SUM(ISNULL(TRY_CONVERT(DECIMAL(19,4), s.MONTO_EN_PROMESAS), 0)) AS promise_amount_day,
    SUM(ISNULL(TRY_CONVERT(BIGINT, s.CLIENTE_CON_CONTACTO_DIRECTO_NVO), 0)) AS new_direct_contact_clients_day
FROM aval_reporteria.dbo.PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_EVOL AS s
WHERE s.AñoAval = @campaign_year
  AND s.CampAval = @source_campaign_code
  AND ' + @day_expression + N' BETWEEN 1 AND DAY(@campaign_end)
GROUP BY ' + @day_expression + N';';

EXEC sys.sp_executesql
    @daily_sql,
    N'@campaign_year SMALLINT,
      @source_campaign_code VARCHAR(15),
      @campaign_start DATE,
      @campaign_end DATE',
    @campaign_year = @campaign_year,
    @source_campaign_code = @source_campaign_code,
    @campaign_start = @campaign_start,
    @campaign_end = @campaign_end;

SELECT
    day_number,
    calendar_date,
    source_rows_day,
    assigned_clients_source,
    new_managed_clients_day,
    SUM(new_managed_clients_day) OVER
    (
        ORDER BY day_number
        ROWS UNBOUNDED PRECEDING
    ) AS managed_clients_cumulative,
    new_direct_contact_clients_day,
    SUM(new_direct_contact_clients_day) OVER
    (
        ORDER BY day_number
        ROWS UNBOUNDED PRECEDING
    ) AS direct_contact_clients_cumulative,
    recovered_amount_day,
    SUM(recovered_amount_day) OVER
    (
        ORDER BY day_number
        ROWS UNBOUNDED PRECEDING
    ) AS recovered_amount_cumulative,
    payer_indicator_day,
    new_promise_clients_day,
    promise_amount_day
FROM #EvolutionDaily
ORDER BY day_number;


/* ============================================================
   6. SEÑALES DE GRAIN
   ============================================================ */

PRINT '6. SEÑALES DE GRAIN';

SELECT
    COUNT(*) AS evolution_days,
    SUM(CASE WHEN source_rows_day > 1 THEN 1 ELSE 0 END)
        AS days_with_multiple_source_rows,
    MAX(source_rows_day) AS max_source_rows_per_day,
    MIN(calendar_date) AS first_evolution_date,
    MAX(calendar_date) AS last_evolution_date
FROM #EvolutionDaily;


/* ============================================================
   7. CONCILIACION DEL ULTIMO DIA EVOL VS ANALYTICS
   ============================================================ */

PRINT '7. CONCILIACION ULTIMO DIA EVOL VS ANALYTICS';

DECLARE @last_evolution_date DATE =
(
    SELECT MAX(calendar_date)
    FROM #EvolutionDaily
);

IF @last_evolution_date IS NULL
BEGIN
    SELECT
        @campaign_code AS campaign_code,
        @day_source_column AS selected_day_column,
        'NO_SOURCE_ROWS' AS reconciliation_assessment;
    RETURN;
END;

DECLARE @last_evolution_day INT = DAY(@last_evolution_date);
DECLARE @last_date_key INT =
    CONVERT(INT, CONVERT(CHAR(8), @last_evolution_date, 112));

DECLARE @client_key INT =
(
    SELECT TOP (1) c.client_key
    FROM analytics.dim_client AS c
    WHERE c.is_active = 1
      AND EXISTS
      (
          SELECT 1
          FROM analytics.dim_campaign AS dc
          WHERE dc.client_key = c.client_key
            AND dc.campaign_code = @campaign_code
      )
    ORDER BY c.client_key
);

DECLARE @campaign_key INT =
(
    SELECT dc.campaign_key
    FROM analytics.dim_campaign AS dc
    WHERE dc.client_key = @client_key
      AND dc.campaign_code = @campaign_code
);

;WITH EvolAccumulated AS
(
    SELECT
        MAX(CASE WHEN day_number = @last_evolution_day
                 THEN assigned_clients_source END)
            AS evol_assigned_clients,
        SUM(new_managed_clients_day)
            AS evol_managed_clients,
        SUM(new_direct_contact_clients_day)
            AS evol_direct_contact_clients,
        SUM(recovered_amount_day)
            AS evol_recovered_amount
    FROM #EvolutionDaily
    WHERE day_number <= @last_evolution_day
),
SnapshotAnalytics AS
(
    SELECT
        COUNT(*) AS snapshot_portfolio_rows,
        SUM(f.assigned_clients_snapshot) AS analytics_assigned_clients,
        SUM(f.managed_clients_snapshot) AS analytics_managed_clients,
        SUM(f.direct_contact_snapshot) AS analytics_direct_contact_clients
    FROM analytics.fact_portfolio_daily AS f
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND f.date_key = @last_date_key
      AND f.has_source_snapshot = 1
),
LiveAnalytics AS
(
    SELECT
        SUM(f.recovered_amount_day) AS analytics_recovered_amount
    FROM analytics.fact_portfolio_daily AS f
    INNER JOIN analytics.dim_date AS d
        ON d.date_key = f.date_key
    WHERE f.client_key = @client_key
      AND f.campaign_key = @campaign_key
      AND d.calendar_date >= @campaign_start
      AND d.calendar_date <= @last_evolution_date
)
SELECT
    @campaign_code AS campaign_code,
    @day_source_column AS selected_day_column,
    @day_source_kind AS selected_day_kind,
    @last_evolution_date AS last_evolution_date,
    sa.snapshot_portfolio_rows,

    e.evol_assigned_clients,
    sa.analytics_assigned_clients,
    e.evol_assigned_clients - sa.analytics_assigned_clients
        AS assigned_difference,

    e.evol_managed_clients,
    sa.analytics_managed_clients,
    e.evol_managed_clients - sa.analytics_managed_clients
        AS managed_difference,

    e.evol_direct_contact_clients,
    sa.analytics_direct_contact_clients,
    e.evol_direct_contact_clients - sa.analytics_direct_contact_clients
        AS direct_contact_difference,

    e.evol_recovered_amount,
    la.analytics_recovered_amount,
    e.evol_recovered_amount - la.analytics_recovered_amount
        AS recovered_difference
FROM EvolAccumulated AS e
CROSS JOIN SnapshotAnalytics AS sa
CROSS JOIN LiveAnalytics AS la;


/* ============================================================
   8. RESUMEN PARA DECIDIR EL ETL
   ============================================================ */

PRINT '8. RESUMEN DIAGNOSTICO';

SELECT
    @campaign_code AS campaign_code,
    @day_source_column AS selected_day_column,
    @day_source_kind AS selected_day_kind,
    COUNT(*) AS evolution_days,
    SUM(CASE WHEN source_rows_day > 1 THEN 1 ELSE 0 END)
        AS days_with_multiple_source_rows,
    MAX(source_rows_day) AS max_source_rows_per_day,
    MIN(calendar_date) AS first_evolution_date,
    MAX(calendar_date) AS last_evolution_date,
    CASE
        WHEN COUNT(*) = 0 THEN 'NO_SOURCE_ROWS'
        WHEN SUM(CASE WHEN source_rows_day > 1 THEN 1 ELSE 0 END) > 0
            THEN 'REVIEW_GRAIN_COLUMNS'
        ELSE 'ONE_ROW_PER_DAY_CANDIDATE'
    END AS grain_assessment
FROM #EvolutionDaily;
