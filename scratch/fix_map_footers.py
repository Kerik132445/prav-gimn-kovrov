import glob, re

files = glob.glob('*.html') + glob.glob('sveden/*.html')
count = 0

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    # Remove utm_source=chatgpt.com
    content = content.replace('&amp;utm_source=chatgpt.com', '')
    content = content.replace('&utm_source=chatgpt.com', '')
    content = content.replace('?utm_source=chatgpt.com&amp;', '?')
    content = content.replace('?utm_source=chatgpt.com&', '?')

    # Fix sosnovaya_ulitsa_10 -> podlesnaya_ulitsa_10
    content = content.replace('sosnovaya_ulitsa_10', 'podlesnaya_ulitsa_10')
    content = content.replace('Сосновая улица, 10', 'Подлесная улица, 10')
    content = content.replace('Сосновая ул., 10', 'Подлесная ул., 10')

    # Fix postal code 601900 -> 601909
    content = content.replace('601900', '601909')

    if content != orig:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'Fixed map/address in: {fpath}')

print(f'Total files updated: {count}')
