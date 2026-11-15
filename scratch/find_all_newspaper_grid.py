with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'\.newspaper-grid', text)]
for pos in matches:
    print("MATCH at", pos)
    print(text[pos-150:pos+150])
    print("="*40)
