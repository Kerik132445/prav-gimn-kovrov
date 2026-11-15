with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'newspaper-grid' in l:
        print(f"Line {i+1}: {l.strip()}")
        # print context
        for j in range(max(0, i-5), min(len(lines), i+8)):
            print(f"   {j+1}: {lines[j]}", end='')
        print("---------------------------")
