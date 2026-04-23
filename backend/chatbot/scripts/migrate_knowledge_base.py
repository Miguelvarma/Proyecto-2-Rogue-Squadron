import json
import os
from collections import defaultdict
from pathlib import Path


def load_env_values() -> dict[str, str]:
    env_values: dict[str, str] = {}
    current = Path(__file__).resolve()
    chatbot_root = current.parents[1]
    backend_root = current.parents[2]
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


def open_connection():
    env_values = load_env_values()

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


def find_object_arrays(obj, path=""):
    arrays = []
    if isinstance(obj, list):
        if obj and all(isinstance(item, dict) for item in obj):
            arrays.append((path or "$", obj))
        return arrays

    if isinstance(obj, dict):
        for key, value in obj.items():
            next_path = f"{path}.{key}" if path else key
            arrays.extend(find_object_arrays(value, next_path))
    return arrays


def extract_name(entry: dict):
    for key in ("name", "nombre", "title", "titulo", "type", "effect", "mode", "hero"):
        value = entry.get(key)
        if value is not None and str(value).strip() != "":
            return str(value)
    return None


def derive_subcategory(array_path: str):
    if not array_path or array_path == "$":
        return None
    return array_path.split(".")[-1]


def derive_entry_id(entry: dict, array_path: str, index: int):
    value = entry.get("id")
    if value is not None and str(value).strip() != "":
        return str(value)
    return f"{array_path}:{index}"


def migrate():
    current = Path(__file__).resolve()
    knowledge_base_dir = current.parents[1] / "knowledge_base"
    if not knowledge_base_dir.exists():
        raise RuntimeError(f"No existe knowledge_base en: {knowledge_base_dir}")

    conn, driver = open_connection()
    inserted = defaultdict(int)
    updated = defaultdict(int)
    processed = defaultdict(int)

    try:
        with conn.cursor() as cursor:
            for json_file in sorted(knowledge_base_dir.glob("*.json")):
                categoria = json_file.stem.lower()
                source_file = json_file.name
                data = json.loads(json_file.read_text(encoding="utf-8"))

                arrays = find_object_arrays(data)
                for array_path, entries in arrays:
                    subcategoria = derive_subcategory(array_path)

                    for index, entry in enumerate(entries):
                        entry_id = derive_entry_id(entry, array_path, index)
                        nombre = extract_name(entry)
                        datos_json = json.dumps(entry, ensure_ascii=False)

                        cursor.execute(
                            """
                            INSERT INTO knowledge_base_entries
                              (categoria, subcategoria, entry_id, nombre, datos, source_file, source_path)
                            VALUES
                              (%s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE
                              nombre = VALUES(nombre),
                              datos = VALUES(datos),
                              source_file = VALUES(source_file),
                              source_path = VALUES(source_path),
                              updated_at = CURRENT_TIMESTAMP
                            """,
                            (
                                categoria,
                                subcategoria,
                                entry_id,
                                nombre,
                                datos_json,
                                source_file,
                                array_path,
                            ),
                        )

                        processed[categoria] += 1
                        if cursor.rowcount == 1:
                            inserted[categoria] += 1
                        else:
                            updated[categoria] += 1

        print("\nMigración completada. Resumen por categoría:")
        for categoria in sorted(processed.keys()):
            print(
                f"- {categoria}: procesadas={processed[categoria]} "
                f"insertadas={inserted[categoria]} actualizadas={updated[categoria]}"
            )

        total_processed = sum(processed.values())
        total_inserted = sum(inserted.values())
        total_updated = sum(updated.values())
        print(
            f"\nTotales: procesadas={total_processed} insertadas={total_inserted} actualizadas={total_updated}"
        )
        print(f"Driver usado: {driver}")

    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
