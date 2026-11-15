with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'([^\n]+\n[^\n]+\n[^\n]*<section class="newspaper-section"[^\n]*\n[^\n]+)', text)
if m:
    print(m.group(0))
