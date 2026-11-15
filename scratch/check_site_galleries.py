with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(\.gallery[^{]+{[^}]+})', text)
for m in matches[:10]:
    print(m)
print("Total gallery matches:", len(matches))
