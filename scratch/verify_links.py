import os, re

broken = []
total_links = 0

for root, dirs, files in os.walk('.'):
    if '.git' in root or 'venv' in root or 'scratch' in root or '__pycache__' in root:
        continue
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            matches = re.findall(r'(?:href|src|data-pdf)=["\']([^"\']*documents/[^"\']+)["\']', content)
            for m in matches:
                total_links += 1
                base_dir = os.path.dirname(path)
                target = os.path.normpath(os.path.join(base_dir, m))
                if not os.path.exists(target):
                    broken.append((path, m, target))

print(f"Total document links found in HTML: {total_links}")
print(f"Broken document links: {len(broken)}")
for p, link, target in broken[:10]:
    print(f"  IN {p}: {link} -> {target}")
