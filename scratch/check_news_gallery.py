with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(\.news-gallery[^{]*{[^}]+})', text)
for m in matches[:10]:
    print(m)

matches2 = re.findall(r'(\.timeline-item__gallery[^{]*{[^}]+})', text)
for m in matches2[:5]:
    print(m)
