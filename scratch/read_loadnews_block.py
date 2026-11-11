with open('js/news.js', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(// =+[\r\n]+// Загрузка новости[\s\S]*?)(?=// =+[\r\n]+// Новость не найдена)', text)
if m:
    print(m.group(1))
