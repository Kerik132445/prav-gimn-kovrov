from bs4 import BeautifulSoup

with open(r'c:\Users\kerik\krytoi_site\life.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

grid = soup.find(id='newspaper-grid')
if not grid:
    print("newspaper-grid not found!")
else:
    direct_children = list(grid.children)
    element_children = [c for c in direct_children if getattr(c, 'name', None)]
    print(f"Direct element children in newspaper-grid: {len(element_children)}")
    non_articles = [c for c in element_children if c.name != 'article']
    print(f"Non-article children: {len(non_articles)}")
    if non_articles:
        for na in non_articles:
            print(f"Tag: {na.name}, class: {na.get('class')}")
    else:
        print("All direct children are <article>!")

    for i, a in enumerate(element_children):
        print(f"Card {i+1}: data-year={a.get('data-year')}, title={a.find('h4').get_text(strip=True) if a.find('h4') else 'No h4'}")
