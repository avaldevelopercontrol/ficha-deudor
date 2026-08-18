/*
Validación - ETAPA 6 / Calendario hábil Perú 2026

Prueba:
- 16 feriados nacionales 2026 cargados;
- dim_date refleja exactamente esos feriados;
- 2026-08-06 se excluye como día hábil;
- agosto 2026 tiene 20 días hábiles y al 13/08 han transcurrido 8;
- v_campaign_target_progress usa el calendario corregido;
- reaplicar el calendario es idempotente.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

DECLARE @campaign_code VARCHAR(7) = '2026-08';
DECLARE @month_from DATE = '2026-08-01';
DECLARE @month_to DATE = '2026-08-31';
DECLARE @reference_cut DATE = '2026-08-13';

IF OBJECT_ID('tempdb..#BeforeCalendar') IS NOT NULL
    DROP TABLE #BeforeCalendar;

SELECT
    d.date_key,
    d.is_business_day,
    d.is_holiday,
    d.holiday_name,
    d.business_day_of_month,
    d.business_days_in_month
INTO #BeforeCalendar
FROM analytics.dim_date AS d
WHERE d.calendar_date BETWEEN '2026-01-01' AND '2026-12-31';

DECLARE @holiday_rows INT =
(
    SELECT COUNT(*)
    FROM analytics.ref_business_holiday AS h
    WHERE h.country_code = 'PE'
      AND h.holiday_scope = 'NATIONAL'
      AND h.holiday_date BETWEEN '2026-01-01' AND '2026-12-31'
);

DECLARE @holiday_dim_mismatches INT =
(
    SELECT COUNT(*)
    FROM analytics.ref_business_holiday AS h
    LEFT JOIN analytics.dim_date AS d
        ON d.calendar_date = h.holiday_date
    WHERE h.country_code = 'PE'
      AND h.holiday_scope = 'NATIONAL'
      AND h.holiday_date BETWEEN '2026-01-01' AND '2026-12-31'
      AND
      (
          d.date_key IS NULL
          OR d.is_holiday <> 1
          OR d.is_business_day <> 0
          OR ISNULL(d.holiday_name, '') <> h.holiday_name
      )
);

DECLARE @calendar_rule_mismatches INT =
(
    SELECT COUNT(*)
    FROM analytics.dim_date AS d
    LEFT JOIN analytics.ref_business_holiday AS h
        ON h.holiday_date = d.calendar_date
       AND h.country_code = 'PE'
       AND h.holiday_scope = 'NATIONAL'
    WHERE d.calendar_date BETWEEN '2026-01-01' AND '2026-12-31'
      AND d.is_business_day <>
          CASE
              WHEN d.day_of_week_iso BETWEEN 1 AND 5
               AND h.holiday_date IS NULL
                  THEN 1
              ELSE 0
          END
);

DECLARE @august_business_days INT =
(
    SELECT COUNT(*)
    FROM analytics.dim_date AS d
    WHERE d.calendar_date BETWEEN @month_from AND @month_to
      AND d.is_business_day = 1
);

DECLARE @elapsed_business_days_to_reference INT =
(
    SELECT COUNT(*)
    FROM analytics.dim_date AS d
    WHERE d.calendar_date BETWEEN @month_from AND @reference_cut
      AND d.is_business_day = 1
);

DECLARE @august_6_is_holiday BIT =
(
    SELECT d.is_holiday
    FROM analytics.dim_date AS d
    WHERE d.calendar_date = '2026-08-06'
);

DECLARE @august_6_is_business_day BIT =
(
    SELECT d.is_business_day
    FROM analytics.dim_date AS d
    WHERE d.calendar_date = '2026-08-06'
);

SELECT
    @holiday_rows AS holiday_rows_2026,
    @holiday_dim_mismatches AS holiday_dim_mismatches,
    @calendar_rule_mismatches AS calendar_rule_mismatches,
    @august_business_days AS august_business_days,
    @elapsed_business_days_to_reference AS elapsed_business_days_to_2026_08_13,
    @august_6_is_holiday AS august_6_is_holiday,
    @august_6_is_business_day AS august_6_is_business_day;

IF @holiday_rows <> 16
    THROW 52310, 'La referencia 2026 no contiene exactamente 16 feriados nacionales.', 1;

IF @holiday_dim_mismatches <> 0
    THROW 52311, 'dim_date no refleja exactamente los feriados nacionales de referencia.', 1;

IF @calendar_rule_mismatches <> 0
    THROW 52312, 'Existen días con is_business_day inconsistente con fin de semana/feriado.', 1;

IF @august_business_days <> 20
    THROW 52313, 'Agosto 2026 debe contener 20 días hábiles al excluir el 06/08.', 1;

IF @elapsed_business_days_to_reference <> 8
    THROW 52314, 'Al 13/08/2026 deben haber transcurrido 8 días hábiles.', 1;

IF ISNULL(@august_6_is_holiday, 0) <> 1 OR ISNULL(@august_6_is_business_day, 1) <> 0
    THROW 52315, 'El 06/08/2026 debe estar marcado como feriado no hábil.', 1;

/* ------------------------------------------------------------
   Contrato de curva: compara view contra dim_date, no contra una
   fórmula duplicada de lunes-viernes.
   ------------------------------------------------------------ */

