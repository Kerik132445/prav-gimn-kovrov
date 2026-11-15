with open('js/life.js', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
for i in range(len(lines)-35, len(lines)):
    print(lines[i])
