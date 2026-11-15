import urllib.request
import urllib.parse
import ssl
import os
from bs4 import BeautifulSoup

with open('scratch/gimnazicheskaya-gazeta-dobroe-slovo.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

items = []
seen = set()
for a in soup.find_all('a', href=True):
    href = a['href']
    if href.endswith('.pdf') and href not in seen:
        seen.add(href)
        text = a.get_text(strip=True) or os.path.basename(href)
        items.append((text, href))

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'documents/newspaper'
os.makedirs(out_dir, exist_ok=True)
base = 'https://pravgimn-kovrov.ru'

downloaded = 0
for text, href in items:
    fname = os.path.basename(href)
    # create normalized name
    # e.g. №5-2013.pdf -> Dobroe_slovo_2013_05.pdf
    local_name = fname
    if fname.startswith('№') and '-' in fname:
        num, yr = fname.replace('№', '').replace('.pdf', '').split('-')
        local_name = f"Dobroe_slovo_{yr}_{int(num):02d}.pdf"
    elif 'витражи' in fname.lower():
        local_name = "Сретенские_витражи_2023.pdf"
    
    out_path = os.path.join(out_dir, local_name)
    if os.path.exists(out_path):
        continue
    
    url = base + urllib.parse.quote(href)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            data = r.read()
            with open(out_path, 'wb') as f:
                f.write(data)
            downloaded += 1
            print(f"Downloaded: {local_name} ({len(data)} bytes)")
    except Exception as e:
        print(f"Failed {local_name}: {e}")

print(f"Finished downloading {downloaded} new files.")
