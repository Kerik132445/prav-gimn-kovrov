from bs4 import BeautifulSoup
soup = BeautifulSoup(open('life.html', encoding='utf-8'), 'html.parser')
print('Title:', soup.title.string if soup.title else 'No title')
h1 = soup.find('h1')
print('H1:', h1.get_text(strip=True) if h1 else 'No H1')
for h2 in soup.find_all('h2'):
    print('H2:', h2.get_text(strip=True))
