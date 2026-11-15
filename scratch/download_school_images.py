import urllib.request
import urllib.parse
import ssl
import os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    'choir_sredn.jpg': 'https://pravgimn-kovrov.ru/images/dostijenia/2025-2026/A1sredn.jpg',
    'choir_svetlyachki.jpg': 'https://pravgimn-kovrov.ru/images/dostijenia/2025-2026/A2cvetl.jpg',
    'choir_sretenie.jpg': 'https://pravgimn-kovrov.ru/images/dostijenia/2025-2026/A3sret.jpg',
    'choir_full.jpg': 'https://pravgimn-kovrov.ru/images/2022-09-01--98.jpg',
    'theater_stage1.jpg': 'https://pravgimn-kovrov.ru/images/novosti/DSC_0352-fill-650x433.jpg',
    'theater_stage2.jpg': 'https://pravgimn-kovrov.ru/images/novosti/-rpW8IKebpc-fill-650x487.jpg',
    'camp_kids.jpg': 'https://pravgimn-kovrov.ru/images/letniy_lager/3wNst4bQyls.jpg',
    'sport_team.jpg': 'https://pravgimn-kovrov.ru/images/sportclub/A1sport.jpg'
}

out_dir = 'scratch/downloaded_imgs'
os.makedirs(out_dir, exist_ok=True)

for name, url in urls.items():
    out_path = os.path.join(out_dir, name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            data = r.read()
            with open(out_path, 'wb') as f:
                f.write(data)
            im = Image.open(out_path)
            print(f"OK: {name} | {len(data)} bytes | size={im.size} | fmt={im.format}")
    except Exception as e:
        print(f"FAIL: {name} ({url}) -> {e}")
