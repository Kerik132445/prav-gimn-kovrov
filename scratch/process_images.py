import os
import shutil
import glob
import re
from PIL import Image

workspace_dir = os.path.abspath('.')
assets_dir = os.path.join(workspace_dir, 'assets')
images_dir = os.path.join(assets_dir, 'images')
backup_dir = os.path.join(assets_dir, 'images_original_backup')

print(f'Starting image backup and WebP conversion...')

# 1. Create backup folder if not exists
if not os.path.exists(backup_dir):
    print(f'Creating backup directory: {backup_dir}')
    shutil.copytree(images_dir, backup_dir)
    print('Backup completed successfully!')
else:
    print('Backup directory already exists.')

# 2. Find all images to convert
# We convert images in assets/images and assets/icons that are raster (png, jpg, jpeg)
image_files = []
for ext in ['*.png', '*.jpg', '*.jpeg']:
    for f in glob.glob(f'assets/images/**/*.{ext[2:]}', recursive=True):
        if 'images_original_backup' not in f:
            image_files.append(f)
    for f in glob.glob(f'assets/icons/**/*.{ext[2:]}', recursive=True):
        # Only convert large icons/raster (like hero-bg, Ученики, etc.)
        if os.path.getsize(f) >= 50 * 1024:
            image_files.append(f)

print(f'Total raster images to convert to WebP: {len(image_files)}')

converted_map = {} # old_rel_path -> new_rel_path
total_saved = 0

for img_path in image_files:
    orig_size = os.path.getsize(img_path)
    base_name, _ = os.path.splitext(img_path)
    webp_path = base_name + '.webp'
    
    try:
        with Image.open(img_path) as im:
            # Preserve alpha for RGBA
            if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                im_conv = im.convert('RGBA')
            else:
                im_conv = im.convert('RGB')
            
            im_conv.save(webp_path, 'WEBP', quality=82, method=4)
        
        webp_size = os.path.getsize(webp_path)
        saved = orig_size - webp_size
        total_saved += saved
        
        # Save relative paths for string replacement
        rel_orig = os.path.relpath(img_path, workspace_dir).replace('\\', '/')
        rel_webp = os.path.relpath(webp_path, workspace_dir).replace('\\', '/')
        converted_map[rel_orig] = rel_webp
        
        print(f'Converted {rel_orig} ({orig_size/1024:.1f} KB -> {webp_size/1024:.1f} KB)')
    except Exception as e:
        print(f'Error converting {img_path}: {e}')

print(f'\nTotal space saved: {total_saved / 1024 / 1024:.2f} MB')

# 3. Update references in HTML and CSS
text_files = glob.glob('*.html') + glob.glob('sveden/*.html') + glob.glob('css/*.css')

updated_files_count = 0
for tf in text_files:
    with open(tf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig_content = content
    for old_path, new_path in converted_map.items():
        # Filename only or path variants
        old_filename = os.path.basename(old_path)
        new_filename = os.path.basename(new_path)
        
        # Replace full path and relative variants
        content = content.replace(old_path, new_path)
        content = content.replace(f'../{old_path}', f'../{new_path}')
        content = content.replace(f'./{old_path}', f'./{new_path}')
        
        # For CSS background-images that use relative path from css/
        # e.g. ../assets/images/...
        # Also check just filename in news or teachers
        if old_filename in content and ('assets/images/' in content or 'assets/icons/' in content):
            # precise replacement
            content = content.replace(f'assets/images/{old_filename}', f'assets/images/{new_filename}')
            content = content.replace(f'assets/icons/{old_filename}', f'assets/icons/{new_filename}')
            content = content.replace(f'../assets/images/{old_filename}', f'../assets/images/{new_filename}')
            content = content.replace(f'../assets/icons/{old_filename}', f'../assets/icons/{new_filename}')
            content = content.replace(f'./assets/images/{old_filename}', f'./assets/images/{new_filename}')
            content = content.replace(f'./assets/icons/{old_filename}', f'./assets/icons/{new_filename}')
            content = content.replace(f'images/{old_filename}', f'images/{new_filename}')

    if content != orig_content:
        with open(tf, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_files_count += 1
        print(f'Updated references in: {tf}')

print(f'Finished! Updated references in {updated_files_count} files.')
