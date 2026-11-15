with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'/\* ==========================================\s+РАЗДЕЛ: ЖИЗНЬ ГИМНАЗИИ.*?$', text, re.DOTALL)
if m:
    print(m.group(0)[:1500])
