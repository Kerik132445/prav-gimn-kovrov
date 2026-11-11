from bs4 import BeautifulSoup
soup = BeautifulSoup(open('index.html', encoding='utf-8'), 'html.parser')
for a in soup.find_all('a'):
    href = a.get('href', '')
    txt = a.get_text(strip=True)
    if 'новост' in txt.lower() or 'news' in href.lower():
        print(f'{txt} -> {href}')
