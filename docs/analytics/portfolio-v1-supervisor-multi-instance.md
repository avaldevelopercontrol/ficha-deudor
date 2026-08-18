# ETAPA 6 / Avance 3 — Jerarquía supervisor multi-instancia

## Topología confirmada

Analytics:

`172.23.1.180\MSSQLSERVER,51601 / aval_analytics`

Fuente SISGES accesible:

`192.168.100.45\MSSQLSERVER,51601 / aval_cob`

Existe también `aval_cob` en `172.23.1.180`, pero el usuario utilizado no
tiene acceso y esa copia no se usa como fuente para este ETL.

## Decisión

No se realiza referencia SQL de tres partes desde `aval_analytics` a
`aval_cob`.

La integración se divide en:

1. extracción pequeña de `192.168.100.45 / aval_cob.dbo.av_Usuario`;
2. carga a `aval_analytics.staging.aval_usuario_current`;
3. transformación local:
   `etl.usp_load_claro_supervisor_hierarchy`.

La tabla `av_Usuario` tiene un volumen pequeño frente a las tablas
transaccionales masivas, por lo que el snapshot completo de las columnas
necesarias es simple y seguro.

## Seguridad

Las cadenas de conexión no viven en Git.

El loader exige:

- `AVAL_COB_CONNECTION_STRING`;
- `AVAL_ANALYTICS_CONNECTION_STRING`.

Cada una puede utilizar el mecanismo de autenticación autorizado para su
servidor.

## Semántica

La fuente de jerarquía sigue siendo:

`advisor nId_Usuario -> nid_UsuSuper -> supervisor nId_Usuario`

La staging solo desacopla la conectividad entre instancias; no cambia la
regla de negocio.

Los asesores con `nid_UsuSuper = NULL` permanecen sin supervisor.
