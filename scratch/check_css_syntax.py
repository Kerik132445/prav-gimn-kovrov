with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()

# Check lines from 16250 to 16400
for i in range(16280, 16360):
    print(f"{i+1}: {lines[i]}")
