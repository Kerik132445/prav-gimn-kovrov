import glob, re

root_files = [
    'apply.html',
    'class_schedule.html',
    'contact.html',
    'dairy.html',
    'documents.html',
    'food.html',
    'index.html',
    'life.html',
    'news.html',
    'policy.html',
    'search.html',
    'story_school.html',
    'teachers.html'
]
sveden_files = sorted(glob.glob('sveden/*.html'))

print('=== UPDATING FOOTER NEWS LINK IN ROOT FILES ===')
for rf in root_files:
    with open(rf, 'r', encoding='utf-8') as f:
        c = f.read()
    # Replace news.html with news.html?id=9 inside footer
    new_c = c.replace('<li><a href="news.html">Новости</a></li>', '<li><a href="news.html?id=9">Новости</a></li>')
    if new_c != c:
        with open(rf, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'UPDATED: {rf}')
    else:
        print(f'NO CHANGE / NOT FOUND: {rf}')

print('\n=== UPDATING FOOTER NEWS LINK IN SVEDEN FILES ===')
for sf in sveden_files:
    with open(sf, 'r', encoding='utf-8') as f:
        c = f.read()
    new_c = c.replace('<li><a href="../news.html">Новости</a></li>', '<li><a href="../news.html?id=9">Новости</a></li>')
    if new_c != c:
        with open(sf, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'UPDATED: {sf}')
    else:
        print(f'NO CHANGE / NOT FOUND: {sf}')
