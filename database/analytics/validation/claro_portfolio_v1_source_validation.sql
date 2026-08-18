/*
Portfolio Control Center - ETAPA 5 / Avance 2
Validación Source -> KPI para CLARO V1
SOLO LECTURA.

Ejecutar en:
    aval_reporteria

Objetivo:
- Obtener una línea base de KPIs directamente desde las fuentes actuales.
- Restringir GESTION-COB2 al mismo universo de carteras de
  PBI_CLARO_CORP_ADMINISTRATIVO.
- Evitar mezclar CLARO GOBIERNO con el BI CLARO Administrativo.
*/

USE [aval_reporteria];
GO
SET NOCOUNT ON;

DECLARE @AsOfDate DATE = CAST(GETDATE() AS DATE);
DECLARE @CampaignYear INT = YEAR(@AsOfDate);
DECLARE @CampaignMonth INT = MONTH(@AsOfDate);
DECLARE @CampAval VARCHAR(15) =
    CONCAT('C-', RIGHT(CONCAT('0', @CampaignMonth), 2));
DECLARE @StartDate DATE = DATEFROMPARTS(@CampaignYear, @CampaignMonth, 1);
DECLARE @EndExclusive DATETIME =
    DATEADD(DAY, 1, CAST(@AsOfDate AS DATETIME));


PRINT '============================================================';
PRINT 'PARAMETROS';
PRINT '============================================================';

SELECT
    @AsOfDate AS as_of_date,
    @CampaignYear AS campaign_year,
    @CampaignMonth AS campaign_month,
    @CampAval AS campaign_source_code,
    @StartDate AS campaign_start_date;


PRINT '============================================================';
PRINT '1. UNIVERSO DE CARTERAS CLARO ADMINISTRATIVO';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#ClaroPortfolioScope') IS NOT NULL
    DROP TABLE #ClaroPortfolioScope;

SELECT DISTINCT
    p.nId_Cartera,
    LTRIM(RTRIM(p.cartera)) AS cartera
INTO #ClaroPortfolioScope
FROM dbo.PBI_CLARO_CORP_ADMINISTRATIVO AS p
WHERE p.AñoAval = @CampaignYear
  AND p.CampAval = @CampAval;

CREATE UNIQUE CLUSTERED INDEX IX_ClaroPortfolioScope
    ON #ClaroPortfolioScope(nId_Cartera);

SELECT
    COUNT(*) AS portfolios_in_scope
FROM #ClaroPortfolioScope;


PRINT '============================================================';
PRINT '2. SNAPSHOT DE CARTERA';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#SnapshotSummary') IS NOT NULL
    DROP TABLE #SnapshotSummary;

SELECT
    SUM(CASE WHEN p.Deudor_unico = 1 THEN 1 ELSE 0 END)
        AS assigned_clients,

    SUM(CASE
            WHEN p.Deudor_unico = 1
             AND TRY_CONVERT(INT, p.CANT_GEST_TOTAL) > 0
            THEN 1 ELSE 0
        END)
        AS managed_clients,

    SUM(CASE
            WHEN p.Deudor_unico = 1
             AND ISNULL(TRY_CONVERT(INT, p.CANT_GEST_TOTAL), 0) = 0
            THEN 1 ELSE 0
        END)
        AS pending_clients,

    SUM(CASE
            WHEN p.Deudor_unico = 1
             AND UPPER(LTRIM(RTRIM(ISNULL(
                    p.MEJOR_RPTA_EQUIV_tipocontacto_gruponv1, ''
                 )))) = 'CONTACTO'
            THEN 1 ELSE 0
        END)
        AS contacted_clients,

    SUM(CASE
            WHEN p.Deudor_unico = 1
             AND UPPER(LTRIM(RTRIM(ISNULL(
                    p.MEJOR_RPTA_EQUIV_indicador, ''
                 )))) = 'CD'
            THEN 1 ELSE 0
        END)
        AS direct_contact_clients,

    SUM(ISNULL(p.Asignacion, 0))
        AS assigned_amount
