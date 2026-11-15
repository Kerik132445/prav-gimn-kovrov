with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(<!-- 1\.3\. Хор.*?)(?=<!-- 1\.4|$)', text, re.DOTALL)
if m:
    print(m.group(1))
