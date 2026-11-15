with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('grid-template-columns: 1fr;\n\t}')
if idx == -1:
    idx = text.find('grid-template-columns: 1fr;')
print(text[idx-200:idx+200])
