with open('life.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'id="clubs"' in line:
        for j in range(i, min(i + 320, len(lines))):
            print(f"{j+1}: {lines[j]}", end='')
        break
