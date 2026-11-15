with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find all blocks mentioning newspaper-grid
blocks = re.findall(r'([^{}]*\{[^{}]*newspaper-grid[^{}]*\})', text, re.DOTALL)
print("Blocks containing newspaper-grid:", len(blocks))
for b in blocks:
    print(b)
    print("="*30)
