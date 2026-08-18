/*
Portfolio Control Center - ETAPA 6 / Avance 4
Validación de meta mensual CLARO y curva esperada.

PRERREQUISITOS:
1. Ejecutar 011_portfolio_v1_claro_target_support.sql.
2. Generar y ejecutar el SQL producido por:
   scripts/analytics/export_claro_goals_snapshot_sql.py
3. Tener snapshot/live de la campaña cargados.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @crm_client_id INT = 95;
DECLARE @campaign_code VARCHAR(7) = '2026-08';
DECLARE @source_code VARCHAR(50) = 'CLARO_BASE_GOALS';

DECLARE @client_key INT;
DECLARE @campaign_key INT;
DECLARE @stage_target DECIMAL(19,4);
DECLARE @stage_source_as_of_at DATETIME2(3);
DECLARE @stage_source_rows INT;
DECLARE @stage_rows INT;
DECLARE @fact_rows INT;
DECLARE @fact_target DECIMAL(19,4);
DECLARE @fact_source_as_of_at DATETIME2(3);
DECLARE @watermark_source_as_of_at DATETIME2(3);
DECLARE @curve_rows INT;
DECLARE @curve_formula_differences INT;
DECLARE @idempotence_differences INT = 0;

SELECT @client_key = client_key
FROM analytics.dim_client
WHERE crm_client_id = @crm_client_id;

IF @client_key IS NULL
    THROW 52200, 'No existe el cliente Analytics solicitado.', 1;

SELECT @campaign_key = campaign_key
FROM analytics.dim_campaign
WHERE client_key = @client_key
  AND campaign_code = @campaign_code;

IF @campaign_key IS NULL
    THROW 52201, 'No existe la campaña Analytics solicitada.', 1;

SELECT
    @stage_rows = COUNT(*),
    @stage_target = MAX(target_recovered_amount),
    @stage_source_as_of_at = MAX(source_as_of_at),
    @stage_source_rows = MAX(source_rows)
FROM staging.claro_goal_monthly
WHERE source_code = @source_code
  AND campaign_code = @campaign_code;

IF ISNULL(@stage_rows, 0) <> 1
    THROW 52202, 'Staging debe contener exactamente una meta para la campaña.', 1;

SELECT
    @fact_rows = COUNT(*),
    @fact_target = MAX(target_recovered_amount),
    @fact_source_as_of_at = MAX(source_as_of_at)
FROM analytics.fact_target_monthly
WHERE client_key = @client_key
  AND campaign_key = @campaign_key
  AND portfolio_key IS NULL;

SELECT
    @watermark_source_as_of_at = last_source_datetime
FROM etl.watermark
WHERE source_code = 'CLARO_TARGET_MONTHLY';

SELECT
    @stage_rows AS stage_rows,
    @stage_target AS stage_target_recovered_amount,
    @fact_rows AS fact_rows,
    @fact_target AS fact_target_recovered_amount,
    @stage_source_as_of_at AS stage_source_as_of_at,
    @fact_source_as_of_at AS fact_source_as_of_at,
    @watermark_source_as_of_at AS watermark_source_as_of_at;

IF @fact_rows <> 1
    THROW 52203, 'Debe existir exactamente una meta campaña-level.', 1;

IF @fact_target <> @stage_target
    THROW 52204, 'La meta de Analytics no coincide con staging.', 1;

IF @fact_source_as_of_at <> @stage_source_as_of_at
    THROW 52205, 'source_as_of_at de fact_target_monthly no coincide con staging.', 1;

IF @watermark_source_as_of_at <> @stage_source_as_of_at
    THROW 52206, 'Watermark de metas no coincide con staging.', 1;

IF EXISTS
(
    SELECT 1
    FROM analytics.fact_target_monthly
    WHERE client_key = @client_key
      AND campaign_key = @campaign_key
      AND portfolio_key IS NOT NULL
)
    THROW 52207, 'V1 no espera metas por cartera para esta carga CLARO.', 1;

/* ------------------------------------------------------------
   Curva esperada: validar cada fila materializada por la view.
   ------------------------------------------------------------ */

SELECT @curve_rows = COUNT(*)
FROM analytics.v_campaign_target_progress
WHERE client_key = @client_key
  AND campaign_key = @campaign_key;

IF ISNULL(@curve_rows, 0) = 0
    THROW 52208, 'v_campaign_target_progress no devolvió filas para la campaña.', 1;

