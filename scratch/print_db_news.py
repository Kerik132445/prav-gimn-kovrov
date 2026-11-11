import json
data = json.load(open('scratch/db_news.json', encoding='utf-8'))
for item in data:
    print(f"ID {item['id']}: {item['title']} ({item['date']}) -> {item['images']}")
