import sqlite3
con = sqlite3.connect('backend/gymnasium.db')
cur = con.cursor()
tables = [t[0] for t in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    for c in cols:
        try:
            rows = cur.execute(f"SELECT {c} FROM {t} WHERE {c} LIKE '%D0%'").fetchall()
            if rows:
                print(f"{t}.{c}:", rows[:3])
        except Exception:
            pass
