# Portfolio Control Center — contrato de métricas de asesor

## Principio

La identidad canonical del asesor es `dim_advisor.source_advisor_id = nId_Usuario`.
Analytics puede atribuir al asesor actividad originada en gestiones reales, pero
no existe actualmente una fuente canonical que asigne un universo de cartera o
una meta mensual a cada asesor.

Por tanto, una métrica de cartera no se hereda desde la campaña ni se reparte
entre asesores.

## Métricas disponibles

Para un asesor sí se pueden exponer:

- gestiones (`management_events`);
- RPC exacto en rango;
- close rate exacto en rango;
- promesas válidas;
- pagadores atribuibles exactos en rango;
- recaudo atribuible;
- supervisor actual como atributo descriptivo cuando exista mapping canonical.

RPC de rango se calcula desde
`analytics.fact_advisor_debtor_contact_daily`, reagrupando primero a
`cartera + asesor + deudor` y aplicando precedencia `CD > CI > NC`.

Close rate usa como denominador los deudores CD exactos del mismo grain y como
numerador los deudores con promesa válida en `analytics.fact_promise`.

Pagadores de rango se calculan desde
`analytics.fact_advisor_debtor_payment_daily`, no sumando distinct diarios.

El recaudo atribuible sale de `fact_advisor_daily.recovered_amount` y no debe
presentarse como si fuera igual al recaudo total de cartera.

## Contactabilidad no disponible

La contactabilidad canonical del producto está definida como:

`contacted / assigned`

A nivel asesor no existe actualmente un denominador canonical `assigned`.

Por eso NO se debe calcular `AdvisorPerformanceItem.contactabilityRate` usando:

- contactos directos / gestiones;
- CD / (CD + CI + NC), porque eso es RPC;
- contacto / cartera completa de campaña;
- reparto proporcional de la cartera entre asesores;
- una medida de producción legacy denominada también contactabilidad.

Con las fuentes actuales el valor correcto es semánticamente **no disponible**,
no cero.

La adaptación del contrato React se realizará durante ETAPA 7 al integrar la
API real. ETAPA 6 no modifica mocks/frontend.

## Métricas no atribuibles con las fuentes actuales

No se atribuyen al asesor:

- cartera asignada;
- cartera pendiente;
- avance `managed / assigned`;
- contactabilidad canonical `contacted / assigned`;
- meta mensual;
- expected curve / pace / gap contra meta.

Si el negocio incorpora en el futuro una fuente canonical de asignación de
cartera/meta por asesor, estas métricas podrán añadirse mediante un nuevo
contrato sin reinterpretar las actuales.
