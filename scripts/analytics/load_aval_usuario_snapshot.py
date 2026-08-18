"""
Portfolio Control Center - ETAPA 6 / transporte Supervisor -> Asesor.
Carga staging de aval_cob.av_Usuario -> aval_analytics y ejecuta la jerarquía.

Origen:
    192.168.100.45\\MSSQLSERVER,51601 / aval_cob

Destino:
    172.23.1.180\\MSSQLSERVER,51601 / aval_analytics

No contiene credenciales. Las conexiones completas se reciben por variables de
entorno:

    AVAL_COB_CONNECTION_STRING
    AVAL_ANALYTICS_CONNECTION_STRING

El runtime de producción debe poder abrir AMBAS conexiones. El host Ubuntu usado
para la validación inicial no cumple hoy esa condición para el destino 180.

Preflight sin escrituras:
    python scripts/analytics/load_aval_usuario_snapshot.py --check-only

Ejecución:
    python scripts/analytics/load_aval_usuario_snapshot.py
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from typing import Sequence

try:
    import pyodbc
except ModuleNotFoundError:
    print(
        "ERROR: falta la dependencia 'pyodbc'. "
        "Instalala en el entorno Python antes de ejecutar este loader.",
        file=sys.stderr,
    )
    raise SystemExit(2)


SOURCE_CODE = "AVAL_COB_45"
SOURCE_DATABASE = "aval_cob"
TARGET_DATABASE = "aval_analytics"
HIERARCHY_WATERMARK = "CLARO_SUPERVISOR_HIERARCHY"

SOURCE_SQL = """
SELECT
    nId_Usuario,
    NULLIF(LTRIM(RTRIM(cUsr_NroDoc)), '') AS cUsr_NroDoc,
    cUsr_ApePat,
    cUsr_ApeMat,
    cUsr_Nombres,
    bEstado,
    nid_perfil,
    nid_UsuSuper
