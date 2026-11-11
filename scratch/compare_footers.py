import glob, re
from bs4 import BeautifulSoup

for f in sorted(glob.glob('**/*.html', recursive=True)):
    with open(f, encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    m = re.search(r'(<footer[\s\S]*?</footer>)', c)
    if m:
        soup = BeautifulSoup(m.group(1), 'html.parser')
        bottom = soup.find('div', class_='footer-bottom')
        copy = soup.find('div', class_='footer-copyright')
        has_contacts = bool(soup.find('div', class_='footer-contacts'))
        nav_items = [a.get_text(strip=True) for a in soup.find_all('li', class_=re.compile(r'nav__list'))]
        print(f'{f:25} | contacts: {str(has_contacts):5} | bottom: {bool(bottom)} | copy: {bool(copy)} | navs: {len(nav_items)}')
