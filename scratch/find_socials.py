import glob, re
from bs4 import BeautifulSoup

for f in sorted(glob.glob('**/*.html', recursive=True)):
    soup = BeautifulSoup(open(f, encoding='utf-8', errors='ignore'), 'html.parser')
    for a in soup.find_all('a'):
        href = a.get('href', '')
        if any(k in href.lower() for k in ['vk.com', 't.me', 'wa.me', 'whatsapp', 'telegram', 'sferum']):
            print(f'{f}: {a.get_text(strip=True)} -> {href}')
