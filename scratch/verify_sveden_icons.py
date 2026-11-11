with open('sveden/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'src="(\.\./assets/icons/sveden/[^"]+)"', text)
print(f'Total sveden unified icons found: {len(matches)}')
for m in matches:
    print(' -', m)
