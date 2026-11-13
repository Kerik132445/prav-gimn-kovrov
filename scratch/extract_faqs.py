import re

pages = [
    'index.html',
    'contact.html',
    'class_schedule.html',
    'diary.html',
    'documents.html',
    'food.html',
    'teachers.html'
]

for p in pages:
    print(f"\n==========================================")
    print(f"PAGE: {p}")
    print(f"==========================================")
    with open(p, 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    print("Title:", title_match.group(1).strip() if title_match else "No title")

    # Extract FAQ items
    faqs = re.findall(r'<details class="faq__item".*?<summary class="faq__question">(.*?)</summary>.*?<p class="faq__answer">(.*?)</p>', html, re.DOTALL)
    if not faqs:
        # try without class
        faqs = re.findall(r'<details.*?>\s*<summary.*?>(.*?)</summary>\s*<p.*?>(.*?)</p>', html, re.DOTALL)
    print(f"Found {len(faqs)} FAQ items:")
    for q, a in faqs:
        q_clean = re.sub(r'\s+', ' ', q).strip()
        a_clean = re.sub(r'\s+', ' ', a).strip()
        print(f"  Q: {q_clean}")
        print(f"  A: {a_clean[:100]}...")
