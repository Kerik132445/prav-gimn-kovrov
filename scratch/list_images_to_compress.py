import os, glob

images = []
for ext in ['*.png', '*.jpg', '*.jpeg']:
    images.extend(glob.glob(f'assets/**/*.{ext[2:]}', recursive=True))

print(f'Total images found: {len(images)}')
for img in sorted(images, key=lambda x: os.path.getsize(x), reverse=True):
    sz = os.path.getsize(img)
    sz_kb = sz / 1024
    sz_mb = sz_kb / 1024
    if sz_mb >= 1.0:
        print(f'{img}: {sz_mb:.2f} MB ({sz} bytes)')
    elif sz_kb >= 100:
        print(f'{img}: {sz_kb:.1f} KB ({sz} bytes)')
    else:
        print(f'{img}: {sz_kb:.1f} KB')
