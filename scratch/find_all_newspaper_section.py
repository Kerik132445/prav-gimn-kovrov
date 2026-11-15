with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'РАЗДЕЛ: ШКОЛЬНАЯ ГАЗЕТА' in l or '.newspaper-section {' in l:
        print(f"Match at line {i+1}:")
        for j in range(max(0, i-2), min(len(lines), i+25)):
            print(f"  {j+1}: {lines[j]}", end='')
        print("="*40)
