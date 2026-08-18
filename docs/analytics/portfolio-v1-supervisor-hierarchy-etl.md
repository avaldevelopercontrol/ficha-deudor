# Portfolio Control Center — ETAPA 6 / Avance 3 — Jerarquía supervisor

## Decisión de fuente

Para CLARO, la jerarquía operacional current se obtiene desde:

`aval_cob.dbo.av_Usuario`

Regla:

`advisor nId_Usuario -> nid_UsuSuper -> supervisor nId_Usuario`

`source_supervisor_id` usa el `nId_Usuario` técnico del supervisor.

El DNI se conserva como `supervisor_document`, pero no es la clave técnica.

## Origen upstream

Los procedimientos `RPTC_253` ejecutan `sp_datosrrhh` antes de consultar la
jerarquía.

`sp_datosrrhh` obtiene la relación desde RRHH:

1. trabajador por `rh_Documento.nId_PerAfectado`;
2. contrato vigente `rh_Contrato.nId_EstadoContrato = 4`;
3. superior por `rh_Documento.nId_PerSuperior`;
4. DNI del superior en `rh_Personal`;
5. resolución del superior contra `aval_cob.dbo.av_Usuario`;
6. actualización de `av_Usuario.nid_UsuSuper`.

Analytics no ejecuta `sp_datosrrhh` y no requiere acceso directo a RRHH.

## Limitación confirmada al 2026-08-13

Los 9 asesores CLARO existen en `av_Usuario` y sus DNI coinciden.

La fuente current informa:

- 5 asesores con supervisor;
- 4 asesores con `nid_UsuSuper = NULL`;
- 0 IDs de supervisor huérfanos;
- 0 conflictos de identidad.

Las tres bases RRHH (`aval_rrhh`, `dextra_rrhh`, `tfi_rrhh`) no son accesibles
desde el usuario utilizado para Analytics/diagnóstico. Por ello no se inventa
una relación para los cuatro asesores sin supervisor.

## Política Analytics

`dim_supervisor` contiene únicamente supervisores realmente resueltos.

`bridge_supervisor_advisor` contiene únicamente relaciones verificadas.

Un asesor sin `nid_UsuSuper`:

- sigue existiendo en `dim_advisor`;
- aparece en `v_advisor_supervisor_current`;
- tiene supervisor `NULL`;
- podrá agruparse como "Sin supervisor" en API/UI;
- no se asigna por similitud, nombre, equipo o inferencia.

## Vigencia

La fuente `av_Usuario` representa estado current y no ofrece historia completa.

Por ello la primera carga usa como `valid_from` la fecha de observación
Analytics.

En cargas posteriores:

- si no cambia el supervisor, el bridge permanece;
- si cambia, se cierra el periodo anterior y se abre uno nuevo;
- si el supervisor pasa a NULL, se cierra la relación current;
- si posteriormente aparece un supervisor, se abre una nueva vigencia.

Así Analytics comienza a historizar cambios reales sin inventar pasado.

## Calidad de fuente

La jerarquía puede tener calidad:

- `COMPLETE`: todos los asesores activos tienen supervisor;
- `PARTIAL_VERIFIED`: existen asesores activos sin supervisor, pero Analytics
  coincide exactamente con la fuente current.

La cobertura parcial no bloquea el resto del producto.