SELECT
    @curve_formula_differences = COUNT(*)
FROM analytics.v_campaign_target_progress AS v
WHERE v.client_key = @client_key
  AND v.campaign_key = @campaign_key
  AND
  (
      ABS(
          ISNULL(v.expected_recovered_to_date, 0)
          - ISNULL(
              CAST(
                  @stage_target
                  * v.elapsed_business_days
                  / NULLIF(v.total_business_days, 0)
                  AS DECIMAL(19,4)
              ),
              0
          )
      ) > 0.0001
      OR ABS(
          ISNULL(v.gap_amount, 0)
          - ISNULL(
              CAST(
                  v.recovered_amount_to_date
                  - (
                      @stage_target
                      * v.elapsed_business_days
                      / NULLIF(v.total_business_days, 0)
                  )
                  AS DECIMAL(19,4)
              ),
              0
          )
      ) > 0.0001
  );

IF @curve_formula_differences <> 0
    THROW 52209, 'La curva esperada/gap no coincide con la fórmula canonical V1.', 1;

SELECT TOP (1)
    calendar_date,
    target_recovered_amount,
    recovered_amount_to_date,
    elapsed_business_days,
    total_business_days,
    expected_recovered_to_date,
    target_achievement_rate,
    pace_achievement_rate,
    gap_amount,
    gap_rate
FROM analytics.v_campaign_target_progress
WHERE client_key = @client_key
  AND campaign_key = @campaign_key
ORDER BY date_key DESC;

/* ------------------------------------------------------------
   Idempotencia: ejecutar loader dos veces sobre el mismo stage.
   ------------------------------------------------------------ */

DECLARE @before TABLE
(
    target_recovered_amount DECIMAL(19,4),
    target_effectiveness_rate DECIMAL(9,6) NULL,
    source_reference VARCHAR(200) NULL,
    source_as_of_at DATETIME2(3) NULL
);

INSERT INTO @before
SELECT
    target_recovered_amount,
    target_effectiveness_rate,
    source_reference,
    source_as_of_at
FROM analytics.fact_target_monthly
WHERE client_key = @client_key
  AND campaign_key = @campaign_key
  AND portfolio_key IS NULL;

EXEC etl.usp_load_claro_target_monthly
    @crm_client_id = @crm_client_id,
    @campaign_code = @campaign_code,
    @source_code = @source_code;

EXEC etl.usp_load_claro_target_monthly
    @crm_client_id = @crm_client_id,
    @campaign_code = @campaign_code,
    @source_code = @source_code;

SELECT
    @idempotence_differences =
        (SELECT COUNT(*)
         FROM
         (
             SELECT
                 target_recovered_amount,
                 target_effectiveness_rate,
                 source_reference,
                 source_as_of_at
             FROM @before

             EXCEPT

             SELECT
                 target_recovered_amount,
                 target_effectiveness_rate,
                 source_reference,
                 source_as_of_at
             FROM analytics.fact_target_monthly
             WHERE client_key = @client_key
               AND campaign_key = @campaign_key
               AND portfolio_key IS NULL
         ) AS before_minus_after)
        +
        (SELECT COUNT(*)
         FROM
         (
             SELECT
                 target_recovered_amount,
                 target_effectiveness_rate,
                 source_reference,
                 source_as_of_at
             FROM analytics.fact_target_monthly
             WHERE client_key = @client_key
               AND campaign_key = @campaign_key
               AND portfolio_key IS NULL

             EXCEPT

             SELECT
                 target_recovered_amount,
                 target_effectiveness_rate,
                 source_reference,
                 source_as_of_at
             FROM @before
         ) AS after_minus_before);

SELECT
    @stage_rows AS stage_rows,
    @stage_source_rows AS source_rows,
    @stage_target AS target_recovered_amount,
    @fact_rows AS fact_rows,
    @curve_rows AS curve_rows,
    @curve_formula_differences AS curve_formula_differences,
    @idempotence_differences AS idempotence_differences,
    CASE
        WHEN @stage_rows = 1
         AND @fact_rows = 1
         AND @fact_target = @stage_target
         AND @fact_source_as_of_at = @stage_source_as_of_at
         AND @watermark_source_as_of_at = @stage_source_as_of_at
         AND @curve_rows > 0
         AND @curve_formula_differences = 0
         AND @idempotence_differences = 0
            THEN 'OK'
        ELSE 'REVIEW'
    END AS assessment;
