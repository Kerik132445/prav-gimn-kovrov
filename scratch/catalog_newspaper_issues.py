import os
import re

pdf_dir = 'documents/newspaper'
files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
print(f"Total PDFs in folder: {len(files)}")

# Metadata catalog for all issues
issues = []
for f in sorted(files):
    size_mb = os.path.getsize(os.path.join(pdf_dir, f)) / (1024 * 1024)
    if 'витражи' in f.lower():
        issues.append({
            'file': f,
            'year': '2023',
            'num': 'Спецвыпуск',
            'title': '«Сретенские витражи»',
            'season': 'Литературно-исторический альманах',
            'desc': 'Специальный выпуск с авторскими очерками, историческими исследованиями и духовной поэзией воспитанников гимназии.',
            'is_special': True,
            'size': f"{size_mb:.1f} МБ"
        })
    elif f.startswith('Dobroe_slovo_'):
        parts = f.replace('Dobroe_slovo_', '').replace('.pdf', '').split('_')
        year = parts[0]
        num = int(parts[1]) if len(parts) > 1 else 1
        
        # Determine seasonal theme
        season = "Школьный вестник"
        desc = "Новости классов, паломнические поездки, духовные беседы и творчество гимназистов."
        if num == 1:
            season = "Рождественский выпуск"
            desc = "Праздник Рождества Христова, святочные дни и зимние традиции гимназии."
        elif num in (2, 3) and year in ('2011', '2012', '2013', '2014', '2015'):
            if num == 2:
                season = "Пасхальный выпуск"
                desc = "Светлое Христово Воскресение, весенние праздники и дела милосердия."
            elif num == 3:
                season = "Выпуск к окончанию учебного года"
                desc = "Итоги учебного года, выпускники, благодарственный молебен и летние планы."
        elif num in (4, 5, 6):
            season = "Осенний / Юбилейный выпуск"
            desc = "День знаний, престольные праздники и новые страницы школьной летописи."
        elif num >= 7:
            season = "Тематический выпуск"
            desc = "Интервью с наставниками, очерки о святых покровителях и школьные проекты."
            
        issues.append({
            'file': f,
            'year': year,
            'num': f"№ {num}",
            'title': f"«Доброе слово» № {num} ({year})",
            'season': season,
            'desc': desc,
            'is_special': False,
            'size': f"{size_mb:.1f} МБ"
        })

print(f"Cataloged {len(issues)} issues.")
for it in issues[:8]:
    print(it)
