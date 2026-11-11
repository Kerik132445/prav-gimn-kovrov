import glob

icons = [
    'boxicons_school.svg',
    'tree.svg',
    'file-documents.svg',
    'book-schedule.svg',
    'medal.svg',
    'teacher-outline-regular.svg',
    'backpack.svg',
    'instruction.svg',
    'graph_down.svg',
    'check.svg',
    'shield.svg',
    'church.svg',
    'apple.svg'
]

html_files = glob.glob('*.html') + glob.glob('sveden/*.html') + glob.glob('css/*.css')

for ic in icons:
    used_in = []
    for f in html_files:
        with open(f, 'r', encoding='utf-8') as fl:
            c = fl.read()
        if ic in c:
            used_in.append(f)
    print(f'{ic} used in: {used_in}')
