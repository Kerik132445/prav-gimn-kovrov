with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(@media[^{]+\{[^}]*newspaper-grid[^}]*\})', text)
print("Media queries with newspaper-grid:")
for m in matches:
    print(m)
