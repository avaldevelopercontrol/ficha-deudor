# ETAPA 6 / Avance 3 — Validación final de identidad de asesor

## Decisión provisional

Los resultados observados muestran:

- 3,857 gestiones operativas;
- 9 nombres de asesor;
- 9 `nId_Usuario`;
- 9 `nId_UsuOpe`;
- 0 nulos;
- 0 conflictos ID → nombre;
- 0 conflictos nombre → ID;
- `nId_Usuario = nId_UsuOpe` en los 9 asesores observados.

Por semántica del modelo se toma `nId_Usuario` como candidato canónico para:

`dim_advisor.source_advisor_id`

`nId_UsuOpe` queda como identificador operativo secundario.

## Qué falta cerrar

Antes de materializar `dim_advisor` se valida si `nId_Usuario` puede mapearse
a un identificador humano estable, preferentemente DNI/código, mediante:

- `rpt_ref_usuario`;
- `RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO`;
- `RPTC_253_PRODUCCIONGENERALPORGESTOR_DIA`;
- `PBI_CARTERA_DIA_CLARO_CORP_ADMINISTRATIVO_PROD`.

## Regla de aceptación

Para los 9 asesores actuales:

- 1 `nId_Usuario` → 1 asesor;
- 1 `nId_Usuario` → máximo 1 DNI;
- idealmente 9/9 asesores con DNI;
- 0 conflictos de DNI.

Si se cumple, el siguiente paso del mismo avance será poblar:

- `analytics.dim_advisor`;
- `analytics.fact_advisor_daily`.

La jerarquía supervisor → asesor se abordará después de validar la fuente
maestra correspondiente.
