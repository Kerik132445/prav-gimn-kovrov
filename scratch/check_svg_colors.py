import os

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
    if os.path.exists(ic):
        with open(ic, 'r', encoding='utf-8') as f:
            c = f.read()
        print(f'=== {ic} (len: {len(c)}) ===')
        print(c[:300].strip())
    else:
        print(f'MISSING: {ic}')
