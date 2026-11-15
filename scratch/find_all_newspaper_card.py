with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'([^{}]*newspaper-card[^{}]*)\{([^}]*)\}', text)
for m in matches:
    print('SELECTOR:', m.group(1).strip())
    print('RULES:', m.group(2).strip()[:100])
    print('---')
