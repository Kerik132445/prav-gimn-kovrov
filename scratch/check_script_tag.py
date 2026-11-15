with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<script[^>]*src="[^"]*life\.js[^"]*"[^>]*></script>', text)
print(matches)
