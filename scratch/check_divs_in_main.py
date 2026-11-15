with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
idx = text.find('<main')
idx2 = text.find('id="newspaper"')
main_content = text[idx:idx2]

for m in re.finditer(r'<div[^>]*>', main_content):
    print(m.group(0))
