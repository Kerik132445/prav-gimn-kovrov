import glob, re, os

print("==================================================")
print("1. PLACEHOLDERS CHECK (sveden-placeholder):")
placeholders = 0
for fpath in glob.glob('sveden/*.html') + glob.glob('*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    cnt = c.count('sveden-placeholder')
    if cnt > 0:
        print(f'  {fpath}: {cnt} placeholder(s)')
        placeholders += cnt
if placeholders == 0:
    print("  -> None found! All pages are clean.")

print("\n==================================================")
print("2. FAKE DATA & MOCK STRINGS:")
patterns = ['chatgpt.com', 'sosnovaya', 'example.com', 'example@main.ru', '+70000000000', 'tel:+7492320000', '1023300000000', '3305000000']
found_mocks = 0
for fpath in glob.glob('*.html') + glob.glob('sveden/*.html'):
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    for p in patterns:
        if p.lower() in c.lower():
            print(f'  {fpath} contains "{p}"')
            found_mocks += 1
if found_mocks == 0:
    print("  -> None found! Clean.")

print("\n==================================================")
print("3. LEGAL REQUISITES CHECK:")
with open('contact.html', 'r', encoding='utf-8') as f:
    c = f.read()
assert '1043302208223' in c, "OGRN missing in contact.html"
assert '3305051862' in c, "INN missing in contact.html"
assert '40703810810000000118' in c, "RS missing in contact.html"
print("  -> contact.html requisites verified!")

print("\n==================================================")
print("4. FINANCIAL REPORT PDF:")
assert os.path.exists('documents/Отчет-ФХД-2025.pdf'), "Missing documents/Отчет-ФХД-2025.pdf"
print("  -> documents/Отчет-ФХД-2025.pdf exists (size:", os.path.getsize('documents/Отчет-ФХД-2025.pdf'), "bytes)")

print("\n==================================================")
print("5. ACCESSIBILITY (BVI) CHECK:")
assert os.path.exists('css/bvi.css'), "css/bvi.css missing"
assert os.path.exists('js/bvi.js'), "js/bvi.js missing"
print("  -> BVI files present!")

print("\n==================================================")
print("6. PRIVACY POLICY CHECK:")
assert os.path.exists('policy.html'), "policy.html missing"
print("  -> policy.html exists!")

print("\nALL CHECKS COMPLETED!")
