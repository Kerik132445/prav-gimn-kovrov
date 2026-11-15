with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

for sec_id in ['clubs', 'newspaper', 'camp']:
    match = re.search(r'(<section[^>]*id="' + sec_id + r'".*?</section>)', text, re.DOTALL)
    if match:
        print(f"=== {sec_id.upper()} ===")
        print(match.group(1)[:1500])
        print("...\n")
