# ETAPA 6 / Avance 3 — Transporte temporal 45 -> 180

## Motivo

Desde Ubuntu:

- TCP hacia `172.23.1.180:51601` funciona;
- ODBC Driver 18 falla con `10054`;
- ODBC Driver 17 falla con `10054`;
- `Encrypt=yes` y `Encrypt=no` fallan de la misma forma.

Por ello el Avance 3 no seguirá dependiendo de una conexión ODBC directa
Ubuntu -> SQL Server 180.

## Flujo temporal de validación

1. Python en Ubuntu conecta únicamente a `192.168.100.45 / aval_cob`.
2. `export_aval_usuario_snapshot_sql.py` lee `dbo.av_Usuario`.
3. Genera un archivo SQL autocontenido en `/tmp`.
4. El archivo se abre y ejecuta con SSMS contra
   `172.23.1.180 / aval_analytics`.
5. El snapshot queda en `staging.aval_usuario_current`.
6. Se ejecuta localmente `etl.usp_load_claro_supervisor_hierarchy`.
7. Se ejecuta la validación de jerarquía.

## Alcance

Este mecanismo permite validar y cerrar ETAPA 6 / Avance 3.

No se considera todavía el mecanismo final de scheduling de producción.
Para producción deberá existir un runtime que pueda alcanzar de forma
segura ambas instancias, o resolverse la incompatibilidad de conexión del
host Ubuntu con SQL Server 180.

No se reducen políticas TLS del cliente ni se almacenan credenciales en Git.

## Evolución hacia producción

El mecanismo manual se mantiene como contingencia. El runner directo endurecido
y el preflight del runtime están documentados en:

`docs/analytics/portfolio-v1-supervisor-production-runner.md`
