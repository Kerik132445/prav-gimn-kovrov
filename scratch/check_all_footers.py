import glob, re

root_files = ['apply.html', 'class_schedule.html', 'contact.html', 'dairy.html', 'documents.html', 'food.html', 'index.html', 'life.html', 'news.html', 'policy.html', 'search.html', 'story_school.html', 'teachers.html']
sveden_files = sorted(glob.glob('sveden/*.html'))

print('=== ROOT FILES ===')
for f in root_files:
    with open(f, encoding='utf-8') as fp:
        c = fp.read()
    # find footer
    m = re.search(r'(<footer[\s\S]*?</footer>)', c)
    if m:
        footer_text = m.group(1)
        has_fb = '<div class="footer-bottom">' in footer_text
        has_fc = '<div class="footer-copyright">' in footer_text
        print(f'{f:22} | len: {len(footer_text):5} | fb: {has_fb} | fc: {has_fc}')

print('\n=== SVEDEN FILES ===')
for f in sveden_files:
    with open(f, encoding='utf-8') as fp:
        c = fp.read()
    m = re.search(r'(<footer[\s\S]*?</footer>)', c)
    if m:
        footer_text = m.group(1)
        has_fb = '<div class="footer-bottom">' in footer_text
        has_fc = '<div class="footer-copyright">' in footer_text
        print(f'{f:22} | len: {len(footer_text):5} | fb: {has_fb} | fc: {has_fc}')
