from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine

engine = create_engine("sqlite:///:memory:")

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.close()

with engine.connect() as conn:
    res = conn.exec_driver_sql("PRAGMA foreign_keys;").scalar()
    print("PRAGMA foreign_keys result:", res)
    assert res == 1, "Foreign keys must be ON!"
    print("Verification SUCCESSFUL!")
