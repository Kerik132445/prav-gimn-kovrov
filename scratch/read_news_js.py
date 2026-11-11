with open('js/news.js', encoding='utf-8') as f:
    text = f.read()

print('Length of js/news.js:', len(text))
lines = text.split('\n')
print(f'Total lines: {len(lines)}')
print('\n'.join(lines[:60]))
