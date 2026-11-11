import os, glob
from PIL import Image

heavy_images = []
for ext in ['*.png', '*.jpg', '*.jpeg']:
    for f in glob.glob(f'assets/**/*.{ext[2:]}', recursive=True):
        sz = os.path.getsize(f)
        if sz >= 100 * 1024:  # >= 100 KB
            heavy_images.append((f, sz))

heavy_images.sort(key=lambda x: x[1], reverse=True)
total_orig = sum(x[1] for x in heavy_images)

print(f'Total heavy images (>= 100 KB): {len(heavy_images)}')
print(f'Total original size: {total_orig / 1024 / 1024:.2f} MB')
