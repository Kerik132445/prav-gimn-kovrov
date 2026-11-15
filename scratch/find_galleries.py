import os, re

for fname in os.listdir('.'):
    if fname.endswith('.html'):
        with open(fname, 'r', encoding='utf-8') as f:
            t = f.read()
        if 'gallery' in t or 'slider' in t or 'carousel' in t or 'swiper' in t:
            print(fname, 'has matches:', set(re.findall(r'class="([^"]*(?:gallery|slider|carousel|swiper)[^"]*)"', t)))
