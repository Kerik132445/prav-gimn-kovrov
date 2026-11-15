from bs4 import BeautifulSoup

with open('life.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

grid = soup.find(id='newspaper-grid')
for year in ['2023', '2015', '2014', '2013', '2012', '2011']:
    cards = grid.find_all('article', attrs={'data-year': year})
    print(f"Year {year}: {len(cards)} cards")
    for c in cards[:2]:
        print(f"  {c.get('class')} | title: {c.find('h4').text.strip()} | style: {c.get('style')}")
