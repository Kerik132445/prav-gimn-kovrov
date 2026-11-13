pages = ['index.html', 'contact.html', 'class_schedule.html', 'diary.html', 'documents.html', 'food.html', 'teachers.html']
for p in pages:
    with open(p, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f"=== {p} ===")
    for line in lines[-15:]:
        print(line, end='')
