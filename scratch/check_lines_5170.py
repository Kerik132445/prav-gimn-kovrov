with open('css/style.css', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(5170, min(5195, len(lines))):
    print(f'{i+1}: {lines[i]}', end='')
