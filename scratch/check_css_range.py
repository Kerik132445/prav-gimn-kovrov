with open('css/style.css', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
print(f'Total lines: {len(lines)}')
print('\n'.join(lines[653:736]))
