with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(<article class="newspaper-card[^>]*data-year="2014".*?</article>)', text, re.DOTALL)
if m:
    print(m.group(1))
