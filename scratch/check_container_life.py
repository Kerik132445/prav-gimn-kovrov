with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'([^{}]*container_life[^{}]*)\{([^}]*)\}', text)
for m in matches:
    print(m.group(1).strip(), '->', m.group(2).strip())
