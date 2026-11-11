import glob, re

for f in glob.glob('*.html') + glob.glob('sveden/*.html'):
    with open(f, 'r', encoding='utf-8') as fl:
        c = fl.read()
    # find images in assets/images that are still .png or .jpg
    matches = re.findall(r'assets/images/[^\'\"\s>]+\.(?:png|jpg|jpeg)', c, re.IGNORECASE)
    if matches:
        print(f'{f}: {set(matches)}')
