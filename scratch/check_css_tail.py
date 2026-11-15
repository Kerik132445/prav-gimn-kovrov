with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
print("Total lines:", len(lines))
for i in range(len(lines)-60, len(lines)):
    print(lines[i])
