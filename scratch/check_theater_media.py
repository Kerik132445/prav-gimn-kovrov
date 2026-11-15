with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(<div class="club-card-major__media">.*?</div>\s*</div>\s*</article>)', text, re.DOTALL)
if m:
    print(m.group(1))
