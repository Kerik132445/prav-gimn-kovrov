import glob
from test_footer_script import update_footer

root_files = [
    'apply.html',
    'class_schedule.html',
    'contact.html',
    'dairy.html',
    'documents.html',
    'food.html',
    'life.html',
    'news.html',
    'policy.html',
    'search.html',
    'story_school.html',
    'teachers.html'
]

sveden_files = sorted(glob.glob('sveden/*.html'))

print('=== UPDATING ROOT FILES ===')
for rf in root_files:
    update_footer(rf, is_sveden=False)

print('\n=== UPDATING SVEDEN FILES ===')
for sf in sveden_files:
    if sf.replace('\\', '/') == 'sveden/index.html':
        continue
    update_footer(sf, is_sveden=True)
