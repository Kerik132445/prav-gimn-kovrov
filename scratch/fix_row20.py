import sqlite3

conn = sqlite3.connect("backend/gymnasium.db")
c = conn.cursor()
c.execute("""
    UPDATE feedback_messages
    SET source_page = 'Расписание уроков',
        created_at = '2026-11-13 18:56:59.936149'
    WHERE id = 20
""")
conn.commit()

row = c.execute("SELECT id, name, contact, subject, source_page, created_at, status FROM feedback_messages WHERE id = 20").fetchone()
print("Updated row 20:", row)
conn.close()
