import json

db_news = json.load(open('scratch/db_news.json', encoding='utf-8'))
print('Generating fallback news array...')
js_code = 'const FALLBACK_NEWS = ' + json.dumps(db_news, ensure_ascii=False, indent=2) + ';\n'
with open('scratch/fallback_news.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print('Done!')
