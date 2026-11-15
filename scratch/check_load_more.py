with open('js/life.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'.*load-more.*', text, re.IGNORECASE)
for m in matches[:10]:
    print(m)
