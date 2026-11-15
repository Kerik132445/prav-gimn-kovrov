with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find all occurrences of newspaper-grid
for m in re.finditer(r'newspaper-grid', text):
    start = max(0, m.start() - 300)
    end = min(len(text), m.end() + 300)
    print("--- OCCURRENCE at", m.start(), "---")
    print(text[start:end])
