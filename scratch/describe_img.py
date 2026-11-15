from PIL import Image
import numpy as np

im = Image.open(r'C:/Users/kerik/.gemini/antigravity/brain/13f49d60-01c4-4af5-96b4-d4309f96ddc4/.user_uploaded/media_1794765064350_bb72d942.png').convert('RGB')
arr = np.array(im)

for y in range(0, 715, 30):
    row = arr[y]
    non_white = np.where(np.any(row < 240, axis=-1))[0]
    if len(non_white) > 0:
        print(f"y={y}: min_x={non_white[0]}, max_x={non_white[-1]}, count={len(non_white)}")
