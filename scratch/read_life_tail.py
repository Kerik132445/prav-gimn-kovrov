with open('life.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for j in range(450, min(500, len(lines))):
    print(f"{j+1}: {lines[j]}", end='')
