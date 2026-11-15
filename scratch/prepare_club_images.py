import os
from PIL import Image

src_dir = 'scratch/downloaded_imgs'
dst_dir = 'assets/images/clubs'
os.makedirs(dst_dir, exist_ok=True)

files = {
    'vpk_logo.png': ('vpk-logo.webp', (300, 300)),
    'choir_full.jpg': ('choir-full.webp', (1200, 800)),
    'theater_stage1.jpg': ('theater-stage-1.webp', (800, 533)),
    'theater_stage2.jpg': ('theater-stage-2.webp', (800, 533)),
    'camp_kids.jpg': ('camp-kids.webp', (1000, 667)),
    'sport_team.jpg': ('sport-team.webp', (1000, 667))
}

for src_name, (dst_name, max_size) in files.items():
    src_path = os.path.join(src_dir, src_name)
    if not os.path.exists(src_path):
        print("Missing:", src_name)
        continue
    
    im = Image.open(src_path)
    im = im.convert('RGB') if im.mode in ('RGBA', 'P') and not dst_name.endswith('.png') else im
    
    # Save optimized webp
    dst_path = os.path.join(dst_dir, dst_name)
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    im.save(dst_path, 'WEBP', quality=85)
    print(f"Created {dst_path} | Size: {im.size} | {os.path.getsize(dst_path)} bytes")
