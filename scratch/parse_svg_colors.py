import re

icons = [
    'assets/icons/boxicons_school.svg',
    'assets/icons/tree.svg',
    'assets/icons/file-documents.svg',
    'assets/icons/book-schedule.svg',
    'assets/icons/medal.svg',
    'assets/icons/teacher-outline-regular.svg',
    'assets/icons/backpack.svg',
    'assets/icons/instruction.svg',
    'assets/icons/graph_down.svg',
    'assets/icons/check.svg',
    'assets/icons/shield.svg',
    'assets/icons/church.svg',
    'assets/icons/apple.svg'
]

for ic in icons:
    with open(ic, 'r', encoding='utf-8') as f:
        c = f.read()
    fills = re.findall(r'fill="([^"]+)"', c)
    strokes = re.findall(r'stroke="([^"]+)"', c)
    print(f'{ic}:')
    print('  fills:', set(fills))
    print('  strokes:', set(strokes))
