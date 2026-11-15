import os
from PIL import Image

src_dir = 'scratch/theater_photos'
for f in os.listdir(src_dir):
    p = os.path.join(src_dir, f)
    im = Image.open(p)
    print(f"{f}: size={im.size}, aspect={im.width/im.height:.2f}")
