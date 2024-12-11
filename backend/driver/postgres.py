import psycopg

def create_postgres_connection(connection_str: str) -> psycopg.Connection:
    return psycopg.connect(
        conninfo=connection_str
    )