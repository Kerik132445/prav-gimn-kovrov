import glob, re

for fpath in glob.glob('*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines):
        if 'chatgpt.com' in line or '00-00' in line or '000-00' in line:
            print(f'{fpath}:{idx+1}: {line.strip()[:140]}')
