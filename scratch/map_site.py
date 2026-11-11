# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_url = "https://pravgimn-kovrov.ru"

req = urllib.request.Request(base_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Find all links
links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
clean_links = set()
for l in links:
    if l.startswith('#') or l.startswith('javascript:'):
        continue
    full = urllib.parse.urljoin(base_url, l)
    if 'pravgimn-kovrov.ru' in full:
        clean_links.add(full)

print(f"Total links on main page: {len(clean_links)}")
for l in sorted(clean_links):
    print(" ", l)
