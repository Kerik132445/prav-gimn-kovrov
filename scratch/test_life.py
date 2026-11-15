from bs4 import BeautifulSoup
import os

with open('life.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# Check clubs
clubs_section = soup.find(id='clubs')
print('Clubs section found:', bool(clubs_section))
if clubs_section:
    articles = clubs_section.find_all('article')
    print('Clubs articles count:', len(articles))
    for art in articles:
        title = art.find(['h3', 'h4'])
        print('  -', title.text.strip() if title else 'No title')

# Check newspaper
newspaper_section = soup.find(id='newspaper')
print('Newspaper section found:', bool(newspaper_section))

# Check camp
camp_section = soup.find(id='camp')
print('Camp section found:', bool(camp_section))

# Check news elements for js/life.js
filters = soup.find_all(class_='filters-block__btn')
print('Filter buttons count:', len(filters))

featured = soup.find(class_='featured-news')
print('Featured news element found:', bool(featured))
print('featured-news-image found:', bool(soup.find(id='featured-news-image')))
print('featured-news-title found:', bool(soup.find(id='featured-news-title')))
print('sub-news-list found:', bool(soup.find(class_='sub-news-list')))
print('load-more-btn found:', bool(soup.find(class_='load-more-btn')))

# Check all images in life.html
images = soup.find_all('img')
print('\nChecking images on life.html:')
missing_images = []
for img in images:
    src = img.get('src')
    if src and not src.startswith('http') and not src.startswith('data:') and not src.startswith('#'):
        clean_src = src.lstrip('./')
        if not os.path.exists(clean_src):
            missing_images.append(src)
            print(f'  MISSING: {src}')
        else:
            print(f'  OK: {src}')

if not missing_images:
    print('ALL images exist on disk!')
else:
    print(f'ERROR: {len(missing_images)} missing images!')

import urllib.request
import http.server
import socketserver
import threading
import time

PORT = 8012
httpd = socketserver.TCPServer(('', PORT), http.server.SimpleHTTPRequestHandler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(0.5)

req = urllib.request.urlopen(f'http://localhost:{PORT}/life.html')
content = req.read().decode('utf-8')
print('\nHTTP Server Check:')
print('Status:', req.status)
print('Length:', len(content))
print('Has clubs:', 'id="clubs"' in content)
print('Has newspaper:', 'id="newspaper"' in content)
print('Has camp:', 'id="camp"' in content)
print('Has news:', 'id="news"' in content)
httpd.shutdown()