INTO #SnapshotSummary
FROM dbo.PBI_CLARO_CORP_ADMINISTRATIVO AS p
WHERE p.AñoAval = @CampaignYear
  AND p.CampAval = @CampAval;

SELECT
    s.*,
    CAST(
        1.0 * s.managed_clients
        / NULLIF(s.assigned_clients, 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,
    CAST(
        1.0 * s.contacted_clients
        / NULLIF(s.assigned_clients, 0)
        AS DECIMAL(18,6)
    ) AS contactability_rate
FROM #SnapshotSummary AS s;


PRINT '============================================================';
PRINT '3. GESTION TRANSVERSAL INTRADIA - MISMO SCOPE DE CARTERAS';
PRINT '============================================================';

IF OBJECT_ID('tempdb..#GestionScope') IS NOT NULL
    DROP TABLE #GestionScope;

SELECT
    g.*
INTO #GestionScope
FROM dbo.vw_bi_gerencia_gestiones_pagos AS g
WHERE g.cCli_Nombre = 'CLARO CORPORATIVO'
  AND g.anio = @CampaignYear
  AND g.nCampCar = @CampaignMonth
  AND g.dDocCobOpe_FecIni >= @StartDate
  AND g.dDocCobOpe_FecIni < @EndExclusive
  AND EXISTS
  (
      SELECT 1
      FROM #ClaroPortfolioScope AS s
      WHERE s.cartera COLLATE DATABASE_DEFAULT
          = LTRIM(RTRIM(g.cCar_Nombre)) COLLATE DATABASE_DEFAULT
  );

CREATE INDEX IX_GestionScope_Main
    ON #GestionScope(cCar_Nombre, nId_PersDeudor, dDocCobOpe_FecIni);


PRINT '============================================================';
PRINT '4. KPI INTRADIA CANONICOS';
PRINT '============================================================';

;WITH Managed AS
(
    SELECT DISTINCT
        cCar_Nombre,
        nId_PersDeudor
    FROM #GestionScope
),
Classifiable AS
(
    SELECT DISTINCT
        cCar_Nombre,
        nId_PersDeudor
    FROM #GestionScope
    WHERE UPPER(LTRIM(RTRIM(ISNULL(indicador_equiv, ''))))
        IN ('CD', 'CI', 'NC')
),
DirectContact AS
(
    SELECT DISTINCT
        cCar_Nombre,
        nId_PersDeudor
    FROM #GestionScope
    WHERE UPPER(LTRIM(RTRIM(ISNULL(indicador_equiv, '')))) = 'CD'
),
ValidPromiseDebtor AS
(
    SELECT DISTINCT
        cCar_Nombre,
        nId_PersDeudor
    FROM #GestionScope
    WHERE ISNULL(marca_promesa_valida, 0) = 1
      AND ISNULL(montoPromesa, 0) > 0
      AND estado_pdp NOT LIKE '%No PdP%'
),
Payer AS
(
    SELECT DISTINCT
        cCar_Nombre,
        nId_PersDeudor
    FROM #GestionScope
    WHERE ISNULL(total_pagado, 0) > 0
),
Counts AS
(
    SELECT
        (SELECT COUNT_BIG(*) FROM Managed) AS managed_pairs_live,
        (SELECT COUNT_BIG(*) FROM Classifiable) AS classifiable_pairs,
        (SELECT COUNT_BIG(*) FROM DirectContact) AS direct_contact_pairs,
        (SELECT COUNT_BIG(*) FROM ValidPromiseDebtor) AS valid_promise_pairs,
        (SELECT COUNT_BIG(*) FROM Payer) AS payer_pairs
)
SELECT
    (SELECT COUNT_BIG(*) FROM #GestionScope) AS management_events,
    c.managed_pairs_live,
    c.classifiable_pairs,
    c.direct_contact_pairs,
    c.valid_promise_pairs,
    c.payer_pairs,

    CAST(
        1.0 * c.direct_contact_pairs
        / NULLIF(c.classifiable_pairs, 0)
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    CAST(
        1.0 * c.valid_promise_pairs
        / NULLIF(c.direct_contact_pairs, 0)
        AS DECIMAL(18,6)
    ) AS close_rate,

    SUM(ISNULL(g.total_pagado, 0)) AS recovered_amount,
    SUM(CASE
            WHEN ISNULL(g.marca_promesa_valida, 0) = 1
             AND ISNULL(g.montoPromesa, 0) > 0
             AND g.estado_pdp NOT LIKE '%No PdP%'
            THEN ISNULL(g.montoPromesa, 0)
            ELSE 0
        END) AS valid_promise_amount
FROM #GestionScope AS g
CROSS JOIN Counts AS c
GROUP BY
    c.managed_pairs_live,
    c.classifiable_pairs,
    c.direct_contact_pairs,
    c.valid_promise_pairs,
    c.payer_pairs;


PRINT '============================================================';
PRINT '5. PROMESAS OPERATIVAS';
PRINT '============================================================';

SELECT
    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND estado_pdp LIKE '%Vence Hoy%'
            THEN 1 ELSE 0
        END) AS due_today_count,

    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND estado_pdp LIKE '%Vence Hoy%'
            THEN ISNULL(montoPromesa, 0)
            ELSE 0
        END) AS due_today_amount,

    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND estado_pdp LIKE '%Caido%'
            THEN 1 ELSE 0
        END) AS broken_count,

    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND estado_pdp LIKE '%Caido%'
            THEN ISNULL(montoPromesa, 0)
            ELSE 0
        END) AS broken_amount
