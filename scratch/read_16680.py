with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(16680, 16760):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end='')
