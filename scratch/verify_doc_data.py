import json, re, os

with open("js/documents-data.js", "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.FALLBACK_DOCUMENTS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.FALLBACK_DOCUMENTS")
    exit(1)

items = json.loads(m.group(1))
print(f"Total documents in js/documents-data.js: {len(items)}")

missing = 0
for item in items:
    url = item.get("file_url", "")
    if url.startswith("http"):
        continue
    if not os.path.exists(url):
        print(f"Missing file for {item.get('title')}: {url}")
        missing += 1

print(f"Missing files in documents-data.js: {missing}")
