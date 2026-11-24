import os
import shutil
import sqlite3
import urllib.parse

from map_docs import mapping, duplicates_to_delete

# Newspaper mapping
newspaper_mapping = {
    "Сретенские витражи №1.pdf": "Sretenskie_vitrazhi_2023.pdf",
    "№1-2011.pdf": "Dobroe_slovo_2011_01.pdf",
    "№2-2011.pdf": "Dobroe_slovo_2011_02.pdf",
    "№3-2011.pdf": "Dobroe_slovo_2011_03.pdf",
    "№4-2011.pdf": "Dobroe_slovo_2011_04.pdf",
    "№5-2011.pdf": "Dobroe_slovo_2011_05.pdf",
    "№6-2011.pdf": "Dobroe_slovo_2011_06.pdf",
    "№7-2011.pdf": "Dobroe_slovo_2011_07.pdf",
    "№8-2011.pdf": "Dobroe_slovo_2011_08.pdf",
    "№10-2011.pdf": "Dobroe_slovo_2011_10.pdf",
    "№1-2012.pdf": "Dobroe_slovo_2012_01.pdf",
    "№2-2012.pdf": "Dobroe_slovo_2012_02.pdf",
    "№3-2012.pdf": "Dobroe_slovo_2012_03.pdf",
    "№4-2012.pdf": "Dobroe_slovo_2012_04.pdf",
    "№5-2012.pdf": "Dobroe_slovo_2012_05.pdf",
    "№6-2012.pdf": "Dobroe_slovo_2012_06.pdf",
    "№7-2012.pdf": "Dobroe_slovo_2012_07.pdf",
    "№8-2012.pdf": "Dobroe_slovo_2012_08.pdf",
    "№9-2012.pdf": "Dobroe_slovo_2012_09.pdf",
    "№1-2013.pdf": "Dobroe_slovo_2013_01.pdf",
    "№2-2013.pdf": "Dobroe_slovo_2013_02.pdf",
    "№3-2013.pdf": "Dobroe_slovo_2013_03.pdf",
    "№4-2013.pdf": "Dobroe_slovo_2013_04.pdf",
    "№5-2013.pdf": "Dobroe_slovo_2013_05.pdf",
    "№6-2013.pdf": "Dobroe_slovo_2013_06.pdf",
    "№1-2014.pdf": "Dobroe_slovo_2014_01.pdf",
    "№2-2014.pdf": "Dobroe_slovo_2014_02.pdf",
    "№3-2014.pdf": "Dobroe_slovo_2014_03.pdf",
    "№1-2015.pdf": "Dobroe_slovo_2015_01.pdf",
    "№2-2015.pdf": "Dobroe_slovo_2015_02.pdf",
    "№3-2015.pdf": "Dobroe_slovo_2015_03.pdf",
}

print("=== STEP 1: Удаление дубликатов в documents/ ===")
for dup in duplicates_to_delete:
    p = os.path.join("documents", dup)
    if os.path.exists(p):
        os.remove(p)
        print(f"Removed duplicate: {dup}")

print("\n=== STEP 2: Удаление дубликатов в documents/newspaper/ ===")
for old_news, target in newspaper_mapping.items():
    p = os.path.join("documents", "newspaper", old_news)
    t = os.path.join("documents", "newspaper", target)
    if os.path.exists(p) and os.path.exists(t):
        os.remove(p)
        print(f"Removed duplicate newspaper: {old_news}")

doc_file = os.path.join("documents", "newspaper", "Dobroe_slovo_1 (1).doc")
if os.path.exists(doc_file):
    os.remove(doc_file)
    print("Removed Dobroe_slovo_1 (1).doc")

print("\n=== STEP 3: Переименование файлов в documents/ ===")
for old_name, new_name in mapping.items():
    src = os.path.join("documents", old_name)
    dst = os.path.join("documents", new_name)
    if os.path.exists(src):
        os.rename(src, dst)
        print(f"Renamed: {old_name} -> {new_name}")
    elif not os.path.exists(dst):
        print(f"WARNING: source not found: {old_name}")

print("\n=== STEP 4: Подготовка словаря замен для текстовых файлов ===")
replacements = []

