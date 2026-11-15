with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'\.newspaper-section\s*\{', text)]
print("Total .newspaper-section { occurrences:", len(matches))
for p in matches:
    print(text[p:p+200])
    print("="*40)
