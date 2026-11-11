import re

for fpath in ['index.html', 'apply.html', 'dairy.html']:
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()

    new_c = re.sub(
        r'<a href="[^"]*">\s*Политика конфиденциальности\s*</a>',
        '<a href="policy.html">\n\t\t\t\tПолитика конфиденциальности\n\t\t\t</a>',
        c
    )
    if new_c != c:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'Updated {fpath}')
    else:
        print(f'Already matched or no change: {fpath}')
