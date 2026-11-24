import sqlite3, os

con = sqlite3.connect("backend/gymnasium.db")
cur = con.cursor()

docs = cur.execute("SELECT title, file_url FROM documents").fetchall()
print(f"Total documents in DB: {len(docs)}")
missing_docs = 0
for title, url in docs:
    if not os.path.exists(url):
        print(f"DB doc missing: {title} -> {url}")
        missing_docs += 1
print(f"Missing DB docs: {missing_docs}")

news = cur.execute("SELECT title, file_url FROM newspaper_issues").fetchall()
print(f"Total newspapers in DB: {len(news)}")
missing_news = 0
for title, url in news:
    if not os.path.exists(url):
        print(f"DB news missing: {title} -> {url}")
        missing_news += 1
print(f"Missing DB news: {missing_news}")
