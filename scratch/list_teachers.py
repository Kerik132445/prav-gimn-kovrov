import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('sveden/employees.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'<span itemprop=["\']fio["\']>(.*?)</span>', text, re.DOTALL)
for m in matches:
    name = re.sub(r'\s+', ' ', m).strip()
    print('-', name)
