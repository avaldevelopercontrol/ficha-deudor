# Portfolio Control Center — ETAPA 6 / Avance 3

## Objetivo

Resolver la identidad técnica estable del asesor antes de poblar:

- `analytics.dim_advisor`
- `analytics.fact_advisor_daily`
- `analytics.bridge_supervisor_advisor`

No se usará `nombre_asesor` como clave.

## Candidatos físicos

La tabla `aval_reporteria.dbo.rpt_gestiones_pagos_final` expone:

- `nId_Usuario`
- `nId_UsuOpe`
- `nombre_asesor`
- `cNombre_Cargo`

Los dos primeros deben validarse antes de elegir uno como
`source_advisor_id`.

## Qué debe cumplir un ID de asesor

Un identificador candidato debe cumplir idealmente:

1. no ser nulo/cero en gestiones reales;
2. un ID no debe mapear a varios nombres distintos;
3. un mismo asesor no debería saltar entre IDs sin una razón histórica;
4. debe poder relacionarse con una fuente maestra de usuario;
5. no debe depender de tildes, espacios o cambios de nombre.

## Exclusión de Pago Sin Promesa

Las filas `6. Pago Sin Promesa` se excluyen del diagnóstico de asesor.

Estas filas son registros sintéticos de pago y no representan producción
operativa de un gestor.

## Resultado del diagnóstico

El script clasifica cada candidato como:

- `CANDIDATO_FUERTE`
- `CANDIDATO_CON_NULOS`
- `NO_USAR_SIN_MAPPING`

La clasificación es orientativa. La decisión final se toma revisando también
la relación con una tabla maestra de usuarios.

## Siguiente paso

Una vez elegido el ID estable:

1. poblar `dim_advisor`;
2. reprocesar producción diaria por asesor;
3. validar Source = Analytics por asesor;
4. localizar la fuente CRM de supervisor → asesor;
5. poblar la relación histórica.
