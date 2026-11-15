import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

files = [
    'Сретенские витражи №1.pdf',
    '№3-2015.pdf',
    '№2-2015.pdf',
    '№1-2015.pdf',
    '№3-2014.pdf',
    '№6-2013.pdf',
    '№9-2012.pdf',
    '№1-2011.pdf'
]

base = 'https://pravgimn-kovrov.ru/attachments/article/235/'

for f in files:
    url = base + urllib.parse.quote(f)
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            cl = r.headers.get('Content-Length')
            print(f"{f}: {int(cl)/1024/1024:.2f} MB" if cl else f"{f}: length unknown")
    except Exception as e:
        print(f"Error {f}: {e}")
