import glob, re

def update_file(filepath, is_sveden=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content

    if is_sveden:
        # Logo in sveden
        content = content.replace('../assets/icons/logo-gymnasium.svg', '../assets/icons/logo_star.png')
        
        # Telegram -> MAX in sveden
        content = content.replace(
            '<a href="#" aria-label="Telegram">\n\t\t\t\t\t\t\t\t\t\t<img src="../assets/icons/telegram.svg" alt="Telegram" width="20" height="20">',
            '<a href="#" aria-label="MAX">\n\t\t\t\t\t\t\t\t\t\t<img src="../assets/icons/max_white.svg" alt="MAX" width="20" height="20">'
        )
        # Also handle any variations with whitespace
        content = re.sub(
            r'<a href="#" aria-label="Telegram">\s*<img src="\.\./assets/icons/telegram\.svg" alt="Telegram" width="20" height="20">\s*</a>',
            '<a href="#" aria-label="MAX">\n\t\t\t\t\t\t\t\t\t\t<img src="../assets/icons/max_white.svg" alt="MAX" width="20" height="20">\n\t\t\t\t\t\t\t\t\t</a>',
            content
        )
    else:
        # Logo in root files
        content = content.replace('./assets/icons/logo-gymnasium.svg', './assets/icons/logo_star.png')
        content = content.replace('assets/icons/logo-gymnasium.svg', 'assets/icons/logo_star.png')

        # Telegram -> MAX in root files
        content = re.sub(
            r'<a href="#" aria-label="Telegram">\s*<img src="assets/icons/telegram\.svg" alt="Telegram" width="20" height="20">\s*</a>',
            '<a href="#" aria-label="MAX">\n\t\t\t\t\t\t\t\t\t\t<img src="assets/icons/max_white.svg" alt="MAX" width="20" height="20">\n\t\t\t\t\t\t\t\t\t</a>',
            content
        )

    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes in {filepath}")

for f in sorted(glob.glob('*.html')):
    if f not in ['sveden_icons_preview.html', 'dairy.html']:
        update_file(f, is_sveden=False)

for f in sorted(glob.glob('sveden/*.html')):
    update_file(f, is_sveden=True)
