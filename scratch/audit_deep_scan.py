import os, glob, re, json
from bs4 import BeautifulSoup

root = r'c:\Users\kerik\krytoi_site'

print("=== 1. PHONES & EMAILS AUDIT ===")
html_files = sorted(glob.glob(os.path.join(root, '*.html')) + glob.glob(os.path.join(root, 'sveden', '*.html')) + glob.glob(os.path.join(root, 'admin', '*.html')))

phone_patterns = set()
email_patterns = set()
address_patterns = set()

for fpath in html_files:
    rel = os.path.relpath(fpath, root)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    # phones
    tels = re.findall(r'href=["\']tel:([^"\']+)["\']', text)
    for t in tels:
        phone_patterns.add((rel, t))
    
    # emails
    mails = re.findall(r'href=["\']mailto:([^"\']+)["\']', text)
    for m in mails:
        email_patterns.add((rel, m))
        
    # check mentions of street/address
    if 'соснов' in text.lower():
        address_patterns.add((rel, 'Сосновая'))
    if 'подлесн' in text.lower():
        address_patterns.add((rel, 'Подлесная'))

print("Phone links found:")
for r, p in sorted(phone_patterns):
    print(f"  {r}: {p}")

print("\nMail links found:")
for r, m in sorted(email_patterns):
    print(f"  {r}: {m}")

print("\nAddress mentions:")
for r, a in sorted(address_patterns):
    print(f"  {r}: {a}")

print("\n=== 2. LEADERSHIP & NAMES AUDIT ===")
for fpath in html_files:
    rel = os.path.relpath(fpath, root)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    for name in ['Бунтилов', 'Козлов', 'Кузнецова', 'Зуйкова', 'Андреева', 'Андреев', 'Ткаченко', 'Иванов', 'Петров', 'Сидоров']:
        if name.lower() in text.lower():
            # find line
            for i, line in enumerate(text.splitlines()):
                if name.lower() in line.lower():
                    print(f"  {rel}:{i+1} mentions {name}: {line.strip()[:100]}")

print("\n=== 3. BACKEND & SECURITY AUDIT ===")
backend_dir = os.path.join(root, 'backend')
py_files = sorted(glob.glob(os.path.join(backend_dir, '**', '*.py'), recursive=True))

for pf in py_files:
    rel = os.path.relpath(pf, root)
    with open(pf, 'r', encoding='utf-8') as f:
        content = f.read()
    # Check secrets, CORS, cookies
    if 'SECRET_KEY' in content or 'secret' in content.lower():
        for i, line in enumerate(content.splitlines()):
            if 'secret' in line.lower() and not line.strip().startswith('#'):
                print(f"  {rel}:{i+1} Secret ref: {line.strip()[:100]}")
    if 'CORS' in content or 'allow_origins' in content:
        for i, line in enumerate(content.splitlines()):
            if 'origin' in line.lower():
                print(f"  {rel}:{i+1} CORS ref: {line.strip()[:100]}")
    if 'httponly' in content.lower() or 'samesite' in content.lower() or 'secure' in content.lower():
        for i, line in enumerate(content.splitlines()):
            if any(k in line.lower() for k in ['httponly', 'samesite', 'secure']):
                print(f"  {rel}:{i+1} Cookie security: {line.strip()[:100]}")

print("\n=== 4. BVI ACCESSIBILITY SCRIPT AUDIT ===")
bvi_js = os.path.join(root, 'js', 'bvi.js')
if os.path.exists(bvi_js):
    with open(bvi_js, 'r', encoding='utf-8') as f:
        bvi_code = f.read()
    print("BVI JS size:", len(bvi_code))
    print("Has font size toggle:", 'font' in bvi_code.lower() or 'size' in bvi_code.lower())
    print("Has color scheme toggle:", 'color' in bvi_code.lower() or 'theme' in bvi_code.lower() or 'scheme' in bvi_code.lower())
    print("Has images toggle:", 'image' in bvi_code.lower() or 'img' in bvi_code.lower())
    print("Has sound / speech toggle:", 'speech' in bvi_code.lower() or 'synth' in bvi_code.lower() or 'audio' in bvi_code.lower())
    print("Has keyboard nav handling:", 'keydown' in bvi_code.lower() or 'keyup' in bvi_code.lower())
