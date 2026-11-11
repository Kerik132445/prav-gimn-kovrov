with open('sveden/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

replacements = [
    ('../assets/icons/boxicons_school.svg', '../assets/icons/sveden/01_school.svg'),
    ('../assets/icons/tree.svg', '../assets/icons/sveden/02_struct.svg'),
    ('../assets/icons/file-documents.svg', '../assets/icons/sveden/03_document.svg'),
    ('../assets/icons/book-schedule.svg', '../assets/icons/sveden/04_education.svg'),
    ('../assets/icons/medal.svg', '../assets/icons/sveden/05_standarts.svg'),
    # Note: teacher-outline-regular is used for both 06 and 07, so we can replace first occurrence with 06 and second with 07
]

for old, new in replacements:
    assert old in html, f'{old} not found in sveden/index.html'
    html = html.replace(old, new, 1)

# For 06 and 07 which both had teacher-outline-regular.svg:
teacher_old = '../assets/icons/teacher-outline-regular.svg'
html = html.replace(teacher_old, '../assets/icons/sveden/06_management.svg', 1)
html = html.replace(teacher_old, '../assets/icons/sveden/07_employees.svg', 1)

# Remaining 08 to 14
more_replacements = [
    ('../assets/icons/backpack.svg', '../assets/icons/sveden/08_objects.svg'),
    ('../assets/icons/instruction.svg', '../assets/icons/sveden/09_paid_edu.svg'),
    ('../assets/icons/graph_down.svg', '../assets/icons/sveden/10_budget.svg'),
    ('../assets/icons/check.svg', '../assets/icons/sveden/11_vacant.svg'),
    ('../assets/icons/shield.svg', '../assets/icons/sveden/12_grants.svg'),
    ('../assets/icons/church.svg', '../assets/icons/sveden/13_inter.svg'),
    ('../assets/icons/apple.svg', '../assets/icons/sveden/14_catering.svg'),
]

for old, new in more_replacements:
    assert old in html, f'{old} not found in sveden/index.html'
    html = html.replace(old, new, 1)

with open('sveden/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated sveden/index.html with all 14 unified icons successfully!')
