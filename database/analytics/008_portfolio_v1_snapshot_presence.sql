/*
Portfolio Control Center - ETAPA 6
Soporte explícito para distinguir snapshot real vs fila creada por flows.

PRERREQUISITO:
    001_portfolio_v1_schema.sql

SEMÁNTICA:
- has_source_snapshot = 1:
    existe un snapshot de fuente observado para el mismo date_key.
- has_source_snapshot = 0:
    la fila existe por operación live; los campos *_snapshot pueden ser
    carry-forward del último corte conocido o 0 si aún no existía uno.

Este script es idempotente y también reconstruye la marca para filas
históricas creadas antes de introducir la columna.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


IF COL_LENGTH('analytics.fact_portfolio_daily', 'has_source_snapshot') IS NULL
BEGIN
    ALTER TABLE analytics.fact_portfolio_daily
    ADD has_source_snapshot BIT NOT NULL
        CONSTRAINT DF_fact_portfolio_daily_has_source_snapshot
        DEFAULT (0) WITH VALUES;
END;
GO


/*
Backfill determinístico del histórico actual.

El ETL snapshot guarda source_as_of_at = @snapshot_date.
El ETL live que hereda T-1 conserva el source_as_of_at del corte anterior.
Por tanto, una fila representa un snapshot real de su propio date_key solo
cuando ambas fechas coinciden.
*/
UPDATE f
SET
    f.has_source_snapshot =
        CASE
            WHEN f.source_as_of_at IS NOT NULL
             AND f.date_key = CONVERT(
                    INT,
                    CONVERT(
                        CHAR(8),
                        CONVERT(DATE, f.source_as_of_at),
                        112
                    )
                 )
                THEN 1
            ELSE 0
        END
FROM analytics.fact_portfolio_daily AS f
WHERE f.has_source_snapshot <>
      CASE
          WHEN f.source_as_of_at IS NOT NULL
           AND f.date_key = CONVERT(
                  INT,
                  CONVERT(
                      CHAR(8),
                      CONVERT(DATE, f.source_as_of_at),
                      112
                  )
               )
              THEN 1
          ELSE 0
      END;
GO


SELECT
    COUNT_BIG(*) AS portfolio_daily_rows,
    SUM(CASE WHEN has_source_snapshot = 1 THEN 1 ELSE 0 END)
        AS source_snapshot_rows,
    SUM(CASE WHEN has_source_snapshot = 0 THEN 1 ELSE 0 END)
        AS flow_or_carried_rows
FROM analytics.fact_portfolio_daily;
GO
