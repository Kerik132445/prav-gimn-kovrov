with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 264129
print(text[pos-1000:pos])
