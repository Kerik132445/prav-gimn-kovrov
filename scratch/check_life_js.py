with open('js/life.js', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
print(f"Total lines in js/life.js: {len(lines)}")
for i in range(len(lines)-25, len(lines)):
    print(lines[i])
