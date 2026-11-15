with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
clubs = re.search(r'(<section class="life-clubs".*?</section>)', text, re.DOTALL)
if clubs:
    print("--- CLUBS ---")
    print(clubs.group(1)[:2000])

news = re.search(r'(<section class="school-newspaper".*?</section>)', text, re.DOTALL)
if news:
    print("--- NEWSPAPER ---")
    print(news.group(1))

camp = re.search(r'(<section class="school-camp".*?</section>)', text, re.DOTALL)
if camp:
    print("--- CAMP ---")
    print(camp.group(1))
