/*
Portfolio Control Center - ETAPA 6 / Avance 1
Soporte mínimo para ETL de snapshot CLARO
Motor: SQL Server

Ejecutar DENTRO de la base Analytics, después de:
  001_portfolio_v1_schema.sql
  002_portfolio_v1_contract_views.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* Evita duplicar una cartera del mismo cliente por source_portfolio_id. */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('analytics.dim_portfolio')
      AND name = 'UX_dim_portfolio_client_source_id'
)
BEGIN
    CREATE UNIQUE INDEX UX_dim_portfolio_client_source_id
        ON analytics.dim_portfolio(client_key, source_portfolio_id)
        WHERE source_portfolio_id IS NOT NULL;
END;
GO


/* ============================================================
   Calendario
   ============================================================ */

CREATE OR ALTER PROCEDURE etl.usp_ensure_date_range
    @date_from DATE,
    @date_to   DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @date_from IS NULL OR @date_to IS NULL OR @date_to < @date_from
        THROW 51000, 'Rango de fechas inválido.', 1;

    ;WITH Dates AS
    (
        SELECT @date_from AS calendar_date

        UNION ALL

        SELECT DATEADD(DAY, 1, calendar_date)
        FROM Dates
        WHERE calendar_date < @date_to
    ),
    Missing AS
    (
        SELECT d.calendar_date
        FROM Dates AS d
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM analytics.dim_date AS x
            WHERE x.calendar_date = d.calendar_date
        )
    )
    INSERT INTO analytics.dim_date
    (
        date_key,
        calendar_date,
        calendar_year,
        calendar_month,
        calendar_day,
        day_of_week_iso,
        is_business_day,
        is_holiday,
        holiday_name,
        business_day_of_month,
        business_days_in_month
    )
    SELECT
        CONVERT(INT, CONVERT(CHAR(8), m.calendar_date, 112)),
        m.calendar_date,
        YEAR(m.calendar_date),
        MONTH(m.calendar_date),
        DAY(m.calendar_date),

        /* 1900-01-01 fue lunes. Independiente de SET DATEFIRST. */
        ((DATEDIFF(DAY, CONVERT(DATE, '19000101', 112), m.calendar_date) % 7) + 1),

        CASE
            WHEN ((DATEDIFF(DAY, CONVERT(DATE, '19000101', 112), m.calendar_date) % 7) + 1)
                 BETWEEN 1 AND 5
                THEN 1
            ELSE 0
        END,

        0,
        NULL,
        NULL,
        NULL
    FROM Missing AS m
    OPTION (MAXRECURSION 32767);

    /*
      Recalcula ordinales de día hábil usando el estado actual de
      is_business_day/is_holiday.

      Este procedimiento no inventa feriados ni sobrescribe flags existentes.
      Los overrides oficiales se aplican por separado mediante
      analytics.ref_business_holiday / etl.usp_apply_peru_business_calendar
      (013_portfolio_v1_peru_business_calendar.sql).
    */
    ;WITH MonthStats AS
    (
        SELECT
            d.date_key,
            SUM(CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END)
                OVER
                (
                    PARTITION BY d.calendar_year, d.calendar_month
                ) AS business_days_in_month,

            SUM(CASE WHEN d.is_business_day = 1 THEN 1 ELSE 0 END)
                OVER
                (
                    PARTITION BY d.calendar_year, d.calendar_month
                    ORDER BY d.date_key
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS business_day_of_month
        FROM analytics.dim_date AS d
        WHERE d.calendar_date >= DATEFROMPARTS(YEAR(@date_from), MONTH(@date_from), 1)
          AND d.calendar_date < DATEADD
          (
              MONTH,
              1,
              DATEFROMPARTS(YEAR(@date_to), MONTH(@date_to), 1)
          )
    )
    UPDATE d
    SET
        d.business_days_in_month = s.business_days_in_month,
        d.business_day_of_month =
            CASE
                WHEN d.is_business_day = 1 THEN s.business_day_of_month
                ELSE NULL
            END
    FROM analytics.dim_date AS d
    INNER JOIN MonthStats AS s
        ON s.date_key = d.date_key;
END;
GO
