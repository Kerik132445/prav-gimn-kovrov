import cv2

img = cv2.imread(r'c:\Users\kerik\krytoi_site\assets\icons\images-Photoroom.png', cv2.IMREAD_UNCHANGED)
alpha = img[:, :, 3]
contours, hierarchy = cv2.findContours(alpha, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_L1)

svg_paths = []
for c in contours:
    epsilon = 0.0008 * cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, epsilon, True)
    d = []
    for i, pt in enumerate(approx):
        x, y = pt[0]
        if i == 0:
            d.append(f'M {x} {y}')
        else:
            d.append(f'L {x} {y}')
    d.append('Z')
    svg_paths.append(' '.join(d))

all_d = ' '.join(svg_paths)
svg_content = f'''<svg width="20" height="20" viewBox="0 0 225 225" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="{all_d}" fill="#2563EB"/>
</svg>'''

with open(r'c:\Users\kerik\krytoi_site\assets\icons\max_vector.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('Updated max_vector.svg with smooth curves!')
