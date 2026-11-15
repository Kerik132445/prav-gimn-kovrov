with open('life.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'id="newspaper"' in l:
        print("Lines before line", i+1)
        for j in range(max(0, i-40), i+2):
            print(f"  {j+1}: {lines[j]}", end='')
        break
