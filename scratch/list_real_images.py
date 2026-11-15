import os
from bs4 import BeautifulSoup

for fname in os.listdir('scratch'):
    if fname.endswith('.html'):
        path = os.path.join('scratch', fname)
        with open(path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        main = soup.find('div', class_='item-page') or soup.body
        if not main:
            continue
        imgs = main.find_all('img')
        filtered = []
        for img in imgs:
            src = img.get('src', '')
            if any(skip in src for skip in ['logo', 'headers', 'file_icons', 'system']):
                continue
            filtered.append((src, img.get('alt', ''), img.parent.get_text(strip=True)[:60]))
        if filtered:
            print(f"=== {fname} ===")
            for src, alt, ctx in filtered:
                print(f"  Src: {src} | Alt: {alt} | Ctx: {ctx}")
