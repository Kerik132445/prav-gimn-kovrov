from bs4 import BeautifulSoup

with open('life.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

grid = soup.find(id='newspaper-grid')
if not grid:
    print("newspaper-grid NOT FOUND!")
else:
    articles = grid.find_all('article', class_='newspaper-card', recursive=False)
    all_articles = grid.find_all('article', class_='newspaper-card')
    print(f"Direct child articles: {len(articles)}")
    print(f"All descendant articles: {len(all_articles)}")
    
    # Check if there are other children
    children = [child.name for child in grid.children if child.name]
    print(f"Grid children count: {len(children)}")
    print("Unique children tag names:", set(children))
    
    # Check year distribution
    years = {}
    for a in articles:
        yr = a.get('data-year')
        years[yr] = years.get(yr, 0) + 1
    print("Years distribution in direct children:", sorted(years.items()))
