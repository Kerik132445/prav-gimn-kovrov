import os, glob
from PIL import Image

heavy_images = []
for ext in ['*.png', '*.jpg', '*.jpeg']:
    for f in glob.glob(f'assets/**/*.{ext[2:]}', recursive=True):
        sz = os.path.getsize(f)
        if sz >= 100 * 1024:
            heavy_images.append(f)

test_webp_dir = 'scratch/test_webp'
os.makedirs(test_webp_dir, exist_ok=True)

total_orig = 0
total_webp = 0

for img_path in heavy_images[:10]:
    sz = os.path.getsize(img_path)
    total_orig += sz
    im = Image.open(img_path)
    out_name = os.path.join(test_webp_dir, os.path.basename(img_path).rsplit('.', 1)[0] + '.webp')
    im.save(out_name, 'WEBP', quality=82, method=6)
    out_sz = os.path.getsize(out_name)
    total_webp += out_sz
    print(f'{os.path.basename(img_path)}: {sz / 1024:.1f} KB -> {out_sz / 1024:.1f} KB ({(1 - out_sz/sz)*100:.1f}% reduction)')

print(f'\nTop 10 total: {total_orig / 1024 / 1024:.2f} MB -> {total_webp / 1024 / 1024:.2f} MB')
