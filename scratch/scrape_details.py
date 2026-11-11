# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import ssl
import re
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls_to_scrape = [
    ("osnovnye_svedeniya", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/osnovnye-svedeniya.html"),
    ("blagotvoriteli", "https://pravgimn-kovrov.ru/razvitie/informatsiya-dlya-blagotvoritelej.html"),
    ("obrazovanie", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/obrazovanie.html"),
    ("platnye", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/platnye-obrazovatelnye-uslugi.html"),
    ("finansy", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/finansovo-khozyajstvennaya-deyatelnost.html"),
    ("pitanie", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/pitanie-shkolnikov.html"),
    ("roditelyam", "https://pravgimn-kovrov.ru/vospitanie/roditelyam.html"),
    ("vakansii", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/vakantnye-mesta-dlya-priema-perevoda.html"),
    ("dokumenty", "https://pravgimn-kovrov.ru/svedeniya-ob-obrazovatelnoj-organizatsii/dokumenty.html")
]

results = {}

for name, url in urls_to_scrape:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # Extract plain text from article/content
            # Remove scripts & styles
            clean = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
            clean = re.sub(r'<style.*?</style>', '', clean, flags=re.DOTALL)
            
            # Find all attachments or documents (PDF, DOCX, XLS)
            files = re.findall(r'href=[\'"]([^\'"]+\.(?:pdf|docx|doc|xlsx|xls))[\'"]', clean, re.IGNORECASE)
            full_files = [urllib.parse.urljoin(url, f) for f in files]
            
            # Simple text conversion
            text = re.sub(r'<[^>]+>', ' ', clean)
            text = re.sub(r'\s+', ' ', text).strip()
            
            results[name] = {
                "url": url,
                "text": text[:3000], # first 3000 chars of text
                "files": list(set(full_files))
            }
            print(f"Scraped {name}: {len(full_files)} files found")
    except Exception as e:
        print(f"Error scraping {name}: {e}")

with open("scratch/scraped_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved to scratch/scraped_data.json")
