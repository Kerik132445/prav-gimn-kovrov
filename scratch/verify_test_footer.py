import os
from bs4 import BeautifulSoup

soup = BeautifulSoup(open('scratch/test_footer.html', encoding='utf-8'), 'html.parser')

print('--- CHECKING LINKS ---')
for a in soup.find_all('a'):
    href = a.get('href', '')
    if href.startswith('#') or href.startswith('tel:') or href.startswith('mailto:') or href.startswith('http'):
        print(f'External / anchor: {a.get_text(strip=True)[:25]} -> {href}')
    else:
        # resolve relative to scratch/
        real_path = os.path.normpath(os.path.join('scratch', href.split('#')[0]))
        exists = os.path.exists(real_path)
        print(f'Relative link: {a.get_text(strip=True)[:25]} -> {href} (exists: {exists})')

print('\n--- CHECKING IMAGES ---')
for img in soup.find_all('img'):
    src = img.get('src', '')
    real_path = os.path.normpath(os.path.join('scratch', src))
    exists = os.path.exists(real_path)
    print(f'Image: {src} (exists: {exists})')
