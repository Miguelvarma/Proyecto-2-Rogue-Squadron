import json
import os
from pathlib import Path

from src.domain.repositories.IKnowledgeBaseRepository import IKnowledgeBaseRepository


def _load_env_values() -> dict[str, str]:
    env_values: dict[str, str] = {}

    current = Path(__file__).resolve()
    chatbot_root = current.parents[3]
    backend_root = current.parents[4]
    env_files = [chatbot_root / ".env", backend_root / ".env"]

    for env_file in env_files:
        if not env_file.exists():
            continue
        for line in env_file.read_text(encoding="utf-8").splitlines():
            clean = line.strip()
            if not clean or clean.startswith("#") or "=" not in clean:
                continue
            key, value = clean.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and key not in env_values:
                env_values[key] = value

    return env_values


def _open_connection():
    env_values = _load_env_values()

    db_host = os.getenv("DB_HOST") or env_values.get("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT") or env_values.get("DB_PORT", "3306"))
    db_user = os.getenv("DB_USER") or env_values.get("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD") or env_values.get("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME") or env_values.get("DB_NAME", "nexus_battles")

    try:
        import pymysql

        conn = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name,
            charset="utf8mb4",
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor,
        )
        return conn, "pymysql"
    except ImportError:
        try:
            import mysql.connector

            conn = mysql.connector.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_password,
                database=db_name,
                autocommit=True,
            )
            return conn, "mysql-connector"
        except ImportError as exc:
            raise RuntimeError(
                "No se encontró driver MySQL en Python. Instala 'pymysql' o 'mysql-connector-python'."
            ) from exc


class MySQLKnowledgeBaseRepository(IKnowledgeBaseRepository):
    def get_by_categoria(self, categoria: str) -> list[dict]:
        conn, driver = _open_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, categoria, subcategoria, entry_id, nombre, datos, source_file, source_path, created_at, updated_at
                    FROM knowledge_base_entries
                    WHERE categoria = %s
                    ORDER BY subcategoria ASC, id ASC
                    """,
                    (categoria,),
                )
                rows = cursor.fetchall()

            normalized: list[dict] = []
            for row in rows:
                datos = row.get("datos")
                if isinstance(datos, (str, bytes, bytearray)):
                    try:
                        row["datos"] = json.loads(datos)
                    except Exception:
                        pass
                normalized.append(row)

            return normalized
        finally:
            conn.close()

    def get_categorias_relevantes(self, keywords: list[str]) -> list[str]:
        clean_keywords = [k.strip().lower() for k in keywords if k and k.strip()]
        if not clean_keywords:
            return []

        conn, driver = _open_connection()
        try:
            like_conditions = []
            params: list[str] = []
            for keyword in clean_keywords:
                like_conditions.append("LOWER(COALESCE(nombre, '')) LIKE %s")
                params.append(f"%{keyword}%")
                like_conditions.append("LOWER(CAST(datos AS CHAR(10000))) LIKE %s")
                params.append(f"%{keyword}%")

            where_clause = " OR ".join(like_conditions)
            query = f"""
                SELECT DISTINCT categoria
                FROM knowledge_base_entries
                WHERE {where_clause}
                ORDER BY categoria ASC
            """

            with conn.cursor() as cursor:
                cursor.execute(query, tuple(params))
                rows = cursor.fetchall()

            categorias: list[str] = []
            for row in rows:
                if isinstance(row, dict):
                    categoria = row.get("categoria")
                else:
                    categoria = row[0] if row else None
                if categoria:
                    categorias.append(str(categoria))
            return categorias
        finally:
            conn.close()

    def get_all_categorias(self) -> list[str]:
        conn, driver = _open_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT DISTINCT categoria
                    FROM knowledge_base_entries
                    ORDER BY categoria ASC
                    """
                )
                rows = cursor.fetchall()

            categorias: list[str] = []
            for row in rows:
                if isinstance(row, dict):
                    categoria = row.get("categoria")
                else:
                    categoria = row[0] if row else None
                if categoria:
                    categorias.append(str(categoria))
            return categorias
        finally:
            conn.close()
