import glob, re, os

patterns = ['chatgpt.com', '000-00', '00-00', 'Lorem', 'lorem', 'test@', 'example.com', 'Сосновая ул.']
print("=== ROOT HTML CHECK ===")
for fpath in glob.glob('*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    for p in patterns:
        if p in content:
            print(f'{fpath} contains "{p}"')

print("\n=== SVEDEN PLACEHOLDERS CHECK ===")
for fpath in glob.glob('sveden/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count('sveden-placeholder')
    if count > 0:
        print(f'{fpath}: {count} occurrences')
