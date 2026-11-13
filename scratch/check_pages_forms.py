import re

files = ['contact.html', 'class_schedule.html', 'diary.html', 'documents.html', 'food.html', 'teachers.html']
for fn in files:
    with open(fn, 'r', encoding='utf-8') as f:
        c = f.read()
    m = re.search(r'<form class="feedback__form".*?>(.*?)</form>', c, re.DOTALL)
    if m:
        has_select = '<select' in m.group(1)
        has_checked = 'checked' in m.group(1)
        has_status = 'feedback-status' in m.group(1)
        print(f'{fn}: has_select={has_select}, has_checked={has_checked}, has_status={has_status}')
    else:
        print(f'{fn}: NO MATCH')
