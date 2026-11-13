import os, glob, re, shutil

root = r'c:\Users\kerik\krytoi_site'

print("=== STEP 1: ASSETS & DIARY SETUP ===")
# 1. Ensure max_vector.svg has fill="#2563EB"
max_svg_path = os.path.join(root, 'assets', 'icons', 'max_vector.svg')
if os.path.exists(max_svg_path):
    with open(max_svg_path, 'r', encoding='utf-8') as f:
        max_content = f.read()
    if 'fill="#2563EB"' not in max_content:
        max_content = re.sub(r'fill="[^"]+"', 'fill="#2563EB"', max_content)
        with open(max_svg_path, 'w', encoding='utf-8') as f:
            f.write(max_content)
    print("max_vector.svg verified (fill=#2563EB).")

# 2. Ensure wtp_vector.svg has fill="#2563EB"
wtp_svg_path = os.path.join(root, 'assets', 'icons', 'wtp_vector.svg')
with open(wtp_svg_path, 'r', encoding='utf-8') as f:
    wtp_content = f.read()
if 'fill="#2563EB"' not in wtp_content:
    wtp_content = re.sub(r'fill="[^"]+"', 'fill="#2563EB"', wtp_content)
    with open(wtp_svg_path, 'w', encoding='utf-8') as f:
        f.write(wtp_content)
print("wtp_vector.svg verified (fill=#2563EB).")

# 3. Copy dairy.svg to diary.svg
dairy_svg = os.path.join(root, 'assets', 'icons', 'dairy.svg')
diary_svg = os.path.join(root, 'assets', 'icons', 'diary.svg')
if os.path.exists(dairy_svg):
    shutil.copy2(dairy_svg, diary_svg)
    print("Copied dairy.svg to diary.svg.")

# 4. Copy dairyAnimations.js to diaryAnimations.js
dairy_anim = os.path.join(root, 'js', 'dairyAnimations.js')
diary_anim = os.path.join(root, 'js', 'diaryAnimations.js')
if os.path.exists(dairy_anim):
    shutil.copy2(dairy_anim, diary_anim)
    print("Copied dairyAnimations.js to diaryAnimations.js.")

# 5. Create diary.html from dairy.html
dairy_html = os.path.join(root, 'dairy.html')
diary_html = os.path.join(root, 'diary.html')
with open(dairy_html, 'r', encoding='utf-8') as f:
    dairy_content = f.read()

# Update references inside diary.html
diary_content = dairy_content.replace('href="dairy.html"', 'href="diary.html"')
diary_content = diary_content.replace('dairyAnimations.js', 'diaryAnimations.js')
with open(diary_html, 'w', encoding='utf-8') as f:
    f.write(diary_content)
print("Created diary.html.")

# Set dairy.html to redirect to diary.html
redirect_html = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=diary.html">
    <title>Перенаправление...</title>
</head>
<body>
    <p>Если перенаправление не произошло, перейдите в <a href="diary.html">Электронный дневник</a>.</p>
</body>
</html>
'''
with open(dairy_html, 'w', encoding='utf-8') as f:
    f.write(redirect_html)
print("dairy.html updated with instant redirect to diary.html.")

print("\n=== STEP 2: UPDATE REFERENCES IN HTML AND JS ===")
html_files = sorted(glob.glob(os.path.join(root, '*.html')) + glob.glob(os.path.join(root, 'sveden', '*.html')))

for hf in html_files:
    rel = os.path.relpath(hf, root)
    if rel == 'dairy.html':
        continue
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # 1. Update dairy.html links
    if 'sveden' in rel:
        content = content.replace('href="../dairy.html"', 'href="../diary.html"')
        content = content.replace("href='../dairy.html'", "href='../diary.html'")
    else:
        content = content.replace('href="dairy.html"', 'href="diary.html"')
        content = content.replace("href='dairy.html'", "href='diary.html'")
        content = content.replace('href="./dairy.html"', 'href="./diary.html"')
        content = content.replace('assets/icons/dairy.svg', 'assets/icons/diary.svg')

    # 2. Update VK link in footer: https://vk.com -> https://vk.com/pravgimn_kovrov
    # Make sure we don't double replace
    content = re.sub(
        r'href=["\']https://vk\.com/?["\'](\s+target=["\']_blank["\']|\s+rel=|\s+aria-label=)',
        r'href="https://vk.com/pravgimn_kovrov"\1',
        content
    )
    # Also catch <a href="https://vk.com" target=...
    content = content.replace('href="https://vk.com"', 'href="https://vk.com/pravgimn_kovrov"')

    # 3. Update Contacts block buttons: Telegram -> MAX
    # Handle root files vs sveden files
    if 'sveden' in rel:
        # Pattern for sveden: ../assets/icons/TG_vector.svg
        content = re.sub(
            r'<img\s+src=["\']\.\./assets/icons/TG_vector\.svg["\']\s+alt=["\'][^"\']*["\']\s*/?>\s*Написать в Telegram',
            r'<img src="../assets/icons/max_vector.svg" alt="MAX вектор">\n\t\t\t\t\t\tНаписать в MAX',
            content
        )
        content = re.sub(
            r'<img\s+alt=["\'][^"\']*["\']\s+src=["\']\.\./assets/icons/TG_vector\.svg["\']\s*/?>\s*Написать в Telegram',
            r'<img src="../assets/icons/max_vector.svg" alt="MAX вектор">\n\t\t\t\t\t\tНаписать в MAX',
            content
        )
    else:
        content = re.sub(
            r'<img\s+src=["\']assets/icons/TG_vector\.svg["\']\s+alt=["\'][^"\']*["\']\s*/?>\s*Написать в Telegram',
            r'<img src="assets/icons/max_vector.svg" alt="MAX вектор">\n\t\t\t\t\t\tНаписать в MAX',
            content
        )
        content = re.sub(
            r'<img\s+alt=["\'][^"\']*["\']\s+src=["\']assets/icons/TG_vector\.svg["\']\s*/?>\s*Написать в Telegram',
            r'<img src="assets/icons/max_vector.svg" alt="MAX вектор">\n\t\t\t\t\t\tНаписать в MAX',
            content
        )

    # 4. In food.html: Replace Tkachenko with Kuznetsova
    if rel == 'food.html':
        content = content.replace(
            '<strong>Ответственный за питание:</strong> Ткаченко Ирина Николаевна (зам. директора по УВР)',
            '<strong>Ответственный за питание:</strong> Кузнецова С.И. (зам. директора по УВР)'
        )
        content = content.replace(
            'Ткаченко Ирина Николаевна',
            'Кузнецова С.И.'
        )

    if content != orig:
        with open(hf, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {rel}")

# Update JS files
nav_js = os.path.join(root, 'js', 'navigation.js')
if os.path.exists(nav_js):
    with open(nav_js, 'r', encoding='utf-8') as f:
        n_content = f.read()
    n_content = n_content.replace('link: "dairy.html"', 'link: "diary.html"')
    n_content = n_content.replace('icon: "assets/icons/dairy.svg"', 'icon: "assets/icons/diary.svg"')
    with open(nav_js, 'w', encoding='utf-8') as f:
        f.write(n_content)
    print("Updated js/navigation.js")

search_js = os.path.join(root, 'js', 'search.js')
if os.path.exists(search_js):
    with open(search_js, 'r', encoding='utf-8') as f:
        s_content = f.read()
    s_content = s_content.replace('url: "dairy.html"', 'url: "diary.html"')
    with open(search_js, 'w', encoding='utf-8') as f:
        f.write(s_content)
    print("Updated js/search.js")

print("\n=== FINISHED MIGRATION SCRIPT ===")
