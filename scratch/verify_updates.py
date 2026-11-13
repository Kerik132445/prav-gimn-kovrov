import glob, os, re

root = r'c:\Users\kerik\krytoi_site'
html_files = sorted(glob.glob(os.path.join(root, '*.html')) + glob.glob(os.path.join(root, 'sveden', '*.html')))

print("=== 1. CHECK TELEGRAM BUTTONS ===")
tg_buttons = []
max_buttons = []
for hf in html_files:
    rel = os.path.relpath(hf, root)
    with open(hf, 'r', encoding='utf-8') as f:
        text = f.read()
    if 'Написать в Telegram' in text or 'TG_vector.svg' in text:
        tg_buttons.append(rel)
    if 'Написать в MAX' in text or 'max_vector.svg' in text:
        max_buttons.append(rel)
print(f"Remaining Telegram buttons: {len(tg_buttons)} -> {tg_buttons}")
print(f"MAX buttons found: {len(max_buttons)} -> {max_buttons[:5]}... ({len(max_buttons)} total)")

print("\n=== 2. CHECK VK LINKS ===")
vk_exact = []
vk_plain = []
for hf in html_files:
    rel = os.path.relpath(hf, root)
    with open(hf, 'r', encoding='utf-8') as f:
        text = f.read()
    # check for exact vk group
    if 'https://vk.com/pravgimn_kovrov' in text:
        vk_exact.append(rel)
    # check if plain vk.com remains
    plain = re.findall(r'href=["\']https://vk\.com/?["\']', text)
    if plain:
        vk_plain.append((rel, plain))
print(f"Pages with https://vk.com/pravgimn_kovrov: {len(vk_exact)}")
print(f"Pages with plain https://vk.com remaining: {len(vk_plain)} -> {vk_plain}")

print("\n=== 3. CHECK FOOD.HTML RESPONSIBLE PERSON ===")
food_path = os.path.join(root, 'food.html')
with open(food_path, 'r', encoding='utf-8') as f:
    food_text = f.read()
for i, line in enumerate(food_text.splitlines()):
    if any(k in line for k in ['Ответственный за питание', 'Ткаченко', 'Кузнецова']):
        print(f"food.html:{i+1} {line.strip()}")

print("\n=== 4. CHECK DAIRY.HTML REFERENCES ===")
dairy_refs = []
for hf in html_files:
    rel = os.path.relpath(hf, root)
    if rel == 'dairy.html':
        continue
    with open(hf, 'r', encoding='utf-8') as f:
        text = f.read()
    if 'dairy.html' in text:
        dairy_refs.append(rel)
print(f"Pages linking to dairy.html (excluding redirect file): {len(dairy_refs)} -> {dairy_refs}")

print("\n=== 5. CHECK SVG COLORS ===")
with open(os.path.join(root, 'assets', 'icons', 'max_vector.svg'), 'r', encoding='utf-8') as f:
    m_svg = f.read()
print("max_vector.svg has fill=#2563EB:", 'fill="#2563EB"' in m_svg)

with open(os.path.join(root, 'assets', 'icons', 'wtp_vector.svg'), 'r', encoding='utf-8') as f:
    w_svg = f.read()
print("wtp_vector.svg has fill=#2563EB:", 'fill="#2563EB"' in w_svg)
