# ETAPA 6 / Avance 3 — Diagnóstico de supervisor

## Estado previo

La carga de asesor quedó validada:

- Source = Analytics sin diferencias;
- 9 asesores cargados;
- 213/213 promesas válidas con asesor;
- conciliación monetaria exacta:
  Portfolio - asesor - Pago Sin Promesa = 0.

## Problema pendiente

`RPTC_253_PRODUCCIONGENERALPORGESTOR_ACUMULADO` solo informa actualmente
supervisor para parte del equipo.

No se debe construir `bridge_supervisor_advisor` con cobertura parcial sin
entender si:

- el dato está incompleto;
- existen distintos tipos de supervisor;
- algunos asesores dependen de otra jerarquía;
- hay otra tabla maestra más confiable.

## Qué valida el script

1. cobertura de supervisor actual;
2. estabilidad asesor -> supervisor;
3. evidencia histórica de los asesores sin supervisor;
4. objetos de aval_reporteria con campos supervisor/coordinador/jefe/lider;
5. objetos que además tienen ID/DNI de asesor;
6. columnas de candidatos prioritarios.

## Regla de materialización

Solo se construirá:

- `analytics.dim_supervisor`;
- `analytics.bridge_supervisor_advisor`;

cuando exista una fuente con:

- cobertura suficiente;
- relación inequívoca asesor -> supervisor;
- identificador estable o una estrategia de normalización documentada;
- posibilidad de conservar vigencia histórica.

No se utilizará `SUPERVISOR_NOMBRE` a ciegas como clave técnica.
