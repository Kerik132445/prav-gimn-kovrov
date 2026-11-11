with open('index.html', encoding='utf-8') as f:
    text = f.read()
print('id="faq" present:', 'id="faq"' in text)
import re
m = re.search(r'<[^>]+id="faq"[^>]*>', text)
if m:
    print('Element:', m.group(0))
