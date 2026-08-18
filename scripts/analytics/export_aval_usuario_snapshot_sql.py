r"""
Portfolio Control Center - ETAPA 6 / Avance 3
Exporta aval_cob.dbo.av_Usuario a un SQL de staging para aval_analytics.

Este script SOLO se conecta al origen accesible:
    192.168.100.45\MSSQLSERVER,51601 / aval_cob

NO se conecta a aval_analytics.

La salida es un .sql autocontenido que se ejecuta manualmente en SSMS contra:
    172.23.1.180\MSSQLSERVER,51601 / aval_analytics

Variable requerida:
    AVAL_COB_CONNECTION_STRING

Uso:
    python scripts/analytics/export_aval_usuario_snapshot_sql.py

Opcional:
    python scripts/analytics/export_aval_usuario_snapshot_sql.py \
        --output /tmp/aval_usuario_snapshot.sql
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    import pyodbc
except ModuleNotFoundError:
    print(
        "ERROR: falta la dependencia 'pyodbc'.",
        file=sys.stderr,
    )
    raise SystemExit(2)


SOURCE_CODE = "AVAL_COB_45"

SOURCE_SQL = """
SELECT
    nId_Usuario,
    NULLIF(LTRIM(RTRIM(cUsr_NroDoc)), '') AS cUsr_NroDoc,
    cUsr_ApePat,
    cUsr_ApeMat,
    cUsr_Nombres,
    CONVERT(INT, ISNULL(bEstado, 0)) AS bEstado,
    nid_perfil,
    nid_UsuSuper
FROM dbo.av_Usuario WITH (READUNCOMMITTED)
ORDER BY nId_Usuario;
"""


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Falta la variable de entorno obligatoria: {name}"
        )
    return value


def sql_string(value: object | None) -> str:
    if value is None:
        return "NULL"

    text = str(value).replace("'", "''")
    return "N'" + text + "'"


def sql_int(value: object | None) -> str:
    if value is None:
        return "NULL"
    return str(int(value))


def sql_datetime(value: datetime) -> str:
    return "'" + value.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "'"


def fetch_source(connection_string: str):
    with pyodbc.connect(connection_string, autocommit=True) as connection:
        cursor = connection.cursor()

        source_as_of_at = cursor.execute(
            "SELECT SYSDATETIME();"
        ).fetchone()[0]

        rows = cursor.execute(SOURCE_SQL).fetchall()

        if not rows:
            raise RuntimeError(
                "aval_cob.dbo.av_Usuario no devolvio registros."
            )

        return source_as_of_at, rows


def build_sql(source_as_of_at: datetime, rows) -> str:
    lines: list[str] = []

    lines.extend(
        [
            "/*",
            "Portfolio Control Center - ETAPA 6 / Avance 3",
            "Snapshot generado desde 192.168.100.45 / aval_cob.dbo.av_Usuario",
            f"source_as_of_at: {source_as_of_at}",
            f"rows: {len(rows)}",
            "",
            "EJECUTAR EN SSMS CONTRA:",
            r"172.23.1.180\MSSQLSERVER,51601 / aval_analytics",
            "*/",
            "",
            "USE aval_analytics;",
            "GO",
            "",
            "SET NOCOUNT ON;",
            "SET XACT_ABORT ON;",
            "GO",
            "",
            "IF OBJECT_ID('staging.aval_usuario_current', 'U') IS NULL",
            "    THROW 51970, "
            "'No existe staging.aval_usuario_current. Ejecutar primero 007.', 1;",
            "GO",
            "",
            "BEGIN TRY",
            "    BEGIN TRANSACTION;",
            "",
            "    DELETE FROM staging.aval_usuario_current",
            f"    WHERE source_code = '{SOURCE_CODE}';",
            "",
        ]
    )

    # SQL Server table-value constructors allow max 1000 rows in INSERT VALUES.
    batch_size = 500

    for batch_start in range(0, len(rows), batch_size):
        batch = rows[batch_start : batch_start + batch_size]

        lines.extend(
            [
                "    INSERT INTO staging.aval_usuario_current",
                "    (",
                "        source_code,",
                "        source_as_of_at,",
                "        nId_Usuario,",
                "        cUsr_NroDoc,",
                "        cUsr_ApePat,",
                "        cUsr_ApeMat,",
                "        cUsr_Nombres,",
                "        bEstado,",
                "        nid_perfil,",
                "        nid_UsuSuper",
                "    )",
                "    VALUES",
            ]
        )

        values = []

        for row in batch:
            values.append(
                "        ("
                + ", ".join(
                    [
                        f"'{SOURCE_CODE}'",
                        sql_datetime(source_as_of_at),
                        sql_int(row.nId_Usuario),
                        sql_string(row.cUsr_NroDoc),
                        sql_string(row.cUsr_ApePat),
                        sql_string(row.cUsr_ApeMat),
                        sql_string(row.cUsr_Nombres),
                        sql_int(row.bEstado),
                        sql_int(row.nid_perfil),
                        sql_int(row.nid_UsuSuper),
                    ]
                )
                + ")"
            )

        lines.append(",\n".join(values) + ";")
        lines.append("")

    lines.extend(
        [
            "    DECLARE @loaded_rows INT;",
            "",
            "    SELECT @loaded_rows = COUNT(*)",
            "    FROM staging.aval_usuario_current",
            f"    WHERE source_code = '{SOURCE_CODE}';",
            "",
            f"    IF @loaded_rows <> {len(rows)}",
            "        THROW 51971, "
            "'Cantidad de staging distinta al snapshot exportado.', 1;",
            "",
            "    COMMIT TRANSACTION;",
            "",
            "    SELECT",
            f"        '{SOURCE_CODE}' AS source_code,",
            f"        {sql_datetime(source_as_of_at)} AS source_as_of_at,",
            "        @loaded_rows AS loaded_rows,",
            "        'SNAPSHOT_IMPORTADO_OK' AS assessment;",
            "END TRY",
            "BEGIN CATCH",
            "    IF @@TRANCOUNT > 0",
            "        ROLLBACK TRANSACTION;",
            "",
            "    THROW;",
            "END CATCH;",
            "GO",
            "",
            "/*",
            "Siguiente paso, en la misma conexion SSMS:",
            "",
            "EXEC etl.usp_load_claro_supervisor_hierarchy",
            "    @crm_client_id = 95,",
            f"    @source_code = '{SOURCE_CODE}';",
            "*/",
            "",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="/tmp/aval_usuario_snapshot_AVAL_COB_45.sql",
        help="Archivo SQL de salida.",
    )
    args = parser.parse_args()

    connection_string = require_env("AVAL_COB_CONNECTION_STRING")
    source_as_of_at, rows = fetch_source(connection_string)

    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    output.write_text(
        build_sql(source_as_of_at, rows),
        encoding="utf-8",
    )

    print(f"Fuente: aval_cob.dbo.av_Usuario")
    print(f"source_as_of_at: {source_as_of_at}")
    print(f"rows: {len(rows)}")
    print(f"SQL generado: {output}")
    print("")
    print(
        "Ejecuta ese archivo en SSMS contra "
        "172.23.1.180 / aval_analytics."
    )

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
