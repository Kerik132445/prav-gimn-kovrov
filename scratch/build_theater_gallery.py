import os
from PIL import Image

src_dir = 'scratch/theater_photos'
dst_dir = 'assets/images/clubs/theater'
os.makedirs(dst_dir, exist_ok=True)

photos = [
    ('DSC_0352-fill-650x433.jpg', 'theater-1.webp', (800, 533)),
    ('-rpW8IKebpc-fill-650x487.jpg', 'theater-2.webp', (800, 600)),
    ('13.jpg', 'theater-3.webp', (800, 432)),
    ('15.jpg', 'theater-4.webp', (800, 392)),
    ('XozJKyg8zM95sgIt4f36soAYF.jpg', 'theater-5.webp', (600, 800)),
    ('teatrgramota.jpg', 'theater-diploma.webp', (600, 850))
]

for src_name, dst_name, max_size in photos:
    p = os.path.join(src_dir, src_name)
    if not os.path.exists(p):
        print("Missing:", src_name)
        continue
    im = Image.open(p).convert('RGB')
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    out_p = os.path.join(dst_dir, dst_name)
    im.save(out_p, 'WEBP', quality=85)
    print(f"Created {out_p}: {im.size}, {os.path.getsize(out_p)} bytes")
