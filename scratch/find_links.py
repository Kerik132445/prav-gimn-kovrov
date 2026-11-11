import re
from bs4 import BeautifulSoup

soup = BeautifulSoup(open('index.html', encoding='utf-8'), 'html.parser')
for a in soup.find_all('a'):
    href = a.get('href', '')
    text = a.get_text(strip=True)
    if any(k in text.lower() or k in href.lower() for k in ['дневник', 'dairy', 'diary', 'faq', 'вопрос', 'поступ', 'питан', 'распис', 'истори', 'учител', 'сведен']):
        print(f'{text} -> {href}')
