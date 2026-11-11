with open('backend/routes/news.py', encoding='utf-8') as f:
    text = f.read()
import re
m = re.search(r'@router\.get\("/\{news_id\}"\)[\s\S]*?def [^\)]+\):', text)
if m:
    print(m.group(0))
