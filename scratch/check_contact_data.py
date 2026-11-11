from bs4 import BeautifulSoup
soup = BeautifulSoup(open('contact.html', encoding='utf-8'), 'html.parser')
for li in soup.find_all(['li', 'p', 'div', 'a']):
    txt = li.get_text(strip=True)
    if any(k in txt.lower() for k in ['подлесн', '4-01-95', 'yandex', 'telegram', 'whatsapp', 'vk', 'вконтакте']):
        print(f'{li.name}: {txt[:100]}')
