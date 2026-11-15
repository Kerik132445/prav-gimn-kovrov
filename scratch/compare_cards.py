from bs4 import BeautifulSoup

with open(r'c:\Users\kerik\krytoi_site\life.html', 'r', encoding='utf-8') as f:
    raw_html = f.read()

# Let's check with html5lib or lxml or standard parser if any article is nested inside another article
soup = BeautifulSoup(raw_html, 'html.parser')
grid = soup.find(id='newspaper-grid')

# Check if any article contains another article
nested = grid.find_all(lambda tag: tag.name == 'article' and tag.find('article') is not None)
print("Articles with nested articles:", len(nested))

# Check depth of all articles
for i, a in enumerate(grid.find_all('article')):
    parents = [p.name for p in a.parents]
    if parents[0] != 'div' or a.parent.get('id') != 'newspaper-grid':
        print(f"Card {i+1} parent is {parents[0]} (id={a.parent.get('id')}), not newspaper-grid!")
