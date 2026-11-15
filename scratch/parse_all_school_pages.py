import os
from bs4 import BeautifulSoup

files = [
    'vospitanie.html',
    'kruzhki-i-sektsii.html',
    'shkolnyj-teatr.html',
    'khorovoj-kollektiv.html',
    'letnij-lager.html',
    'sportivnyj-klub.html',
    'muzykalnye-shkoly.html',
    'gimnazicheskaya-gazeta-dobroe-slovo.html'
]

for fname in files:
    path = os.path.join('scratch', fname)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract main content
    main = soup.find('div', class_='item-page') or soup.find('main') or soup.body
    print(f"================== {fname} ==================")
    title = soup.find('h1') or soup.find('h2')
    print("Title:", title.get_text(strip=True) if title else "N/A")
    
    # Print paragraphs / text summary
    if main:
        text = ' '.join(main.stripped_strings)
        print("Text snippet:", text[:500])
        links = [a['href'] for a in main.find_all('a', href=True) if not a['href'].startswith('javascript')]
        if links:
            print("Links:", links[:10])
    print()
