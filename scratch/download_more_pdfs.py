import urllib.request
import urllib.parse
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

out_dir = 'documents/newspaper'
os.makedirs(out_dir, exist_ok=True)

more_files = [
    ('Dobroe_slovo_2015_01.pdf', '№1-2015.pdf'),
    ('Dobroe_slovo_2014_02.pdf', '№2-2014.pdf'),
    ('Dobroe_slovo_2014_01.pdf', '№1-2014.pdf'),
    ('Dobroe_slovo_2013_06.pdf', '№6-2013.pdf'),
    ('Dobroe_slovo_2012_09.pdf', '№9-2012.pdf'),
    ('Dobroe_slovo_2011_02.pdf', '№2-2011.pdf'),
    ('Dobroe_slovo_2011_10.pdf', '№10-2011.pdf')
]

base = 'https://pravgimn-kovrov.ru/attachments/article/235/'

for local_name, remote_name in more_files:
    out_path = os.path.join(out_dir, local_name)
    if os.path.exists(out_path):
        print(f"Already exists: {local_name}")
        continue
    url = base + urllib.parse.quote(remote_name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            data = r.read()
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"Downloaded: {local_name} ({len(data)} bytes)")
    except Exception as e:
        print(f"Failed {local_name}: {e}")
