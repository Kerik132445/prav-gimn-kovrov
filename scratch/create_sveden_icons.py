import os

os.makedirs('assets/icons/sveden', exist_ok=True)

# 1. 01_school.svg (Основные сведения)
with open('assets/icons/boxicons_school.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="black"', 'fill="#0284c7"').replace('fill="#000000"', 'fill="#0284c7"')
with open('assets/icons/sveden/01_school.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. 02_struct.svg (Структура и органы управления)
with open('assets/icons/tree.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#065F46"', 'fill="#0284c7"')
with open('assets/icons/sveden/02_struct.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 3. 03_document.svg (Документы)
with open('assets/icons/file-documents.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="black"', 'fill="#0284c7"').replace('fill="#000000"', 'fill="#0284c7"')
with open('assets/icons/sveden/03_document.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 4. 04_education.svg (Образование)
with open('assets/icons/book-schedule.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#065F46"', 'fill="#0284c7"')
with open('assets/icons/sveden/04_education.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 5. 05_standarts.svg (Образовательные стандарты)
with open('assets/icons/medal.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#1E3A8A"', 'fill="#0284c7"')
with open('assets/icons/sveden/05_standarts.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 6. 06_management.svg (Руководство) - crisp high-contrast manager/director icon
svg_management = '''<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 15V18M10.5 17L12 18L13.5 17" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''
with open('assets/icons/sveden/06_management.svg', 'w', encoding='utf-8') as f:
    f.write(svg_management)

# 7. 07_employees.svg (Педагогический состав) - teacher at blackboard in #0284c7
with open('assets/icons/teacher-outline-regular.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('stroke="white"', 'stroke="#0284c7"').replace('stroke="#ffffff"', 'stroke="#0284c7"')
with open('assets/icons/sveden/07_employees.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 8. 08_objects.svg (МТО и доступная среда)
with open('assets/icons/backpack.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="black"', 'fill="#0284c7"').replace('fill="#000000"', 'fill="#0284c7"')
with open('assets/icons/sveden/08_objects.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 9. 09_paid_edu.svg (Платные образовательные услуги)
with open('assets/icons/instruction.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#0F172A"', 'fill="#0284c7"')
with open('assets/icons/sveden/09_paid_edu.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 10. 10_budget.svg (ФХД)
with open('assets/icons/graph_down.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="black"', 'fill="#0284c7"').replace('fill="#000000"', 'fill="#0284c7"')
with open('assets/icons/sveden/10_budget.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 11. 11_vacant.svg (Вакантные места)
with open('assets/icons/check.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#00008B"', 'fill="#0284c7"')
with open('assets/icons/sveden/11_vacant.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 12. 12_grants.svg (Стипендии и поддержка)
with open('assets/icons/shield.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#64748B"', 'fill="#0284c7"')
with open('assets/icons/sveden/12_grants.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 13. 13_inter.svg (Международное сотрудничество)
with open('assets/icons/church.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#00008B"', 'fill="#0284c7"')
with open('assets/icons/sveden/13_inter.svg', 'w', encoding='utf-8') as f:
    f.write(c)

# 14. 14_catering.svg (Организация питания)
with open('assets/icons/apple.svg', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('fill="#1E3A8A"', 'fill="#0284c7"')
with open('assets/icons/sveden/14_catering.svg', 'w', encoding='utf-8') as f:
    f.write(c)

print('Generated all 14 unified sveden icons in assets/icons/sveden/')
