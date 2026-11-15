import glob, re

for f in sorted(glob.glob('*.html') + glob.glob('sveden/*.html')):
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    m = re.findall(r'<li class="media__list-max">[\s\S]*?</li>', c)
    if m:
        lines = [l.strip() for l in m[0].splitlines() if 'img' in l or 'aria-label' in l]
        print(f"{f}: {' | '.join(lines)}")
