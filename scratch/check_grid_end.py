with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(</div>\s*<!-- Сноска о школьной библиотеке -->)', text)
if m:
    print("Found insertion point!")
else:
    print("Insertion point not found")