FROM #GestionScope;


PRINT '============================================================';
PRINT '6. CALIDAD PDP - MONETARIA';
PRINT '============================================================';

SELECT
    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND (
                    estado_pdp LIKE '%Cumplio%'
                 OR estado_pdp LIKE '%Cumplio parcial%'
                 OR estado_pdp LIKE '%Cumplio Fuera Rango%'
             )
            THEN ISNULL(total_pagado, 0)
            ELSE 0
        END) AS fulfilled_paid_amount,

    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND (
                    estado_pdp LIKE '%Cumplio%'
                 OR estado_pdp LIKE '%Cumplio parcial%'
                 OR estado_pdp LIKE '%Cumplio Fuera Rango%'
                 OR estado_pdp LIKE '%Caido%'
             )
            THEN ISNULL(montoPromesa, 0)
            ELSE 0
        END) AS evaluated_promise_amount,

    CAST(
        SUM(CASE
                WHEN ISNULL(marca_promesa_valida, 0) = 1
                 AND (
                        estado_pdp LIKE '%Cumplio%'
                     OR estado_pdp LIKE '%Cumplio parcial%'
                     OR estado_pdp LIKE '%Cumplio Fuera Rango%'
                 )
                THEN ISNULL(total_pagado, 0)
                ELSE 0
            END)
        /
        NULLIF(
            SUM(CASE
                    WHEN ISNULL(marca_promesa_valida, 0) = 1
                     AND (
                            estado_pdp LIKE '%Cumplio%'
                         OR estado_pdp LIKE '%Cumplio parcial%'
                         OR estado_pdp LIKE '%Cumplio Fuera Rango%'
                         OR estado_pdp LIKE '%Caido%'
                     )
                    THEN ISNULL(montoPromesa, 0)
                    ELSE 0
                END),
            0
        )
        AS DECIMAL(18,6)
    ) AS promise_fulfillment_amount_rate
FROM #GestionScope;


PRINT '============================================================';
PRINT '7. LINEA BASE PARA PORTFOLIO CONTROL CENTER';
PRINT '============================================================';

