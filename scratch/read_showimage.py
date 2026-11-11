with open('js/news.js', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(345, min(375, len(lines))):
    print(f'{i+1}: {lines[i]}', end='')
