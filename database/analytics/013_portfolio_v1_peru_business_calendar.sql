/*
Portfolio Control Center - ETAPA 6 / Calendario hábil Perú V1
Motor: SQL Server

Objetivo:
- materializar feriados nacionales oficiales del Perú para 2026;
- aplicar la semántica de día hábil a analytics.dim_date;
- mantener la curva esperada fuera de React;
- excluir días no laborables compensables exclusivos del sector público.

Fuente de referencia validada al 2026-08-14:
https://www.gob.pe/feriados

La relación completa 2026 también fue contrastada con publicaciones vigentes
oficiales de El Peruano / Andina. Este seed contiene los 16 feriados nacionales
aplicables a sector público y privado durante 2026.

Ejecutar después de:
  001_portfolio_v1_schema.sql
  003_portfolio_v1_etl_support.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID('analytics.ref_business_holiday', 'U') IS NULL
BEGIN
    CREATE TABLE analytics.ref_business_holiday
    (
        holiday_date        DATE NOT NULL
            CONSTRAINT PK_ref_business_holiday PRIMARY KEY,
        holiday_name        VARCHAR(150) NOT NULL,
        country_code        CHAR(2) NOT NULL,
        holiday_scope       VARCHAR(20) NOT NULL,
        source_code         VARCHAR(100) NOT NULL,
        source_reference    VARCHAR(300) NULL,
        source_as_of_at     DATETIME2(3) NOT NULL,
        loaded_at           DATETIME2(3) NOT NULL
            CONSTRAINT DF_ref_business_holiday_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT CK_ref_business_holiday_country
            CHECK (country_code = 'PE'),
        CONSTRAINT CK_ref_business_holiday_scope
            CHECK (holiday_scope IN ('NATIONAL'))
    );
END;
GO

DECLARE @source_code VARCHAR(100) = 'GOB_PE_FERIADOS';
DECLARE @source_reference VARCHAR(300) = 'https://www.gob.pe/feriados';
DECLARE @source_as_of_at DATETIME2(3) = CONVERT(DATETIME2(3), '2026-08-14T00:00:00', 126);

DECLARE @Holidays TABLE
(
    holiday_date DATE NOT NULL PRIMARY KEY,
    holiday_name VARCHAR(150) NOT NULL
);

INSERT INTO @Holidays(holiday_date, holiday_name)
VALUES
    ('2026-01-01', 'Año Nuevo'),
    ('2026-04-02', 'Jueves Santo'),
    ('2026-04-03', 'Viernes Santo'),
    ('2026-05-01', 'Día del Trabajo'),
    ('2026-06-07', 'Batalla de Arica y Día de la Bandera'),
    ('2026-06-29', 'San Pedro y San Pablo'),
    ('2026-07-23', 'Día de la Fuerza Aérea del Perú'),
    ('2026-07-28', 'Fiestas Patrias'),
    ('2026-07-29', 'Fiestas Patrias'),
    ('2026-08-06', 'Batalla de Junín'),
    ('2026-08-30', 'Santa Rosa de Lima'),
    ('2026-10-08', 'Combate de Angamos'),
    ('2026-11-01', 'Día de Todos los Santos'),
    ('2026-12-08', 'Inmaculada Concepción'),
    ('2026-12-09', 'Batalla de Ayacucho'),
    ('2026-12-25', 'Navidad');

MERGE analytics.ref_business_holiday AS tgt
USING
(
    SELECT
        h.holiday_date,
        h.holiday_name,
        CONVERT(CHAR(2), 'PE') AS country_code,
        CONVERT(VARCHAR(20), 'NATIONAL') AS holiday_scope,
        @source_code AS source_code,
        @source_reference AS source_reference,
        @source_as_of_at AS source_as_of_at
    FROM @Holidays AS h
) AS src
    ON src.holiday_date = tgt.holiday_date
WHEN MATCHED THEN
    UPDATE SET
        tgt.holiday_name = src.holiday_name,
        tgt.country_code = src.country_code,
        tgt.holiday_scope = src.holiday_scope,
        tgt.source_code = src.source_code,
        tgt.source_reference = src.source_reference,
        tgt.source_as_of_at = src.source_as_of_at,
        tgt.loaded_at = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN
    INSERT
    (
        holiday_date,
        holiday_name,
        country_code,
        holiday_scope,
        source_code,
        source_reference,
        source_as_of_at
    )
    VALUES
    (
        src.holiday_date,
        src.holiday_name,
        src.country_code,
        src.holiday_scope,
        src.source_code,
        src.source_reference,
        src.source_as_of_at
    )
WHEN NOT MATCHED BY SOURCE
     AND tgt.country_code = 'PE'
     AND tgt.holiday_scope = 'NATIONAL'
     AND tgt.source_code = @source_code
     AND tgt.holiday_date >= '2026-01-01'
     AND tgt.holiday_date <= '2026-12-31'
THEN DELETE;
GO

CREATE OR ALTER PROCEDURE etl.usp_apply_peru_business_calendar
    @date_from DATE,
    @date_to   DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @date_from IS NULL OR @date_to IS NULL OR @date_to < @date_from
        THROW 52300, 'Rango de calendario inválido.', 1;

    DECLARE @month_from DATE = DATEFROMPARTS(YEAR(@date_from), MONTH(@date_from), 1);
    DECLARE @month_to DATE = EOMONTH(@date_to);

    EXEC etl.usp_ensure_date_range
        @date_from = @month_from,
        @date_to = @month_to;

    /*
      V1 usa el calendario laboral nacional del Perú:
      - lunes-viernes son hábiles por defecto;
      - sábado/domingo son no hábiles;
      - feriados nacionales son no hábiles incluso si caen lunes-viernes.

      No se incorporan días no laborables compensables exclusivos del sector
      público, porque no equivalen a feriados nacionales obligatorios para el
      sector privado.
    */
    UPDATE d
    SET
        d.is_holiday = 0,
        d.holiday_name = NULL,
        d.is_business_day =
            CASE
                WHEN d.day_of_week_iso BETWEEN 1 AND 5 THEN 1
                ELSE 0
            END
    FROM analytics.dim_date AS d
    WHERE d.calendar_date BETWEEN @month_from AND @month_to;

    UPDATE d
    SET
        d.is_holiday = 1,
        d.holiday_name = h.holiday_name,
        d.is_business_day = 0
    FROM analytics.dim_date AS d
    INNER JOIN analytics.ref_business_holiday AS h
        ON h.holiday_date = d.calendar_date
       AND h.country_code = 'PE'
       AND h.holiday_scope = 'NATIONAL'
    WHERE d.calendar_date BETWEEN @month_from AND @month_to;

    /* Recalcula business_day_of_month/business_days_in_month. */
    EXEC etl.usp_ensure_date_range
        @date_from = @month_from,
        @date_to = @month_to;
END;
GO

/*
  Seed V1: deja 2026 listo inmediatamente para campañas Analytics actuales.
  Años posteriores deben cargarse desde una fuente oficial antes de exponer
  expected curve para ese año.
*/
EXEC etl.usp_apply_peru_business_calendar
    @date_from = '2026-01-01',
    @date_to = '2026-12-31';
GO

SELECT
    YEAR(holiday_date) AS calendar_year,
    COUNT(*) AS national_holidays,
    MIN(source_as_of_at) AS source_as_of_at,
    CASE
        WHEN YEAR(MIN(holiday_date)) = 2026
         AND YEAR(MAX(holiday_date)) = 2026
         AND COUNT(*) = 16
            THEN 'PERU_BUSINESS_CALENDAR_2026_OK'
        ELSE 'REVIEW'
    END AS assessment
FROM analytics.ref_business_holiday
WHERE country_code = 'PE'
  AND holiday_scope = 'NATIONAL'
  AND holiday_date BETWEEN '2026-01-01' AND '2026-12-31'
GROUP BY YEAR(holiday_date);
GO
