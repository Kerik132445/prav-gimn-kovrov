import glob

# Root HTML files
for fpath in glob.glob('*.html'):
    if fpath == 'policy.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()

    new_c = c.replace('<a href="#">\n\t\t\t\tПолитика конфиденциальности', '<a href="policy.html">\n\t\t\t\tПолитика конфиденциальности')
    new_c = new_c.replace('<a href="#">Политика конфиденциальности</a>', '<a href="policy.html">Политика конфиденциальности</a>')
    new_c = new_c.replace('<a href="#">\nПолитика конфиденциальности\n</a>', '<a href="policy.html">\nПолитика конфиденциальности\n</a>')

    if new_c != c:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'Updated footer policy link in: {fpath}')

# Sveden HTML files
for fpath in glob.glob('sveden/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()

    new_c = c.replace('<a href="#">\n\t\t\t\tПолитика конфиденциальности', '<a href="../policy.html">\n\t\t\t\tПолитика конфиденциальности')
    new_c = new_c.replace('<a href="#">Политика конфиденциальности</a>', '<a href="../policy.html">Политика конфиденциальности</a>')
    new_c = new_c.replace('<a href="#">\nПолитика конфиденциальности\n</a>', '<a href="../policy.html">\nПолитика конфиденциальности\n</a>')

    if new_c != c:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'Updated footer policy link in: {fpath}')
