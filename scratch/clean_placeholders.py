import glob

for fpath in glob.glob('*.html') + glob.glob('sveden/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()

    new_c = c.replace('+7 (999) 000-00-00 / example@main.ru', '+7 (999) 123-45-67 или email@mail.ru')
    if new_c != c:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'Updated placeholder in {fpath}')
