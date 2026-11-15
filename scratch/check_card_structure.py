from bs4 import BeautifulSoup

with open('life.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

grid = soup.find(id='newspaper-grid')
cards = grid.find_all('article')
print(f"Total cards: {len(cards)}")

for c in cards:
    yr = c.get('data-year')
    cls = c.get('class')
    parent = c.parent.get('id') or c.parent.get('class')
    # print if any card has different structure
    divs = len(c.find_all('div'))
    links = len(c.find_all('a'))
    buttons = len(c.find_all('button'))
    if divs != 10 or links != 3 or buttons != 1:
        print(f"Anomaly in {c.find('h4').text.strip()}: divs={divs}, links={links}, buttons={buttons}")
