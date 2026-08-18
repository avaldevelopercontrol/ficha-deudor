# ETAPA 6 — Runtime productivo de jerarquía Supervisor -> Asesor

## Objetivo

Reemplazar el transporte manual por SSMS por una ejecución automática del
loader directo:

`scripts/analytics/load_aval_usuario_snapshot.py`

El loader realiza en una sola ejecución:

1. lectura de `192.168.100.45 / aval_cob.dbo.av_Usuario`;
2. reemplazo de `staging.aval_usuario_current` para `AVAL_COB_45`;
3. ejecución de `etl.usp_load_claro_supervisor_hierarchy`;
4. validación de staging, watermark y mapping;
5. commit único en `aval_analytics`.

## Restricción de conectividad

El runtime elegido debe poder abrir ambas conexiones ODBC:

- `192.168.100.45:51601 / aval_cob`;
- `172.23.1.180:51601 / aval_analytics`.

El host Ubuntu utilizado durante la validación inicial no es candidato mientras
mantenga el error `08001 / TCP Provider / 10054` hacia el servidor 180.

No se intenta corregir ese problema reduciendo TLS ni cambiando nuevamente de
driver.

## Credenciales

No se almacenan credenciales en Git.

El runtime debe suministrar:

- `AVAL_COB_CONNECTION_STRING`;
- `AVAL_ANALYTICS_CONNECTION_STRING`.

Deben utilizarse las cuentas y mecanismos de autenticación autorizados para
cada servidor.

## Preflight obligatorio

Antes de programar cualquier scheduler, ejecutar en el host candidato:

```bash
python scripts/analytics/load_aval_usuario_snapshot.py --check-only
```

El comando no escribe datos y debe terminar con:

`CHECK_ONLY_OK: no se realizaron escrituras.`

Si falla alguna de las dos conexiones, el host no debe utilizarse para el
scheduling de este ETL.

## Ejecución productiva

Una vez aprobado el preflight:

```bash
python scripts/analytics/load_aval_usuario_snapshot.py
```

La ejecución correcta termina con:

`SYNC_OK: staging, jerarquia y watermark confirmados en una sola transaccion del destino.`

## Atomicidad

El loader no confirma staging antes de ejecutar la jerarquía.

El reemplazo de staging, el cambio del bridge/dimensión y el watermark quedan
bajo una sola transacción del destino. Si falla la jerarquía o la validación
final, se ejecuta rollback y no debe quedar un snapshot nuevo parcialmente
publicado.

Además, el loader rechaza un snapshot cuyo `source_as_of_at` sea anterior al
snapshot staging actual para evitar retroceder accidentalmente la jerarquía.

## Scheduling

La tecnología de scheduling se elige después de identificar el runtime que
pase el preflight. Puede ser el scheduler nativo aprobado en ese host, pero la
regla es que el scheduler solo invoque el loader y gestione sus variables de
entorno/secretos fuera del repositorio.

No se fija todavía una frecuencia en código porque debe alinearse con la
frecuencia operativa requerida para la jerarquía y con el runtime finalmente
aprobado.

## Transporte manual

`export_aval_usuario_snapshot_sql.py` se conserva como mecanismo de contingencia
y validación, no como scheduling productivo principal.
