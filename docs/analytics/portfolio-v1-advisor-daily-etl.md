# Portfolio Control Center — ETAPA 6 / Avance 3

## Identidad elegida

Para CLARO se validó:

- 9 asesores;
- 9 `nId_Usuario`;
- 9 `nId_UsuOpe`;
- 0 nulos;
- 0 conflictos ID → nombre;
- 0 conflictos nombre → ID;
- 9/9 asesores con un único DNI dentro del scope correcto;
- 9/9 DNI presentes en PROD.

Por tanto:

`dim_advisor.source_advisor_id = nId_Usuario`

El DNI se guarda en:

`dim_advisor.advisor_document`

El nombre y cargo son atributos descriptivos.

## Producción diaria

`fact_advisor_daily` se carga a grain:

`fecha + cliente + campaña + cartera + asesor`

Los contactos se deduplican primero a:

`fecha + cartera + asesor + deudor`

y se clasifican con precedencia:

`CD > CI > NC`

Esto evita duplicar un deudor que tuvo varias gestiones el mismo día.

Además, el ETL persiste ese mismo detalle en:

`analytics.fact_advisor_debtor_contact_daily`

con grain:

`fecha + cliente + campaña + cartera + asesor + deudor`

Este grain NO reemplaza `fact_debtor_contact_daily`, porque esa fact transversal
no contiene asesor y su unicidad es diferente. Mantener una fact separada evita
forzar una atribución cuando un mismo deudor puede tener actividad de más de un
asesor.

Para rangos multi-día, RPC se recalcula reagrupando primero a:

`cartera + asesor + deudor`

y aplicando precedencia acumulada `CD > CI > NC`. No se suman los distinct
diarios de `fact_advisor_daily`.

El close rate exacto de asesor usa:

- denominador: distinct `cartera + asesor + deudor` con CD desde
  `fact_advisor_debtor_contact_daily`;
- numerador: distinct `cartera + asesor + deudor` con promesa válida desde
  `fact_promise`.

## Pagadores exactos en rangos

`fact_advisor_daily.payers_count` conserva el distinct diario existente, pero
ese contador no se suma para producir un distinct multi-día.

El ETL persiste los pagadores atribuibles en:

`analytics.fact_advisor_debtor_payment_daily`

con grain:

`fecha + cliente + campaña + cartera + asesor + deudor`

Solo se materializa una fila cuando `paid_amount > 0` dentro de una gestión
real. Para un rango se reagrupa a `cartera + asesor + deudor` y se cuenta una
sola vez cada combinación.

El `recovered_amount` de `fact_advisor_daily` no cambia: sigue siendo un monto
aditivo atribuible al asesor.

## Pago Sin Promesa

Las filas `6. Pago Sin Promesa` no representan una gestión de un asesor.

Por tanto:

- sí aportan al recaudo Portfolio;
- no aportan a management_events del asesor;
- no aportan a RPC del asesor;
- no se atribuyen al ranking de un asesor.

La validación expone:

`portfolio_recovered - advisor_recovered - payment_only_recovered`

y este valor debe ser cero o explicablemente cercano a cero.

## Promesas

El ETL completa:

`analytics.fact_promise.advisor_key`

usando:

`nId_DocxCobrarOpe -> nId_Usuario -> advisor_key`

solo cuando el mapping es inequívoco.

## Supervisor

La jerarquía canonical actual proviene de `aval_cob.dbo.av_Usuario.nid_UsuSuper`
y se materializa en `dim_supervisor` + `bridge_supervisor_advisor`. La ausencia
de supervisor en la fuente se conserva como `NULL`; no se infiere una relación.

La historia empieza desde la primera observación Analytics y no se hace
backfill de relaciones anteriores.

## Límite de cartera/contactabilidad por asesor

La fuente de asesor permite atribuir actividad, contactos, promesas y pagos,
pero no asigna un universo de cartera canonical a cada asesor. Por tanto, no se
calcula contactabilidad `contacted / assigned`, avance de cartera ni meta a nivel
asesor. Ver `portfolio-v1-advisor-metrics-contract.md`.
