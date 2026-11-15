with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<div class="club-card-major__media">.*?</div>\s*</div>', text, re.DOTALL)
for m in matches:
    print(m[:400])
    print("---")