FROM dbo.av_Usuario WITH (READUNCOMMITTED)
ORDER BY nId_Usuario;
"""

TARGET_INSERT_SQL = """
INSERT INTO staging.aval_usuario_current
(
    source_code,
    source_as_of_at,
    nId_Usuario,
    cUsr_NroDoc,
    cUsr_ApePat,
    cUsr_ApeMat,
    cUsr_Nombres,
    bEstado,
    nid_perfil,
    nid_UsuSuper
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
"""


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Falta la variable de entorno obligatoria: {name}"
        )
    return value


def fetch_source_rows(
    connection_string: str,
) -> tuple[datetime, Sequence[pyodbc.Row], str, str]:
    with pyodbc.connect(connection_string, autocommit=True) as connection:
        cursor = connection.cursor()

        source_server, source_database, source_as_of_at = cursor.execute(
            "SELECT @@SERVERNAME, DB_NAME(), CONVERT(DATETIME2(3), SYSDATETIME());"
        ).fetchone()

        if str(source_database).lower() != SOURCE_DATABASE:
            raise RuntimeError(
                f"La conexion de origen apunta a {source_database!r}; "
                f"se esperaba {SOURCE_DATABASE!r}."
            )

        rows = cursor.execute(SOURCE_SQL).fetchall()

        if not rows:
            raise RuntimeError(
                "aval_cob.dbo.av_Usuario no devolvio registros."
            )

        source_ids = [int(row.nId_Usuario) for row in rows]
        if len(source_ids) != len(set(source_ids)):
            raise RuntimeError(
                "La fuente av_Usuario contiene nId_Usuario duplicados."
            )

        return (
            source_as_of_at,
            rows,
            str(source_server),
            str(source_database),
        )


def check_target_prerequisites(
    connection_string: str,
    crm_client_id: int,
) -> dict[str, object]:
    with pyodbc.connect(connection_string, autocommit=True) as connection:
        cursor = connection.cursor()

        row = cursor.execute(
            """
            SELECT
                @@SERVERNAME AS server_name,
                DB_NAME() AS database_name,
                CASE
                    WHEN OBJECT_ID(
                        'staging.aval_usuario_current',
                        'U'
                    ) IS NULL THEN 0 ELSE 1
                END AS has_staging,
                CASE
                    WHEN OBJECT_ID(
                        'etl.usp_load_claro_supervisor_hierarchy',
                        'P'
                    ) IS NULL THEN 0 ELSE 1
                END AS has_hierarchy_proc,
                CASE
                    WHEN OBJECT_ID(
                        'analytics.v_advisor_supervisor_current',
                        'V'
                    ) IS NULL THEN 0 ELSE 1
                END AS has_hierarchy_view;
            """
        ).fetchone()

        if str(row.database_name).lower() != TARGET_DATABASE:
            raise RuntimeError(
                f"La conexion de destino apunta a {row.database_name!r}; "
                f"se esperaba {TARGET_DATABASE!r}."
            )

        if row.has_staging != 1:
            raise RuntimeError(
                "No existe staging.aval_usuario_current en aval_analytics."
            )
        if row.has_hierarchy_proc != 1:
            raise RuntimeError(
                "No existe etl.usp_load_claro_supervisor_hierarchy."
            )
        if row.has_hierarchy_view != 1:
            raise RuntimeError(
                "No existe analytics.v_advisor_supervisor_current."
            )

        client_count = cursor.execute(
            """
            SELECT COUNT(*)
            FROM analytics.dim_client
            WHERE crm_client_id = ?
              AND is_active = 1;
            """,
            crm_client_id,
        ).fetchone()[0]

        if client_count != 1:
            raise RuntimeError(
                "El crm_client_id debe resolver exactamente un cliente "
                "activo en analytics.dim_client."
            )

        current_staging = cursor.execute(
            """
            SELECT
                COUNT(*) AS staged_rows,
                MAX(source_as_of_at) AS source_as_of_at
            FROM staging.aval_usuario_current
            WHERE source_code = ?;
            """,
            SOURCE_CODE,
        ).fetchone()

        watermark = cursor.execute(
            """
            SELECT last_source_datetime
            FROM etl.watermark
            WHERE source_code = ?;
            """,
            HIERARCHY_WATERMARK,
        ).fetchone()

        return {
            "server_name": row.server_name,
            "database_name": row.database_name,
            "staged_rows": int(current_staging.staged_rows or 0),
            "staging_source_as_of_at": current_staging.source_as_of_at,
            "watermark_source_as_of_at": (
                watermark.last_source_datetime if watermark else None
            ),
        }


def validate_loaded_transaction(
    cursor: pyodbc.Cursor,
    source_as_of_at: datetime,
    expected_rows: int,
    crm_client_id: int,
) -> None:
    staged = cursor.execute(
        """
        SELECT
            COUNT(*) AS staged_rows,
            MIN(source_as_of_at) AS min_source_as_of_at,
            MAX(source_as_of_at) AS max_source_as_of_at
        FROM staging.aval_usuario_current
        WHERE source_code = ?;
        """,
        SOURCE_CODE,
    ).fetchone()

    if staged.staged_rows != expected_rows:
        raise RuntimeError(
            "La cantidad cargada en staging no coincide con la fuente: "
            f"source={expected_rows}, target={staged.staged_rows}."
        )

    if (
        staged.min_source_as_of_at != source_as_of_at
        or staged.max_source_as_of_at != source_as_of_at
    ):
        raise RuntimeError(
            "staging.aval_usuario_current mezcla timestamps de snapshots."
        )

    watermark = cursor.execute(
        """
        SELECT last_source_datetime
        FROM etl.watermark
        WHERE source_code = ?;
        """,
        HIERARCHY_WATERMARK,
    ).fetchone()

    if watermark is None or watermark.last_source_datetime != source_as_of_at:
        raise RuntimeError(
            "El watermark de jerarquia no coincide con el snapshot cargado."
        )

    mapping_differences = cursor.execute(
        """
        DECLARE @client_key INT;

        SELECT @client_key = client_key
        FROM analytics.dim_client
        WHERE crm_client_id = ?
          AND is_active = 1;

        SELECT COUNT(*)
        FROM analytics.dim_advisor AS a
        INNER JOIN staging.aval_usuario_current AS u
            ON u.source_code = ?
           AND u.nId_Usuario = TRY_CONVERT(INT, a.source_advisor_id)
        LEFT JOIN analytics.v_advisor_supervisor_current AS v
            ON v.advisor_key = a.advisor_key
        WHERE a.client_key = @client_key
          AND a.is_active = 1
          AND ISNULL(u.nid_UsuSuper, -1)
              <> ISNULL(TRY_CONVERT(INT, v.source_supervisor_id), -1);
        """,
        crm_client_id,
        SOURCE_CODE,
    ).fetchone()[0]

    if mapping_differences != 0:
        raise RuntimeError(
            "La jerarquia resultante no coincide con el snapshot staging."
        )


def load_target(
    connection_string: str,
    source_as_of_at: datetime,
    rows: Sequence[pyodbc.Row],
    crm_client_id: int,
) -> None:
    connection = pyodbc.connect(connection_string, autocommit=False)

    try:
        cursor = connection.cursor()

        existing_source_as_of_at = cursor.execute(
            """
            SELECT MAX(source_as_of_at)
            FROM staging.aval_usuario_current
            WHERE source_code = ?;
            """,
            SOURCE_CODE,
        ).fetchone()[0]

        if (
            existing_source_as_of_at is not None
            and source_as_of_at < existing_source_as_of_at
        ):
            raise RuntimeError(
                "El snapshot fuente es anterior al staging actual; "
                "se evita retroceder la jerarquia."
            )

        cursor.execute(
            """
            DELETE FROM staging.aval_usuario_current
            WHERE source_code = ?;
            """,
            SOURCE_CODE,
        )

        payload = [
            (
                SOURCE_CODE,
                source_as_of_at,
                row.nId_Usuario,
                row.cUsr_NroDoc,
                row.cUsr_ApePat,
                row.cUsr_ApeMat,
                row.cUsr_Nombres,
                row.bEstado,
                row.nid_perfil,
                row.nid_UsuSuper,
            )
            for row in rows
        ]

        cursor.fast_executemany = True
        cursor.executemany(TARGET_INSERT_SQL, payload)

        loaded_count = cursor.execute(
            """
            SELECT COUNT(*)
            FROM staging.aval_usuario_current
            WHERE source_code = ?;
            """,
            SOURCE_CODE,
        ).fetchone()[0]

        if loaded_count != len(rows):
            raise RuntimeError(
                "La cantidad cargada en staging no coincide "
                f"con la fuente: source={len(rows)}, target={loaded_count}."
            )

        # No hacer commit aqui. Staging + jerarquia + watermark deben quedar
        # dentro de una sola transaccion del destino.
        cursor.execute(
            """
            EXEC etl.usp_load_claro_supervisor_hierarchy
                @crm_client_id = ?,
                @source_code = ?,
                @as_of_at = ?,
                @effective_date = ?;
            """,
            crm_client_id,
            SOURCE_CODE,
            source_as_of_at,
            source_as_of_at.date(),
        )

        summary = cursor.fetchone()
        if summary:
            columns = [column[0] for column in cursor.description]
            print("ETL supervisor:")
            for column, value in zip(columns, summary):
                print(f"  {column}: {value}")

        validate_loaded_transaction(
            cursor,
            source_as_of_at,
            len(rows),
            crm_client_id,
        )

        connection.commit()

    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--crm-client-id",
        type=int,
        default=95,
        help="crm_client_id de CLARO en analytics.dim_client (default: 95)",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help=(
            "Comprueba conectividad y prerrequisitos de origen/destino "
            "sin escribir datos."
        ),
    )
    args = parser.parse_args()

    source_connection_string = require_env(
        "AVAL_COB_CONNECTION_STRING"
    )
    target_connection_string = require_env(
        "AVAL_ANALYTICS_CONNECTION_STRING"
    )

    source_as_of_at, rows, source_server, source_database = fetch_source_rows(
        source_connection_string
    )

    print(
        f"Fuente OK: server={source_server}; database={source_database}; "
        f"rows={len(rows)}; source_as_of_at={source_as_of_at}"
    )

    target_status = check_target_prerequisites(
        target_connection_string,
        args.crm_client_id,
    )

    print(
        "Destino OK: "
        f"server={target_status['server_name']}; "
        f"database={target_status['database_name']}; "
        f"staged_rows={target_status['staged_rows']}; "
        "staging_source_as_of_at="
        f"{target_status['staging_source_as_of_at']}; "
        "watermark_source_as_of_at="
        f"{target_status['watermark_source_as_of_at']}"
    )

    if args.check_only:
        print("CHECK_ONLY_OK: no se realizaron escrituras.")
        return 0

    load_target(
        target_connection_string,
        source_as_of_at,
        rows,
        args.crm_client_id,
    )

    print(
        "SYNC_OK: staging, jerarquia y watermark confirmados "
        "en una sola transaccion del destino."
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
