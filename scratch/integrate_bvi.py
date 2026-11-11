import glob, re

bvi_li = '''\t\t\t\t<li class="nav-item--bvi">
\t\t\t\t\t<button type="button" class="bvi-toggle-btn" aria-label="Версия для слабовидящих">
\t\t\t\t\t\t<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bvi-icon" width="16" height="16">
\t\t\t\t\t\t\t<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
\t\t\t\t\t\t\t<circle cx="12" cy="12" r="3"></circle>
\t\t\t\t\t\t</svg>
\t\t\t\t\t\t<span>Версия для слабовидящих</span>
\t\t\t\t\t</button>
\t\t\t\t</li>'''

# 1. Root pages
for fpath in sorted(glob.glob('*.html')):
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Link css if not present
    if 'bvi.css' not in html:
        html = html.replace('</head>', '\t<link rel="stylesheet" href="css/bvi.css">\n</head>')

    # Link js if not present
    if 'bvi.js' not in html:
        html = html.replace('</body>', '\t<script src="js/bvi.js"></script>\n</body>')

    # Add button after contacts li if not present
    if 'bvi-toggle-btn' not in html:
        m = re.search(r'(<li[^>]*>(?:(?!<li)[\s\S])*?Контакты(?:(?!</li>)[\s\S])*?</li>)', html)
        if m:
            html = html.replace(m.group(1), m.group(1) + '\n' + bvi_li, 1)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Integrated BVI into root: {fpath}')

# 2. Sveden pages
for fpath in sorted(glob.glob('sveden/*.html')):
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Link css if not present
    if 'bvi.css' not in html:
        html = html.replace('</head>', '\t<link rel="stylesheet" href="../css/bvi.css">\n</head>')

    # Link js if not present
    if 'bvi.js' not in html:
        html = html.replace('</body>', '\t<script src="../js/bvi.js"></script>\n</body>')

    # Add button after contacts li if not present
    if 'bvi-toggle-btn' not in html:
        m = re.search(r'(<li[^>]*>(?:(?!<li)[\s\S])*?Контакты(?:(?!</li>)[\s\S])*?</li>)', html)
        if m:
            html = html.replace(m.group(1), m.group(1) + '\n' + bvi_li, 1)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Integrated BVI into sveden: {fpath}')
