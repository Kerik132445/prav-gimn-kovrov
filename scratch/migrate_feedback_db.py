import sqlite3
import os

db_path = r"c:\Users\kerik\krytoi_site\backend\gymnasium.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(feedback_messages);")
cols = {row[1]: row for row in cursor.fetchall()}
print("Existing columns:", list(cols.keys()))

needs_migration = False
if "source_page" not in cols:
    needs_migration = True
if cols.get("subject", [0, 0, 0, 1])[3] == 1: # notnull == 1
    needs_migration = True

if needs_migration:
    print("Migrating feedback_messages table to allow NULL subject and add source_page...")
    cursor.execute("""
    CREATE TABLE feedback_messages_migrated (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(100) NOT NULL,
        subject VARCHAR(150) NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        ip_address VARCHAR(50) NULL,
        source_page VARCHAR(100) NULL,
        created_at DATETIME NOT NULL
    );
    """)

    # Copy data
    cursor.execute("""
    INSERT INTO feedback_messages_migrated (id, name, contact, subject, message, status, ip_address, source_page, created_at)
    SELECT id, name, contact, subject, message, status, ip_address, 'Главная страница', created_at
    FROM feedback_messages;
    """)

    cursor.execute("DROP TABLE feedback_messages;")
    cursor.execute("ALTER TABLE feedback_messages_migrated RENAME TO feedback_messages;")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_feedback_messages_id ON feedback_messages (id);")
    conn.commit()
    print("Migration finished successfully!")
else:
    print("Table feedback_messages already up-to-date.")

# Verify
cursor.execute("PRAGMA table_info(feedback_messages);")
for col in cursor.fetchall():
    print("Col:", col)

cursor.execute("SELECT id, name, subject, source_page FROM feedback_messages;")
for row in cursor.fetchall():
    print("Row:", row)

conn.close()