;WITH Classifiable AS
(
    SELECT DISTINCT cCar_Nombre, nId_PersDeudor
    FROM #GestionScope
    WHERE UPPER(LTRIM(RTRIM(ISNULL(indicador_equiv, ''))))
        IN ('CD', 'CI', 'NC')
),
DirectContact AS
(
    SELECT DISTINCT cCar_Nombre, nId_PersDeudor
    FROM #GestionScope
    WHERE UPPER(LTRIM(RTRIM(ISNULL(indicador_equiv, '')))) = 'CD'
),
ValidPromise AS
(
    SELECT DISTINCT cCar_Nombre, nId_PersDeudor
    FROM #GestionScope
    WHERE ISNULL(marca_promesa_valida, 0) = 1
      AND ISNULL(montoPromesa, 0) > 0
      AND estado_pdp NOT LIKE '%No PdP%'
),
Live AS
(
    SELECT
        COUNT_BIG(*) AS management_events,
        SUM(ISNULL(total_pagado, 0)) AS recovered_amount,
        SUM(CASE
                WHEN ISNULL(marca_promesa_valida, 0) = 1
                 AND estado_pdp LIKE '%Vence Hoy%'
                THEN 1 ELSE 0
            END) AS due_today_count,
        SUM(CASE
                WHEN ISNULL(marca_promesa_valida, 0) = 1
                 AND estado_pdp LIKE '%Vence Hoy%'
                THEN ISNULL(montoPromesa, 0)
                ELSE 0
            END) AS due_today_amount,
        MAX(ultima_fecha_registro) AS source_as_of_at
    FROM #GestionScope
)
SELECT
    @AsOfDate AS as_of_date,
    @CampaignYear AS campaign_year,
    @CampaignMonth AS campaign_month,

    s.assigned_clients,
    s.managed_clients,
    s.pending_clients,

    CAST(
        1.0 * s.managed_clients
        / NULLIF(s.assigned_clients, 0)
        AS DECIMAL(18,6)
    ) AS portfolio_progress_rate,

    l.management_events,

    CAST(
        1.0 * l.management_events
        / NULLIF(s.managed_clients, 0)
        AS DECIMAL(18,6)
    ) AS management_intensity,

    CAST(
        1.0 * s.contacted_clients
        / NULLIF(s.assigned_clients, 0)
        AS DECIMAL(18,6)
    ) AS contactability_rate,

    CAST(
        1.0 * (SELECT COUNT_BIG(*) FROM DirectContact)
        / NULLIF((SELECT COUNT_BIG(*) FROM Classifiable), 0)
        AS DECIMAL(18,6)
    ) AS rpc_rate,

    CAST(
        1.0 * (SELECT COUNT_BIG(*) FROM ValidPromise)
        / NULLIF((SELECT COUNT_BIG(*) FROM DirectContact), 0)
        AS DECIMAL(18,6)
    ) AS close_rate,

    l.recovered_amount,
    l.due_today_count,
    l.due_today_amount,
    l.source_as_of_at
FROM #SnapshotSummary AS s
CROSS JOIN Live AS l;


PRINT '============================================================';
PRINT '8. CONTROL DE CALIDAD: MONTO > 0 NO SIGNIFICA PROMESA';
PRINT '============================================================';

SELECT
    SUM(CASE
            WHEN ISNULL(montoPromesa, 0) > 0
            THEN 1 ELSE 0
        END) AS rows_amount_gt_zero,

    SUM(CASE
            WHEN ISNULL(marca_promesa_valida, 0) = 1
             AND ISNULL(montoPromesa, 0) > 0
             AND estado_pdp NOT LIKE '%No PdP%'
            THEN 1 ELSE 0
        END) AS rows_canonical_valid_promise,

    SUM(CASE
            WHEN ISNULL(montoPromesa, 0) > 0
             AND (
                    ISNULL(marca_promesa_valida, 0) = 0
                 OR estado_pdp LIKE '%No PdP%'
             )
            THEN 1 ELSE 0
        END) AS rows_amount_but_not_valid_promise
FROM #GestionScope;


PRINT '============================================================';
PRINT '9. FRESCURA CLARO ADMINISTRATIVO';
PRINT '============================================================';

SELECT
    MAX(ultima_fecha_registro) AS source_as_of_at,
    MAX(dDocCobOpe_FecIni) AS last_management_at,
    MAX(ultima_fecha_pago) AS last_payment_at,
    COUNT_BIG(*) AS rows_in_scope
FROM #GestionScope;
