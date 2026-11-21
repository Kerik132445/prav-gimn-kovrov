import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Document

DOCS_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "documents-data.js")

def seed_documents():
    db = SessionLocal()
    try:
        count = db.query(Document).count()
        if count > 0:
            print(f"Documents already seeded ({count} docs).")
            return

        with open(DOCS_DATA_PATH, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract JSON array from js file
        m = re.search(r"window\.FALLBACK_DOCUMENTS\s*=\s*(\[.*?\]);", content, re.DOTALL)
        if not m:
            print("Error: Could not parse window.FALLBACK_DOCUMENTS")
            return

        items = json.loads(m.group(1))
        for item in items:
            doc = Document(
                title=item.get("title", ""),
                category_key=item.get("category_key", "legal"),
                category_title=item.get("category_title", "Документы"),
                file_url=item.get("file_url", ""),
                file_size=item.get("file_size"),
                file_type=item.get("file_type", "pdf"),
                download_name=item.get("download_name"),
                sort_order=item.get("sort_order", 0)
            )
            db.add(doc)
        db.commit()
        print(f"Successfully seeded {len(items)} documents into database!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_documents()
