import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('sveden/employees.html', 'r', encoding='utf-8') as f:
    text = f.read()

fios = re.findall(r'itemprop=[\'"]fio[\'"][^>]*>(.*?)<', text)
posts = re.findall(r'itemprop=[\'"]post[\'"][^>]*>(.*?)<', text)
print(f'Total teachers in sveden/employees.html: {len(fios)}')
for f, p in zip(fios[:15], posts[:15]):
    print(f'{f.strip()} -> {p.strip()}')
