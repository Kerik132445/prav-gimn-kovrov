with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'(\.theatre[^{]+{[^}]+})', text)
for m in matches[:5]:
    print(m)

print("...")
quote_match = re.search(r'\.club-quote[^{]+{[^}]+}', text)
print("club-quote:", quote_match.group(0) if quote_match else "None")