# Для документов:
# Сначала обрабатываем длинные/сложные ключи, сортируем по длине убывания
for old_name, new_name in mapping.items():
    quoted = urllib.parse.quote(old_name)
    # Варианты:
    # 1. documents/<quoted> -> documents/<new_name>
    replacements.append((f"documents/{quoted}", f"documents/{new_name}"))
    replacements.append((f"documents/{old_name}", f"documents/{new_name}"))
    # Имя файла отдельно (для download=... и т.п.)
    replacements.append((quoted, new_name))
    replacements.append((old_name, new_name))

# Для газет:
for old_name, new_name in newspaper_mapping.items():
    quoted = urllib.parse.quote(old_name)
    replacements.append((f"documents/newspaper/{quoted}", f"documents/newspaper/{new_name}"))
    replacements.append((f"documents/newspaper/{old_name}", f"documents/newspaper/{new_name}"))
    replacements.append((f"documents/newspaper/{urllib.parse.quote(old_name, safe='')}", f"documents/newspaper/{new_name}"))
    replacements.append((quoted, new_name))
    replacements.append((old_name, new_name))

# Сортируем замены по длине строки поиска от самых длинных к коротким
replacements.sort(key=lambda x: len(x[0]), reverse=True)

# Убираем дубликаты
seen = set()
unique_replacements = []
for k, v in replacements:
    if k not in seen:
        seen.add(k)
        unique_replacements.append((k, v))

print(f"Unique text replacement rules: {len(unique_replacements)}")

print("\n=== STEP 5: Обновление текстовых файлов проекта ===")
target_files = [
    "documents.html",
    "food.html",
    "index.html",
    "life.html",
    "js/documents-data.js",
    "admin/index.html",
    "backend/seed_gym_life.py",
    "sveden/budget.html",
    "sveden/common.html",
    "sveden/document.html",
    "sveden/education.html",
    "sveden/employees.html",
    "sveden/objects.html",
    "sveden/struct.html",
    "sveden/vacant.html",
]

for tf in target_files:
    path = tf.replace('/', os.sep)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    orig = content
    for old_val, new_val in unique_replacements:
        if old_val in content:
            content = content.replace(old_val, new_val)
    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"Updated: {tf}")
    else:
        print(f"No changes needed: {tf}")

print("\n=== STEP 6: Обновление базы данных backend/gymnasium.db ===")
db_path = "backend/gymnasium.db"
if os.path.exists(db_path):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Обновление documents
    for old_name, new_name in mapping.items():
        quoted = urllib.parse.quote(old_name)
        new_url = f"documents/{new_name}"
        cur.execute("UPDATE documents SET file_url = ? WHERE file_url LIKE ? OR file_url LIKE ?",
                    (new_url, f"%{old_name}%", f"%{quoted}%"))
        cur.execute("UPDATE documents SET download_name = ? WHERE download_name LIKE ? OR download_name LIKE ?",
                    (new_name, f"%{old_name}%", f"%{quoted}%"))

    # Обновление newspaper_issues
    for old_name, new_name in newspaper_mapping.items():
        quoted = urllib.parse.quote(old_name)
        new_url = f"documents/newspaper/{new_name}"
        cur.execute("UPDATE newspaper_issues SET file_url = ? WHERE file_url LIKE ? OR file_url LIKE ?",
                    (new_url, f"%{old_name}%", f"%{quoted}%"))

    con.commit()
    print("Database backend/gymnasium.db updated successfully!")
    con.close()

print("\n=== STEP 7: Проверка оставшихся кириллических имен в documents/ ===")
all_docs = os.listdir("documents")
non_ascii = [f for f in all_docs if any(ord(c) > 127 for c in f)]
print(f"Remaining non-ascii files in documents/: {len(non_ascii)}")
for f in non_ascii:
    print("  ", f)

all_news = os.listdir("documents/newspaper")
non_ascii_news = [f for f in all_news if any(ord(c) > 127 for c in f)]
print(f"Remaining non-ascii files in documents/newspaper/: {len(non_ascii_news)}")
for f in non_ascii_news:
    print("  ", f)
