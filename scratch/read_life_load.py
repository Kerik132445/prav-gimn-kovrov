with open('js/life.js', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(// =+[\r\n]+// Получение новостей с backend[\s\S]*?)(?=// =+[\r\n]+// Создание карточки новости)', text)
if m:
    print(m.group(1))