DECLARE @curve_rows INT = 0;
DECLARE @curve_calendar_differences INT = 0;

;WITH CampaignTarget AS
(
    SELECT c.campaign_key
    FROM analytics.dim_campaign AS c
    WHERE c.campaign_code = @campaign_code
),
ExpectedCalendar AS
(
    SELECT
        d.date_key,
        SUM(CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END)
            OVER
            (
                PARTITION BY d.calendar_year, d.calendar_month
                ORDER BY d.date_key
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS elapsed_business_days,
        SUM(CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END)
            OVER
            (
                PARTITION BY d.calendar_year, d.calendar_month
            ) AS total_business_days
    FROM analytics.dim_date AS d
    WHERE d.calendar_year = 2026
      AND d.calendar_month = 8
)
SELECT
    @curve_rows = COUNT(*),
    @curve_calendar_differences = SUM
    (
        CASE
            WHEN v.elapsed_business_days <> e.elapsed_business_days
              OR v.total_business_days <> e.total_business_days
              OR ABS
                 (
                     ISNULL(v.expected_recovered_to_date, 0)
                     - ISNULL
                       (
                           CAST
                           (
                               v.target_recovered_amount
                               * e.elapsed_business_days
                               / NULLIF(e.total_business_days, 0)
                               AS DECIMAL(19,4)
                           ),
                           0
                       )
                 ) > 0.0001
                THEN 1
            ELSE 0
        END
    )
FROM analytics.v_campaign_target_progress AS v
INNER JOIN CampaignTarget AS c
    ON c.campaign_key = v.campaign_key
INNER JOIN ExpectedCalendar AS e
    ON e.date_key = v.date_key;

SET @curve_calendar_differences = ISNULL(@curve_calendar_differences, 0);

SELECT TOP (1)
    v.calendar_date,
    v.target_recovered_amount,
    v.recovered_amount_to_date,
    v.elapsed_business_days,
    v.total_business_days,
    v.expected_recovered_to_date,
    v.target_achievement_rate,
    v.pace_achievement_rate,
    v.gap_amount,
    v.gap_rate
FROM analytics.v_campaign_target_progress AS v
INNER JOIN analytics.dim_campaign AS c
    ON c.campaign_key = v.campaign_key
WHERE c.campaign_code = @campaign_code
ORDER BY v.calendar_date DESC;

IF @curve_rows = 0
    THROW 52316, 'v_campaign_target_progress no devolvió filas para 2026-08.', 1;

IF @curve_calendar_differences <> 0
    THROW 52317, 'La curva esperada no coincide con el calendario hábil de dim_date.', 1;

/* ------------------------------------------------------------
   Idempotencia
   ------------------------------------------------------------ */

EXEC etl.usp_apply_peru_business_calendar
    @date_from = '2026-01-01',
    @date_to = '2026-12-31';

DECLARE @idempotence_differences INT =
(
    SELECT COUNT(*)
    FROM #BeforeCalendar AS b
    FULL OUTER JOIN
    (
        SELECT
            d.date_key,
            d.is_business_day,
            d.is_holiday,
            d.holiday_name,
            d.business_day_of_month,
            d.business_days_in_month
        FROM analytics.dim_date AS d
        WHERE d.calendar_date BETWEEN '2026-01-01' AND '2026-12-31'
    ) AS a
        ON a.date_key = b.date_key
    WHERE b.date_key IS NULL
       OR a.date_key IS NULL
       OR b.is_business_day <> a.is_business_day
       OR b.is_holiday <> a.is_holiday
       OR ISNULL(b.holiday_name, '') <> ISNULL(a.holiday_name, '')
       OR ISNULL(b.business_day_of_month, 0) <> ISNULL(a.business_day_of_month, 0)
       OR ISNULL(b.business_days_in_month, 0) <> ISNULL(a.business_days_in_month, 0)
);

SELECT
    @holiday_rows AS holiday_rows_2026,
    @holiday_dim_mismatches AS holiday_dim_mismatches,
    @calendar_rule_mismatches AS calendar_rule_mismatches,
    @august_business_days AS august_business_days,
    @elapsed_business_days_to_reference AS elapsed_business_days_to_2026_08_13,
    @curve_rows AS curve_rows,
    @curve_calendar_differences AS curve_calendar_differences,
    @idempotence_differences AS idempotence_differences,
    CASE
        WHEN @holiday_rows = 16
         AND @holiday_dim_mismatches = 0
         AND @calendar_rule_mismatches = 0
         AND @august_business_days = 20
         AND @elapsed_business_days_to_reference = 8
         AND @curve_rows > 0
         AND @curve_calendar_differences = 0
         AND @idempotence_differences = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END AS assessment;
GO
