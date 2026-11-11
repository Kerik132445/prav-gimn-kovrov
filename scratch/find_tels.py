import glob, re

for fpath in glob.glob('*.html') + glob.glob('sveden/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    tels = re.findall(r'href=[\'"](tel:[^\'"]+)[\'"]', c)
    if tels:
        print(fpath, set(tels))
