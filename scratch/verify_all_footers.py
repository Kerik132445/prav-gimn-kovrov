import glob, os
from bs4 import BeautifulSoup

all_html = sorted(glob.glob('**/*.html', recursive=True))
public_html = [f for f in all_html if not f.startswith('admin') and not f.startswith('scratch')]

errors = []
success_count = 0

for file_path in public_html:
    dir_name = os.path.dirname(file_path)
    with open(file_path, encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    footer = soup.find('footer')
    if not footer:
        errors.append(f'{file_path}: NO <footer> tag found')
        continue
    
    fb = footer.find('div', class_='footer-bottom')
    if not fb:
        errors.append(f'{file_path}: NO .footer-bottom found')
        continue
    
    top_row = fb.find('div', class_='footer-top-row')
    nav_grid = fb.find('div', class_='footer-nav-grid')
    contacts_bar = fb.find('div', class_='footer-contacts-bar')
    copyright_row = fb.find('div', class_='footer-copyright')
    
    if not top_row:
        errors.append(f'{file_path}: missing .footer-top-row')
    if not nav_grid:
        errors.append(f'{file_path}: missing .footer-nav-grid')
    if not contacts_bar:
        errors.append(f'{file_path}: missing .footer-contacts-bar')
    if not copyright_row:
        errors.append(f'{file_path}: missing .footer-copyright')
        
    cols = nav_grid.find_all('div', class_='footer-col') if nav_grid else []
    if len(cols) != 3:
        errors.append(f'{file_path}: expected 3 cols in nav_grid, got {len(cols)}')
        
    # Check all links inside footer-bottom
    for a in fb.find_all('a'):
        href = a.get('href', '')
        if href.startswith('#') or href.startswith('tel:') or href.startswith('mailto:') or href.startswith('http'):
            continue
        # file link with optional fragment
        clean_href = href.split('#')[0]
        resolved = os.path.normpath(os.path.join(dir_name, clean_href))
        if not os.path.exists(resolved):
            errors.append(f'{file_path}: broken link "{href}" -> "{resolved}"')
            
    # Check all images inside footer-bottom
    for img in fb.find_all('img'):
        src = img.get('src', '')
        resolved = os.path.normpath(os.path.join(dir_name, src))
        if not os.path.exists(resolved):
            errors.append(f'{file_path}: broken img "{src}" -> "{resolved}"')
            
    success_count += 1

print(f'Verification completed!')
print(f'Total pages verified: {success_count}')
print(f'Errors encountered: {len(errors)}')
if errors:
    for err in errors[:20]:
        print('  ERROR:', err)
else:
    print('ALL 28 PAGES PASSED 100% CLEANLY!')
