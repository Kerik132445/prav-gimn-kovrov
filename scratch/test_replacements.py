import os, urllib.parse

from map_docs import mapping, duplicates_to_delete

# Добавим маппинг для газет
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

all_replacements = {}
for old_name, new_name in mapping.items():
    all_replacements[old_name] = new_name
    quoted = urllib.parse.quote(old_name)
    if quoted != old_name:
        all_replacements[quoted] = new_name

for old_name, new_name in newspaper_mapping.items():
    all_replacements[old_name] = new_name
    quoted = urllib.parse.quote(old_name)
    if quoted != old_name:
        all_replacements[quoted] = new_name

print(f"Total replacement keys: {len(all_replacements)}")

# Проверим, в каких файлах они встречаются
found_in_files = {}
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'venv' in root or '__pycache__' in root or 'scratch' in root:
        continue
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext in ['.html', '.js', '.py', '.json', '.sql', '.md']:
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fh:
                    content = fh.read()
            except Exception:
                continue
            for k, v in all_replacements.items():
                if k in content:
                    found_in_files.setdefault(path, set()).add((k, v))

print(f"Files needing updates: {len(found_in_files)}")
for p, repls in found_in_files.items():
    print(f"  {p}: {len(repls)} replacements")
